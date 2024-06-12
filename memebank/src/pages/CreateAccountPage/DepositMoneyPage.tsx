import { useState } from 'react';
import { Container, Box, Typography, Paper, TextField, Button, InputAdornment, Modal } from '@mui/material';
import { styled } from '@mui/system';
import { SvgIconComponent } from '@mui/icons-material';

const Root = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: '#F0F2F5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    boxSizing: 'border-box',
}));

const Content = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    gap: theme.spacing(2),
}));

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: '500px',
    boxSizing: 'border-box',
    borderRadius: theme.shape.borderRadius * 2, // Increased border radius for more rounding
    // boxShadow: theme.shadows[2],
}));

const InputBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const ContinueButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2, // Increased border radius for more rounding
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: '1.25rem', // Increased font size
    '&:hover': {
        backgroundColor: theme.palette.grey[800],
    },
}));

const RoundedTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 2, // Increased border radius for more rounding
        '& fieldset': {
            borderColor: 'transparent',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.divider,
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
}));

const ModalContainer = styled(Box)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
    box-shadow: 24;
    padding: ${({ theme }) => theme.spacing(4)};
    box-sizing: border-box;
`;

interface AccountType {
    title: string;
    description: string;
    icon: SvgIconComponent;
}

const DepositMoneyPage = ({ selectedAccountType }: { selectedAccountType: AccountType }) => {

    const [accountName, setAccountName] = useState('');
    const [amount, setAmount] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setAccountName(`Default Name`);
        setModalOpen(true);
    };
    const handleCloseModal = () => setModalOpen(false);

    const handleCreateAccount = async () => {
        // Initiate TX
        // const wallet = wallets[0];
        // const provider = await wallet.getEthereumProvider();
        // console.log(wallet)
        // const transactionRequest = {
        //   to: '0xc8e5C4eeED08450FD5D5A2BC0450722d399A251C',
        //   value: 100000, // Only necessary for payable methods
        // };
        // const transactionHash = await provider.request({
        //   method: 'eth_sendTransaction',
        //   params: [transactionRequest],
        // });
        // console.log(transactionHash)

        // Finally, close modal
        setModalOpen(false);
    };

    return (
        <Root>
            <Content>
                <FormContainer>
                    <InputBox>
                        <RoundedTextField
                            fullWidth
                            variant="outlined"
                            label="Name of Account"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                        />
                        <RoundedTextField
                            fullWidth
                            required
                            InputProps={{
                                endAdornment: <InputAdornment position="end">USDC</InputAdornment>,
                            }}
                            variant="outlined"
                            label="Enter Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </InputBox>
                </FormContainer>
                <Typography variant="body2" color="textSecondary" mt={2}>
                    A Coinbase account with the amount inputted is required to use this app.
                </Typography>
                <ContinueButton fullWidth variant="contained" onClick={handleOpenModal}>
                    Continue
                </ContinueButton>
            </Content>
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <ModalContainer>
                    <Typography variant="h5" fontWeight="bold" mb={2}>
                        Review Your Account Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                        Look through your account information and make sure all the information is correct.
                    </Typography>
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, mb: 2 }}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body1" fontWeight="bold">Name Of Plan</Typography>
                                <Typography variant="body1">{accountName}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body1" fontWeight="bold">Deposit Amount</Typography>
                                <Typography variant="body1">{amount}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body1" fontWeight="bold">Type</Typography>
                                <Typography variant="body1">{selectedAccountType.title}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleCreateAccount}
                        sx={{ marginBottom: 2, padding: 2, borderRadius: 2, backgroundColor: 'black', color: 'white' }}
                    >
                        Create Account
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleCloseModal}
                        sx={{ padding: 2, borderRadius: 2, color: 'black', borderColor: 'black' }}
                    >
                        Go Back
                    </Button>
                </ModalContainer>
            </Modal>
        </Root>
    );
};

export default DepositMoneyPage;