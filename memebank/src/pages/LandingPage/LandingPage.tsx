import { Container, Typography, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import CreateWalletButton from './CreateWalletButton';
import withAuthRedirect from '../../components/AuthRedirect/withAuthRedirect';

const Root = styled(Container)(({ theme }) => ({
  height: '100vh',
  backgroundColor: '#F0F2F5',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const Content = styled(Box)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LandingPage = () => {
  return (
    <Root>
      <Content>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Bank
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Get access to the tools you need to invest, spend, and put your money in motion.
        </Typography>
      </Content>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item>
          <CreateWalletButton />
        </Grid>
      </Grid>
    </Root>
  );
};

// Required for fast refresh
const AuthRedirectedLandingPage = withAuthRedirect(LandingPage);

export default AuthRedirectedLandingPage;
