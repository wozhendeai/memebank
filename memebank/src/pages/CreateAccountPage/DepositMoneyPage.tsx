import { useState } from 'react';
import { Container, Box, Paper, TextField, Button, InputAdornment, Typography, Modal, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { useAccount, useSwitchChain, } from 'wagmi';
// import { erc20Abi, parseUnits } from 'viem';
import { Link, useNavigate, } from 'react-router-dom';
import { useCallsStatus, useWriteContracts } from 'wagmi/experimental'
import { base } from 'viem/chains';
import { contracts } from '../../contracts/contracts';
import { erc20Abi, parseUnits } from 'viem';
import { useNewAccountAddress } from '../../hooks/useNewAccountAddress';
import { ComponentAccountType } from '../../types';

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

const DepositMoneyPage = ({ selectedAccountType }: { selectedAccountType: ComponentAccountType }) => {
    const navigate = useNavigate();
    const { address, chainId } = useAccount();
    const { switchChainAsync } = useSwitchChain()
    const { data: writeContractData, writeContractsAsync, isPending: writeContractIsPending, isSuccess } = useWriteContracts();
    const { newAccountAddress, loading: newAccountAddressLoading } = useNewAccountAddress(selectedAccountType);

    const [accountName, setAccountName] = useState('Default Name');
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [confirmedModalOpen, setConfirmedModalOpen] = useState(false);

    const { data: callsStatus } = useCallsStatus({
        id: writeContractData as string,
        query: {
            enabled: !!writeContractData,
            // Poll every second until the calls are confirmed
            refetchInterval: (data) =>
                data.state.data?.status === "CONFIRMED" ? false : 1000,
        },
    });

    const isLoading = newAccountAddressLoading || writeContractIsPending || (callsStatus?.status === 'PENDING');
    // const isError = writeContractError || newAccountAddressError;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
        setAmountError(Number(value) <= 0);
    };

    const handleOpenReviewModal = () => {
        setReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        if (!isLoading) {
            setReviewModalOpen(false);
        }
    };


    const handleCloseConfirmedModal = () => {
        setConfirmedModalOpen(false);
        navigate('/home', { replace: true });
    }

    const handleCreateAccount = async () => {
        if (!address) return;
        if (chainId !== base.id) {
            await switchChainAsync({ chainId: base.id });
        }

        const amountToSend = parseUnits(amount, 6); // USDC has 6 decimal places

        // Trigger the transactions
        // TODO: Check 
        if (newAccountAddress)
            await writeContractsAsync({
                contracts: [
                    {
                        address: contracts.AccountFactory.address,
                        abi: contracts.AccountFactory.abi,
                        functionName: "createAccount",
                        args: [selectedAccountType.strategyId]
                    },
                    {
                        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract address
                        abi: erc20Abi,
                        functionName: "approve",
                        args: [newAccountAddress, amountToSend],
                    },
                    {
                        address: newAccountAddress,
                        abi: contracts.Account.abi,
                        functionName: "modifyCollateralZap",
                        args: [amountToSend],
                    }
                ]
            });
        if (isSuccess) {
            console.log('Setting open!')
            setConfirmedModalOpen(true);
        }
    };

    // TODO: Redirect to homescreen
    // TODO: Test when we update contracts [when we add strategy types]
    // useEffect(() => {
    //     console.log(`newAccountAddressError: ` + newAccountAddressError)
    //     console.log(`write error: ` + error)
    // }, [error, newAccountAddressError]);

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
                            autoFocus
                            InputProps={{
                                endAdornment: <InputAdornment position="end">USDC</InputAdornment>,
                            }}
                            variant="outlined"
                            label="Enter Amount"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            error={amountError}
                            helperText={amountError ? "Amount must be greater than zero." : ""}
                        />
                    </InputBox>
                </FormContainer>
                <Typography variant="body2" color="textSecondary" mt={2}>
                    If you do not have enough USDC in your wallet, you can either transfer on-chain or pay with your Coinbase balance. <Link target="_blank" to='https://help.coinbase.com/en/wallet/getting-started/smart-wallet'>Learn more here</Link>
                </Typography>
                <ContinueButton fullWidth variant="contained" onClick={handleOpenReviewModal}>
                    Continue
                </ContinueButton>
            </Content>
            {/* Review Transaction Modal */}
            <Modal open={reviewModalOpen} onClose={handleCloseReviewModal}>
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
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                    <Typography variant="body2" color="textSecondary">
                        {callsStatus && <div> Status: {callsStatus.status}</div>}
                    </Typography>
                </ModalContainer>
            </Modal>
            {/* Transaction Confirmed Modal TODO: Make flow better*/}
            <Modal open={confirmedModalOpen} onClose={handleCloseConfirmedModal}>
                <ModalContainer>
                    <Typography variant="h5" fontWeight="bold" mb={2}>
                        Confirmed!
                    </Typography>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleCloseConfirmedModal}
                        sx={{ padding: 2, borderRadius: 2, color: 'black', borderColor: 'black' }}
                        disabled={isLoading}
                    >
                        Return to Home Page
                    </Button>
                </ModalContainer>
            </Modal>
        </Root>
    );
};

export default DepositMoneyPage;