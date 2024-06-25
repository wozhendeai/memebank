import React from 'react';
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer, Typography, styled, IconButton, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import LogoutIcon from '@mui/icons-material/Logout';
import { Badge, ShoppingBag, ContentCopy, CheckCircle } from '@mui/icons-material';

const DrawerContainer = styled(Box)(() => ({
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
}));

const StyledBox = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
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

const AccountHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
}));

const AccountName = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
}));

const InfoBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%',
    boxSizing: 'border-box',
}));

const AddressBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const BalanceBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap',
}));

interface SettingsDrawerProps {
    isOpen: boolean;
    toggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, toggleDrawer }) => {
    const navigate = useNavigate();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const handleLogout = () => {
        disconnect();
        navigate('/');
    };

    const handleCopyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            // TODO: add a toast notification here
        }
    };

    const drawerContent = () => (
        <StyledBox>
            <AccountHeader>
                <AccountName variant="h6">@critch</AccountName>
                <Chip
                    icon={<CheckCircle />}
                    label="Verified"
                    color="primary"
                    size="small"
                />
            </AccountHeader>

            <InfoBox>
                <AddressBox>
                    <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No address'}
                    </Typography>
                    <IconButton onClick={handleCopyAddress} size="small">
                        <ContentCopy fontSize="small" />
                    </IconButton>
                </AddressBox>
                <Divider sx={{ my: 1 }} />
                <BalanceBox>
                    <Typography variant="body2">Balance:</Typography>
                    <Typography variant="body2" fontWeight="bold">0.015 ETH</Typography>
                </BalanceBox>
            </InfoBox>

            <List>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <Badge />
                        </ListItemIcon>
                        <ListItemText primary="Verify" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <ShoppingBag />
                        </ListItemIcon>
                        <ListItemText primary="Withdraw" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </StyledBox>
    );

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={isOpen}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
            disableSwipeToOpen={false}
        >
            <DrawerContainer>
                <Puller />
                {drawerContent()}
            </DrawerContainer>
        </SwipeableDrawer>
    );
};

export default SettingsDrawer;