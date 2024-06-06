import { Container, Box, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { usePrivy } from '@privy-io/react-auth';
import {useLogin} from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

// Then call `login` in your code, which will invoke these callbacks on completion

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

// const Illustration = styled(Box)(({ theme }) => ({
//   margin: theme.spacing(4, 0),
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
// }));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: '150px',
  padding: theme.spacing(1.5),
  fontSize: '1.2rem',
  backgroundColor: '#002A5C',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#004080',
  },
}));

const LandingPage = () => {
  const { ready } = usePrivy();
  const navigate = useNavigate();

  const {login} = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      console.log(user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount);

      if (wasAlreadyAuthenticated) {
        // In this case, the user was already `authenticated` when this component was mounted.
        //
        // For already-`authenticated` users, we redirect them to their profile page.
        console.log('user authenticated')
        navigate('/home', { replace: true });
    } else {
        // In this case, the user was not already `authenticated` when the component was mounted
        // but successfully complete `login` during this component's lifecycle.
        //
        // For new `login`s, we make an API request to our backend to find or create the user in our
        // own DBs.
        if (isNewUser) {
            // If the user is new, create it in your backend
            // await fetch('your-create-user-endpoint', {
            //     method: 'POST',
            //     body: JSON.stringify(user),
            //     ...
            // });
        } else {
            // If the user is returning, fetch their data from your backend
            // await fetch(`your-find-user-endpoint/${user.id}`, {
            //     method: 'GET',
            //     ...
            // });
        }
    }
    },
    onError: (error) => {
      console.log(error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });
  
  return (
    <Root>
      <Content>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Bank
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Get access to the tools you need to invest, spend, and put your money in motion.
        </Typography>
        {/* <Illustration>
          <Avatar variant="square" sx={{ width: '100%', height: '100%', backgroundColor: 'green' }}>
            Illustration
          </Avatar>
        </Illustration> */}
      </Content>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item>
          {/* TODO: Spinner instead of loading */}
          <StyledButton variant="contained" color="primary" disabled={!ready} onClick={login}>
            {ready ? 'Log in' : 'Loading...'}
          </StyledButton>
        </Grid>
      </Grid>
    </Root>
  );
};

export default LandingPage;
