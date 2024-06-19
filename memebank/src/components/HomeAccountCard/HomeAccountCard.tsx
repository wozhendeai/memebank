import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { QuestionMark, Settings } from '@mui/icons-material';
import { AccountData, accountTypes } from '../../types';
import { useReadContract } from 'wagmi';
import { contracts } from '../../contracts/contracts';

const AccountCardContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    margin: theme.spacing(1),
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    height: 'auto',
    flexGrow: 1,
    flexBasis: 'calc(50% - 32px)',
    [theme.breakpoints.down('sm')]: {
        flexBasis: 'calc(100% - 32px)',
    },
}));

const HomeAccountCard = ({ accountId, totalBalance, strategyType }: AccountData) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data: openPositionsData, } = useReadContract({
        address: contracts.PerpsMarketProxy.address,
        abi: contracts.PerpsMarketProxy.abi,
        functionName: "getAccountOpenPositions",
        args: [accountId],
        query: {
            enabled: !!accountId
        }
    })
    console.log(openPositionsData);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeposit = () => {
        // call `modifyCollateral`

    }

    const handleWithdraw = () => {
        // Get all positions

        // If any, close all positions

        // Withdraw collaterall
    }

    return (
        <>
            <AccountCardContainer>
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">{accountTypes[strategyType].title}</Typography>
                    <IconButton onClick={handleMenuOpen}>
                        <Settings />
                    </IconButton>
                </Box>
                <Typography variant="h5">${totalBalance}</Typography>
                <Typography variant="body2" color="textSecondary">
                    Some more details here
                </Typography>
            </AccountCardContainer>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {/* TODO: Fix tooltips */}
                <MenuItem onClick={handleDeposit}>
                    Deposit
                    <Tooltip disableFocusListener title="Deposit into strategy" placement="top-start">
                        <IconButton>
                            <QuestionMark />
                        </IconButton>
                    </Tooltip>
                </MenuItem>
                <MenuItem onClick={handleWithdraw}>
                    Withdraw
                    <Tooltip disableFocusListener title="Withdraw from strategy" placement="top-start">
                        <IconButton>
                            <QuestionMark />
                        </IconButton>
                    </Tooltip>
                </MenuItem>
            </Menu>
        </>
    );
};

export default HomeAccountCard;
