import { useState, MouseEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, styled, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsDrawer from './SettingsDrawer';
import CreateAccountDrawer from './CreateAccountDrawer';

const Navigation = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    backgroundColor: '#fff',
}));


function HomeNavbar() {
    const navigate = useNavigate();
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
    const [isCreateAccountDrawerOpen, setIsCreateAccountDrawerOpen] = useState(false);
  
    const toggleSettingsDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (event && event.type === 'keydown' && ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) {
            return;
        }
        setSettingsDrawerOpen(open);
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <Navigation>
                <IconButton onClick={() => navigate('/home')}>
                    <HomeIcon />
                </IconButton>
                <IconButton onClick={() => setIsCreateAccountDrawerOpen(true)}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={toggleSettingsDrawer(true)}>
                    <MenuIcon />
                </IconButton>
            </Navigation>
            <CreateAccountDrawer isOpen={isCreateAccountDrawerOpen} onClose={() => setIsCreateAccountDrawerOpen(false)} />
            <SettingsDrawer isOpen={settingsDrawerOpen} toggleDrawer={toggleSettingsDrawer} />
        </Paper>
    );
}

export default HomeNavbar;