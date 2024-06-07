import { useNavigate } from 'react-router-dom';
import { Paper, styled } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import SavingsIcon from '@mui/icons-material/Savings';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    padding: theme.spacing(1),
    backgroundColor: '#fff',
}));

// TODO: Fix styling on large screens, navbar extends further than the apps page
function HomeNavbar() {
    const navigate = useNavigate();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <Navigation>
                <IconButton onClick={() => navigate('/home')}>
                    <HomeIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/savings')}>
                    <SavingsIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/add')}>
                    <AddIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/history')}>
                    <HistoryIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/menu')}>
                    <MenuIcon />
                </IconButton>
            </Navigation>
        </Paper>
    )
}

export default HomeNavbar