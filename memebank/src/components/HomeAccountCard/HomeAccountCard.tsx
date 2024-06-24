import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Menu, MenuItem, Modal } from '@mui/material';
import { styled } from '@mui/system';
import { Settings } from '@mui/icons-material';
import { AccountData, accountTypes } from '../../types';
import AccountActionForm from '../AccountActionForm/AccountActionForm';

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

const HomeAccountCard = ({ address: accountAddress, accountId, totalBalance, strategyType }: AccountData) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleActionClick = (action: 'deposit' | 'withdraw') => {
        setActionType(action);
        setModalOpen(true);
        handleMenuClose();
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleActionSuccess = () => {
        // Handle successful action (e.g., refresh balance)
        handleModalClose();
    };

    return (
        <>
            {/* Display Accounts */}
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
            {/* Deposit, Withdraw  */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleActionClick('deposit')}>
                    Deposit
                </MenuItem>
                <MenuItem onClick={() => handleActionClick('withdraw')}>
                    Withdraw
                </MenuItem>
            </Menu>
            <Modal open={modalOpen} onClose={handleModalClose}>
                <ModalContainer>
                    <AccountActionForm
                        accountAddress={accountAddress}
                        accountId={accountId}
                        action={actionType}
                        onSuccess={handleActionSuccess}
                        onCancel={handleModalClose}
                    />
                </ModalContainer>
            </Modal>
        </>
    );
};

export default HomeAccountCard;