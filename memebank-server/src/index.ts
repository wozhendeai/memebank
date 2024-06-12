import express, { Request, Response } from 'express';
import session from 'express-session';
import { SiweMessage, generateNonce, SiweErrorType, SiweError, checkContractWalletSignature } from 'siwe';
import cors from 'cors';
import { Address, verifyMessage } from 'viem';
import { publicClient } from './viem';

interface SessionData extends session.Session {
    nonce?: string;
    siwe?: SiweMessage;
}

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // TODO: Adjust to frontend origin
    credentials: true,
}));

app.use(session({
    name: 'siwe-quickstart',
    secret: "siwe-quickstart-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true }
}));

const getSessionData = (req: Request): SessionData => {
    return req.session as SessionData;
}

app.get('/nonce', async (req: Request, res: Response) => {
    const sessionData = getSessionData(req);
    sessionData.nonce = generateNonce();
    console.log(sessionData.nonce);
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(sessionData.nonce);
});

app.post('/verify', async (req: Request, res: Response) => {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }

        // Construct SIWE obj from what was given
        const siweMessage = new SiweMessage(req.body.message);

        // Retrieve saved nonce from session data
        const sessionData = getSessionData(req);
        const sessionNonce = sessionData.nonce;

        // Ensure nonce is correct
        if (sessionNonce !== siweMessage.nonce) {
            throw new SiweError(SiweErrorType.INVALID_SIGNATURE);
        }

        // Check if signature is valid 
        const isValidSignature = await publicClient.verifyMessage({
            address: (siweMessage.address as Address),
            message: siweMessage.prepareMessage(),
            signature: req.body.signature
        })

        if (!isValidSignature) {
            throw new SiweError(SiweErrorType.INVALID_SIGNATURE);
        }

        sessionData.siwe = siweMessage;
        req.session.cookie.expires = siweMessage.expirationTime ? new Date(siweMessage.expirationTime) : undefined;
        req.session.save(() => res.status(200).json({
            message: 'Signature verification successful',
            address: siweMessage.address,
            expirationTime: siweMessage.expirationTime,
            issuedAt: siweMessage.issuedAt,
            uri: siweMessage.uri
        }));
    } catch (e) {
        const sessionData = getSessionData(req);
        sessionData.siwe = undefined;
        sessionData.nonce = undefined;
        console.error(e);

        let errorMessage = 'Unknown error occurred';
        let errorCode = 500;

        if (e instanceof SiweError) {
            errorMessage = e.type;
            if (e.type === SiweErrorType.EXPIRED_MESSAGE || e.type === SiweErrorType.INVALID_SIGNATURE) {
                errorCode = 422;
            }
        }

        req.session.save(() => res.status(errorCode).json({ message: errorMessage }));
    }
});

app.get('/personal_information', (req: Request, res: Response) => {
    const sessionData = getSessionData(req);
    if (!sessionData.siwe) {
        res.status(401).json({ message: 'You have to first sign in' });
        return;
    }
    console.log('User is authenticated!');
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${sessionData.siwe.address}`);
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
