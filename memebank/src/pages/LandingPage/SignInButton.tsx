/**
 * SIWE implementation
 * - I'm not sure if this is even needed. Leaving it here in the event I decide to use it.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useSignMessage, useAccount, useSwitchChain } from 'wagmi';
import { SiweMessage } from 'siwe';
import type { Hex } from 'viem';
import { baseSepolia } from 'viem/chains';

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(2),
    minWidth: '150px',
    padding: theme.spacing(1.5),
    fontSize: '1.2rem',
    backgroundColor: '#002A5C',
    color: '#FFFFFF',
    '&:hover': {
        backgroundColor: '#004080',
    },
}));

const SignInButton = () => {
    const navigate = useNavigate();
    const [signature, setSignature] = useState<Hex | undefined>(undefined);
    const [valid, setValid] = useState<boolean | undefined>(undefined);
    const [nonce, setNonce] = useState<string | null>(null);
    const { address, isConnected, chain } = useAccount();
    const { switchChain } = useSwitchChain()
    const { signMessageAsync } = useSignMessage({ mutation: { onSuccess: (sig) => setSignature(sig) } });

    // Fetch nonce from backend
    const fetchNonce = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/nonce', {
                credentials: 'include' // Ensure cookies are included in the request
            });

            if (!response.ok) {
                throw new Error('Failed to fetch nonce');
            }

            const nonce = await response.text();
            setNonce(nonce);
        } catch (error) {
            console.error('Error fetching nonce:', error);
        }
    }, []);

    useEffect(() => {
        if (chain !== baseSepolia) {
            switchChain({
                chainId: baseSepolia.id
            })
        }
        if (isConnected) {
            fetchNonce();
        }
    }, [isConnected, fetchNonce, chain, switchChain]);

    const message = useMemo(() => {
        if (!address || !nonce) return null;
        return new SiweMessage({
            domain: document.location.host,
            address: address!,
            chainId: chain?.id,
            uri: document.location.origin,
            version: '1',
            statement: 'Sign in with Ethereum to the app.',
            nonce: nonce,
        });
    }, [address, nonce, chain?.id]);

    const checkValid = useCallback(async () => {
        if (!signature || !address || !message) return;

        try {
            const response = await fetch('http://localhost:3000/verify', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, signature }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to verify message');
            }

            const data = await response.json();
            setValid(data.ok);
            if (data.ok) {
                navigate('/home', { replace: true });
            }
        } catch (error) {
            console.error('Verification error:', error);
        }
    }, [signature, address, message, navigate]);

    useEffect(() => {
        if (signature) {
            checkValid();
        }
    }, [signature, checkValid]);

    const promptToSign = async () => {
        if (isConnected && message) {
            await signMessageAsync({ message: message.prepareMessage() });
        }
    };

    return (
        <>
            <StyledButton variant="contained" color="primary" onClick={promptToSign}>
                {'Sign In'}
            </StyledButton>
            {signature && (
                <Box mt={2}>
                    <Typography variant="body1">Signature: {signature}</Typography>
                </Box>
            )}
            {valid !== undefined && (
                <Box mt={2}>
                    <Typography variant="body1">Is valid: {valid.toString()}</Typography>
                </Box>
            )}
        </>
    );
};

export default SignInButton;
