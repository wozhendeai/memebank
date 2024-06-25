import React, { useState } from 'react';
import {
    SwipeableDrawer,
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    TextField,
    InputAdornment,
    Grid,
    CircularProgress,
    styled,
    Paper,
    Link
} from '@mui/material';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWriteContracts, useCallsStatus } from 'wagmi/experimental';
import { base } from 'viem/chains';
import { erc20Abi, parseUnits } from 'viem';
import { contracts } from '../../contracts/contracts';
import { useNewAccountAddress } from '../../hooks/useNewAccountAddress';
import { ComponentAccountType, accountTypes } from '../../types';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DrawerContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StepContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2, 0),
}));

const AccountTypeCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const RoundedTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 2,
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

const ContinueButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: '1.25rem',
    '&:hover': {
        backgroundColor: theme.palette.grey[800],
    },
}));

const Puller = styled('div')(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
}));

const steps = ['Select Account Type', 'Enter Details', 'Review & Confirm'];

interface CreateAccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateAccountDrawer: React.FC<CreateAccountDrawerProps> = ({ isOpen, onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedAccountType, setSelectedAccountType] = useState<ComponentAccountType | null>(null);
    const [accountName, setAccountName] = useState('Default Account'); // TODO: use a random name generator
    const [amount, setAmount] = useState('');
    const { address, chainId } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { writeContractsAsync, isPending: writeContractIsPending, isSuccess, data: writeContractData } = useWriteContracts();
    const { newAccountAddress, loading: newAccountAddressLoading } = useNewAccountAddress(selectedAccountType ? selectedAccountType : accountTypes[0]);
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

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleCreateAccount = async () => {
        if (!address || !selectedAccountType || !newAccountAddress) return;

        if (chainId !== base.id) {
            await switchChainAsync({ chainId: base.id });
        }

        const amountToSend = parseUnits(amount, 6); // USDC has 6 decimal places

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
            handleNext();
        }
    };

    const handleAccountTypeSelect = (accountType: ComponentAccountType) => {
        setSelectedAccountType(accountType);
        handleNext();
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        {accountTypes.map((accountType, index) => (
                            <Grid item xs={12} key={index}>
                                <AccountTypeCard onClick={() => handleAccountTypeSelect(accountType)}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" >
                                            <accountType.icon fontSize="large" color="primary" />
                                            <Box ml={2}>
                                                <Typography variant="h6">{accountType.title}</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {accountType.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <ArrowForwardIcon />
                                    </Box>
                                </AccountTypeCard>
                            </Grid>
                        ))}
                    </Grid>
                );
            case 1:
                return (
                    <Box>
                        <RoundedTextField
                            fullWidth
                            label="Account Name"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            margin="normal"
                        />
                        <RoundedTextField
                            fullWidth
                            required
                            autoFocus
                            InputProps={{
                                endAdornment: <InputAdornment position="end">USDC</InputAdornment>,
                            }}
                            label="Enter Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            margin="normal"
                        />
                        <Typography variant="body2" color="textSecondary" mt={2}>
                            If you do not have enough USDC in your wallet, you can either transfer on-chain or pay with your Coinbase balance. <Link href="https://help.coinbase.com/en/wallet/getting-started/smart-wallet" target="_blank" rel="noopener">Learn more here</Link>
                        </Typography>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <ContinueButton onClick={handleNext} fullWidth>
                            Continue
                        </ContinueButton>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Review Your Account Information</Typography>
                        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, mb: 2 }}>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body1" fontWeight="bold">Name Of Plan</Typography>
                                    <Typography variant="body1">{accountName}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body1" fontWeight="bold">Deposit Amount</Typography>
                                    <Typography variant="body1">{amount} USDC</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body1" fontWeight="bold">Type</Typography>
                                    <Typography variant="body1">{selectedAccountType?.title}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                        <Typography variant="body2" color="textSecondary" mt={2}>
                            You can pay with your Coinbase balance by clicking the gear icon when prompted to submit the transaction.
                        </Typography>
                        <ContinueButton onClick={handleCreateAccount} disabled={isLoading} fullWidth>
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                        </ContinueButton>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={isOpen}
            onClose={onClose}
            onOpen={() => { }}
            disableSwipeToOpen
        >
            <DrawerContent>
                <Puller />
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <StepContent>
                    {getStepContent(activeStep)}
                </StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                </Box>
            </DrawerContent>
        </SwipeableDrawer>
    );
};

export default CreateAccountDrawer;