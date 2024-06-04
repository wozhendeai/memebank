import { Container, Box, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';

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

const Illustration = styled(Box)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

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

const HomePage = () => {
  return (
    <Root>
      <Content>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Bank
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Get access to the tools you need to invest, spend, and put your money in motion.
        </Typography>
        <Illustration>
          {/* Replace this Avatar with the actual illustration/image */}
          {/* <Avatar variant="square" sx={{ width: '100%', height: '100%', backgroundColor: 'green' }}>
            Illustration
          </Avatar> */}
        </Illustration>
      </Content>
      <Grid container justifyContent="center" spacing={2}>
        <Grid item>
          <StyledButton variant="contained" color="primary">
            Log in
          </StyledButton>
        </Grid>
      </Grid>
    </Root>
  );
};

export default HomePage;
