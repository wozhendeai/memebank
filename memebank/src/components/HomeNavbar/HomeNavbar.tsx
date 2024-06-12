import { useState, MouseEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, styled, Box, IconButton } from '@mui/material';
import { SwipeableDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { useDisconnect } from 'wagmi';

const Navigation = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    backgroundColor: '#fff',
}));

const SettingsDrawer = ({ isOpen, toggleDrawer }: { isOpen: boolean, toggleDrawer: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void }) => {
    const navigate = useNavigate();
    const { disconnect } = useDisconnect()

    // We shouldn't have to check if a user is disconnected as they shouldn't be on this page
    const handleLogout = () => {
        disconnect();
        navigate('/');
    };

    const drawerList = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem key="logout" disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
        </Box>
    );

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={isOpen}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
        >
            {drawerList()}
        </SwipeableDrawer>
    );
};

function HomeNavbar() {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' && ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <Navigation>
                <IconButton onClick={() => navigate('/home')}>
                    <HomeIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/create')}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={toggleDrawer(true)}>
                    <MenuIcon />
                </IconButton>
            </Navigation>
            <SettingsDrawer isOpen={drawerOpen} toggleDrawer={toggleDrawer} />
        </Paper>
    );
}

export default HomeNavbar;