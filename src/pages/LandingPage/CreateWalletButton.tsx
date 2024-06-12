import { useCallback } from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/system';
import { useConnect } from 'wagmi';

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

function CreateWalletButton() {
    const { connect, connectors } = useConnect();

    const createWallet = useCallback(() => {
        const coinbaseWalletConnector = connectors.find(
            (connector) => connector.id === 'coinbaseWalletSDK'
        );
        if (coinbaseWalletConnector) {
            console.log('Trying to connect');
            connect({ connector: coinbaseWalletConnector });
        } else {
            console.log('Not found');
        }
    }, [connectors, connect]);

    return (
        <>
            <StyledButton variant="contained" color="primary" onClick={createWallet}>
                {'Create Wallet'}
            </StyledButton>
        </>
    );
}

export default CreateWalletButton