import { Container, Box, Typography, Paper, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { SvgIconComponent } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

const BackButton = styled(IconButton)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
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

const CardIcon = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(8),
    height: theme.spacing(8),
    borderRadius: '50%',
    backgroundColor: "#eeeeee"
}));

const VaultCard = ({ icon: Icon, title, description }: { icon: SvgIconComponent, title: string, description: string }) => {
    return (
        <Card>
            <CardIcon>
                <Icon fontSize="large" color="primary" />
            </CardIcon>
            <Box>
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {description}
                </Typography>
            </Box>
        </Card>
    );
};

const CreateAccountPage = () => {
    const navigate = useNavigate();

    return (
        <Root>
            <Content>
                <Box width="100%" textAlign="left" mb={2}>
                    <BackButton onClick={() => navigate('/home', { replace: true })}>
                        <ArrowBackIcon />
                    </BackButton>
                    <Title variant="h4" fontWeight="bold">
                        Create Account
                    </Title>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <VaultCard
                            icon={PersonIcon}
                            title="Weekly Outperformers"
                            description="Auto-rebalancing account invested in the top weekly performing memecoins"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <VaultCard
                            icon={GroupIcon}
                            title="Dog Coins"
                            description="Account long a basket of the top dog coins by market-cap"
                        />
                    </Grid>
                </Grid>
            </Content>
        </Root>
    );
};

export default CreateAccountPage;
