import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ResponsiveChartContainer } from '@mui/x-charts';
import TravelIcon from '@mui/icons-material/FlightTakeoff';
import HomeNavbar from '../../components/HomeNavbar/HomeNavbar';
import Skeleton from '@mui/material/Skeleton';
import withAuthRedirect from '../../components/AuthRedirect/withAuthRedirect';
import useAccountData from '../../hooks/useAccountData'; // Import your custom hook

const Root = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#F0F2F5',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  boxSizing: 'border-box',
}));

// TODO: Better CSS for content & route, problem was cards overflowing
const Content = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  boxSizing: 'border-box',
  paddingBottom: theme.spacing(8),
}));

const GraphContainer = styled(Paper)(({ theme }) => ({
  padding: 0,
  margin: theme.spacing(2, 0),
  width: '100%',
  height: 300,
  boxSizing: 'border-box',
  overflow: 'hidden',
}));

const AccountCard = styled(Paper)(({ theme }) => ({
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

const data = [
  { month: 'Jan', value: 5000 },
  { month: 'Feb', value: 6000 },
  { month: 'Feb2', value: 6000 },
  { month: 'Mar', value: 7000 },
  { month: 'Apr', value: 7000 },
  { month: 'May', value: 8000 },
  { month: 'Jun', value: 8000 },
];

const HomePage = () => {
  const { accounts, totalBalance, isLoading, } = useAccountData();

  return (
    <Root>
      <Content>
        {/* "Your Savings" Header */}
        <Box width="100%" textAlign="left" mb={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Your total account balance
          </Typography>
          <Typography variant="h4" color="green">
            ${totalBalance}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            This month you’ve saved $2,899 so far. <span style={{ color: 'green' }}>(25% more than last month)</span>
          </Typography>
        </Box>
        {/* Savings Graph */}
        <GraphContainer>
          <ResponsiveChartContainer
            series={[
              {
                type: 'line',
                data: data.map(item => item.value),
                showMark: false,
              },
            ]}
            xAxis={[
              {
                data: data.map(item => item.month),
                scaleType: 'band',
                id: 'x-axis-id',
              },
            ]}
            yAxis={[
              {
                scaleType: 'linear',
              },
            ]}
            margin={{ top: 20, right: 0, bottom: 20, left: 0 }}
            sx={{
              width: '100%',
              height: '100%',
              '& .MuiLineElement-root': {
                strokeWidth: 2,
                stroke: '#6a0dad',
                strokeLinecap: 'round',
              },
              '& .MuiChartsXAxis-root, & .MuiChartsYAxis-root': {
                display: 'none',
              },
              '& .MuiChartsTooltip-root': {
                display: 'none',
              },
            }}
          >
            <LinePlot />
          </ResponsiveChartContainer>
        </GraphContainer>
        {/* Graph Buttons */}
        <Box width="100%" mb={2} display="flex" justifyContent="center">
          <ButtonGroup fullWidth variant="outlined">
            <Button sx={{ flex: 1 }}>1M</Button>
            <Button sx={{ flex: 1 }}>3M</Button>
            <Button sx={{ flex: 1 }}>6M</Button>
            <Button sx={{ flex: 1 }}>1Y</Button>
          </ButtonGroup>
        </Box>

        {/* "Your Accounts" Header */}
        <Box width="100%" textAlign="left" mb={1}>
          <Typography variant="h6" fontWeight="bold">
            Your accounts
          </Typography>
        </Box>
        {/* Accounts Cards */}
        <Grid container spacing={1} style={{ margin: 0, width: '100%' }}>
          {isLoading ? (
            // Display 4 skeleton placeholders when data is loading
            Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <AccountCard>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" height={24} width="80%" />
                  <Skeleton variant="text" height={30} width="60%" />
                  <Skeleton variant="text" height={18} width="40%" />
                </AccountCard>
              </Grid>
            ))
          ) : (
            accounts.map(account => (
              <Grid item xs={12} sm={6} key={account.address}>
                <AccountCard>
                  <TravelIcon style={{ fontSize: 40 }} />
                  <Typography variant="h6">Account</Typography>
                  <Typography variant="h5">${account.value.toString()}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Some more details here
                  </Typography>
                </AccountCard>
              </Grid>
            ))
          )}
        </Grid>
      </Content>

      <HomeNavbar />
    </Root>
  );
};

const AuthRedirectedHomePage = withAuthRedirect(HomePage);

export default AuthRedirectedHomePage;
