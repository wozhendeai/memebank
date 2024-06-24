import React, { useEffect, useState } from 'react';
import { Box, Paper, TextField, Button, InputAdornment, Typography, CircularProgress, ButtonGroup } from '@mui/material';
import { styled } from '@mui/system';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { base } from 'viem/chains';
import { contracts } from '../../contracts/contracts';
import { Link } from 'react-router-dom';
import { useWriteContracts } from 'wagmi/experimental';

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
    borderRadius: theme.shape.borderRadius * 2,
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

const PercentageButtonGroup = styled(ButtonGroup)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    '& .MuiButton-root': {
        flex: 1,
    },
}));

interface AccountActionFormProps {
    accountAddress: `0x${string}`;
    accountId: bigint;
    action: 'deposit' | 'withdraw';
    onSuccess: () => void;
    onCancel: () => void;
}

const AccountActionForm: React.FC<AccountActionFormProps> = ({ accountAddress, action, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState(false);
    const [withdrawableAmount, setWithdrawableAmount] = useState<bigint>(BigInt(0));
    const [percentage, setPercentage] = useState<number>(0);
    const { address, chainId } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { writeContractsAsync, isPending: isLoading, isSuccess } = useWriteContracts();

    // Read the withdrawable amount
    const { data: withdrawableAmountData } = useReadContract({
        address: accountAddress,
        abi: contracts.Account.abi,
        functionName: "getTotalAccountBalance",
        args: [],
    });

    useEffect(() => {
        if (withdrawableAmountData) {
            setWithdrawableAmount(BigInt(withdrawableAmountData.toString()));
        }
    }, [withdrawableAmountData]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAmount(value);
        setAmountError(Number(value) <= 0);
        if (action === 'withdraw' && withdrawableAmount > 0) {
            const percentage = (Number(amount) / Number(withdrawableAmount)) * 100;
            setPercentage(Math.min(percentage, 100));
        }
    };

    const handlePercentageButtonClick = (newPercentage: number) => {
        setPercentage(newPercentage);
        const newAmount = (BigInt(newPercentage) * withdrawableAmount) / BigInt(100);
        setAmount(formatUnits(newAmount, 18));
    };

    const handleAction = async () => {
        if (!address) return;
        if (chainId !== base.id) {
            await switchChainAsync({ chainId: base.id });
        }


        try {
            if (action === 'deposit') {
                const amountToSend = parseUnits(amount, 6);
                await writeContractsAsync({
                    contracts: [
                        {
                            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                            abi: erc20Abi,
                            functionName: "approve",
                            args: [accountAddress, amountToSend],
                        },
                        {
                            address: accountAddress,
                            abi: contracts.Account.abi,
                            functionName: "modifyCollateralZap",
                            args: [amountToSend],
                        }
                    ]
                });
            } else {
                const amountToSend = parseUnits(amount, 18);
                await writeContractsAsync({
                    contracts: [
                        {
                            address: accountAddress,
                            abi: contracts.Account.abi,
                            functionName: "modifyCollateralZap",
                            args: [-amountToSend],
                        }
                        // Call withdraw token based on expected amount received
                    ]
                });
            }
            if (isSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(`${action} failed:`, error);
        }
    };

    return (
        <Content>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                {action === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </Typography>
            <FormContainer>
                <InputBox>
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
                    {action === 'withdraw' && (
                        <>
                            <PercentageButtonGroup>
                                {[25, 50, 75, 100].map((percent) => (
                                    <Button
                                        key={percent}
                                        onClick={() => handlePercentageButtonClick(percent)}
                                        variant={percentage === percent ? 'contained' : 'outlined'}
                                    >
                                        {percent}%
                                    </Button>
                                ))}
                            </PercentageButtonGroup>
                        </>
                    )}
                </InputBox>
            </FormContainer>
            {action === 'withdraw' && (
                <Typography variant="body2" color="textSecondary" mb={1}>
                    Withdrawable Amount: {formatUnits(withdrawableAmount, 18)} USDC
                </Typography>
            )}
            {action === 'deposit' && (
                <Typography variant="body2" color="textSecondary" mt={2}>
                    If you do not have enough USDC in your wallet, you can either transfer on-chain or pay with your Coinbase balance. <Link target="_blank" to='https://help.coinbase.com/en/wallet/getting-started/smart-wallet'>Learn more here</Link>
                </Typography>
            )}
            <ContinueButton fullWidth variant="contained" onClick={handleAction} disabled={isLoading || amountError}>
                {isLoading ? <CircularProgress size={24} color="inherit" /> : (action === 'deposit' ? 'Deposit' : 'Withdraw')}
            </ContinueButton>
        </Content>
    );
};

export default AccountActionForm;

