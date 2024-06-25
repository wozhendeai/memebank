import { useState, MouseEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, styled, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsDrawer from './SettingsDrawer';

const Navigation = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    backgroundColor: '#fff',
}));


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