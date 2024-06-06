import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, ButtonGroup, Grid, Paper, IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import SavingsIcon from '@mui/icons-material/Savings';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import TravelIcon from '@mui/icons-material/FlightTakeoff';
import InsuranceIcon from '@mui/icons-material/LocalHospital';

const Root = styled(Container)(({ theme }) => ({
  height: '100vh',
  backgroundColor: '#F0F2F5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const Content = styled(Box)(() => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
}));

const GraphContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  width: '100%',
  boxSizing: 'border-box',
}));

const GoalCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
  height: '180px', // Increased card height
}));

const Navigation = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(1),
  backgroundColor: '#fff',
}));

const HomePage = () => {
  const { ready, authenticated } = usePrivy();
  const navigate = useNavigate();

  // Do nothing while the PrivyProvider initializes with updated user state
  if (!ready) return <></>;

  // Redirect unauthenticated users to homepage
  if (!authenticated) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <Root>
      <Content>
        <Box width="100%" textAlign="left" mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Your savings
          </Typography>
          <Typography variant="h4" color="green"> {/* Decreased text size */}
            $62,988
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            This month you’ve saved $2,899 so far. <span style={{ color: 'green' }}>(25% more than last month)</span>
          </Typography>
        </Box>
        <GraphContainer>
          {/* Insert your graph component here */}
          <Typography variant="h6">Graph Placeholder</Typography>
        </GraphContainer>
        <Box width="100%" mb={2} display="flex" justifyContent="center">
          <ButtonGroup fullWidth variant="outlined">
            <Button sx={{ flex: 1 }}>1M</Button>
            <Button sx={{ flex: 1 }}>3M</Button>
            <Button sx={{ flex: 1 }}>6M</Button>
            <Button sx={{ flex: 1 }}>1Y</Button>
          </ButtonGroup>
        </Box>
        <Box width="100%" textAlign="left" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Your accounts
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <GoalCard>
              <TravelIcon style={{ fontSize: 40 }} />
              <Typography variant="h6">Travelling</Typography>
              <Typography variant="h5">$2,398</Typography> {/* Decreased text size */}
              <Typography variant="body2" color="textSecondary">+ $223 this month</Typography>
            </GoalCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <GoalCard>
              <InsuranceIcon style={{ fontSize: 40 }} />
              <Typography variant="h6">Insurance</Typography>
              <Typography variant="h5">$12,090</Typography> {/* Decreased text size */}
              <Typography variant="body2" color="textSecondary">+ $411 this month</Typography>
            </GoalCard>
          </Grid>
          {/* Add more GoalCards here as needed */}
        </Grid>
      </Content>
      {/* Footer */}
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
    </Root>
  );
};

export default HomePage;
