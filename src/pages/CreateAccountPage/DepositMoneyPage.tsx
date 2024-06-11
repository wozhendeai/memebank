import { useState } from 'react';
import { Container, Box, Typography, Paper, TextField, Button, InputAdornment } from '@mui/material';
import { styled } from '@mui/system';

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

const DepositMoneyPage = () => {

    const [accountName, setAccountName] = useState('');
    const [amount, setAmount] = useState('');

    const handleContinueClick = () => {
        // Handle continue click logic here
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
                    Your interest rate would be 10% per annum expected outcome would be 880,000 NGN if you select a yearly savings plan
                </Typography>
                <ContinueButton fullWidth variant="contained" onClick={handleContinueClick}>
                    Continue
                </ContinueButton>
            </Content>
        </Root>
    );
};

export default DepositMoneyPage;


/**
                <FormContainer>
                    <InputBox>
                        <Box display="flex" gap={1}>
                            <RoundedTextField
                                variant="outlined"
                                label="Enter Savings Duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                fullWidth
                            />
                            <RoundedTextField
                                select
                                variant="outlined"
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="Days">Days</MenuItem>
                                <MenuItem value="Months">Months</MenuItem>
                                <MenuItem value="Years">Years</MenuItem>
                            </RoundedTextField>
                        </Box>
                    </InputBox>
                </FormContainer>
                <FormContainer>
                    <Typography variant="body2" fontWeight="bold" mt={2} mb={1} align="left">
                        Saving Schedule
                    </Typography>
                    <ToggleButtonGroup
                        value={schedule}
                        exclusive
                        onChange={(e, newSchedule) => setSchedule(newSchedule)}
                        fullWidth
                    >
                        <ToggleButton value="Daily">Daily</ToggleButton>
                        <ToggleButton value="Monthly">Monthly</ToggleButton>
                        <ToggleButton value="Yearly">Yearly</ToggleButton>
                    </ToggleButtonGroup>
                </FormContainer>
                <Typography variant="body2" color="textSecondary" mt={2}>
                    Your wallet will be debited N57,142 daily for 14 days and you’ll be notified once you reach your savings target.
                </Typography>
 */