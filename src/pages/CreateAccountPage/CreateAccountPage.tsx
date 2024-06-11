import { useState } from 'react';
import { Container, Box, Typography, Paper, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { SvgIconComponent } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DepositMoneyPage from './DepositMoneyPage';

interface AccountType {
    title: string;
    description: string;
    icon: SvgIconComponent;
}

const accountTypes: AccountType[] = [
    {
        title: "Weekly Outperformers",
        description: "Auto-rebalancing account invested in the top weekly performing memecoins",
        icon: PersonIcon,
    },
    {
        title: "Dog Basket",
        description: "Buy a basket of the top dog coins",
        icon: GroupIcon,
    },
    {
        title: "Political Coins",
        description: "Buy a basket of the top political coins",
        icon: GroupIcon,
    },
];

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
    transition: 'background-color 0.3s',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const CardHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const CardIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginRight: theme.spacing(1),
}));

const CardTitle = styled(Typography)(() => ({
    fontWeight: 'bold',
    flex: 1,
    fontSize: '1rem',
}));

const CardContent = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const CardDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
}));

const VaultCard = ({ icon: Icon, title, description, onClick }: { icon: SvgIconComponent, title: string, description: string, onClick: () => void }) => {
    return (
        <Card onClick={onClick}>
            <CardHeader>
                <CardIcon>
                    <Icon fontSize="medium" />
                </CardIcon>
                <CardTitle variant="h6">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription variant="body2">
                    {description}
                </CardDescription>
                <ArrowForwardIcon fontSize="small" /> {/* Adjusted arrow size */}
            </CardContent>
        </Card>
    );
};

const CreateAccountPage = () => {
    const navigate = useNavigate();
    const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);

    const handleCardClick = (accountType: AccountType) => {
        setSelectedAccount(accountType);
    };

    const handleBackClick = () => {
        setSelectedAccount(null);
    };

    // If a user chose a type of account
    if (selectedAccount) {
        return (
            <Root>
                <Content>
                    <Box width="100%" textAlign="left" mb={2}>
                        <BackButton onClick={handleBackClick}>
                            <ArrowBackIcon />
                        </BackButton>
                        <Title variant="h4" fontWeight="bold">
                            How much do you want to deposit?
                        </Title>
                    </Box>
                    <Box>
                        <DepositMoneyPage />
                    </Box>
                </Content>
            </Root>
        );
    }

    // Select account view
    return (
        <Root>
            <Content>
                <Box width="100%" textAlign="left" mb={2}>
                    <BackButton onClick={() => navigate('/home', { replace: true })}>
                        <ArrowBackIcon />
                    </BackButton>
                    <Title variant="h4" fontWeight="bold">
                        What Type of Account Do You Need?
                    </Title>
                    <Typography variant="body1" color="textSecondary" mt={2}>
                        We have various account types made just for you, you can select any of the available bleow
                    </Typography>

                </Box>
                <Grid container spacing={2}>
                    {accountTypes.map((accountType, index) => (
                        <Grid item xs={12} key={index}>
                            <VaultCard
                                icon={accountType.icon}
                                title={accountType.title}
                                description={accountType.description}
                                onClick={() => handleCardClick(accountType)}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Card>
                    <Title variant="h6" fontWeight="bold">
                        How it works
                    </Title>
                    <Typography variant="body1" color="textSecondary" mt={2}>
                        Simply choose your desired account type, deposit money using Coinbase and watch your money grow. You can withdraw at anytime.
                    </Typography>
                </Card>

            </Content>
        </Root>
    );
};

export default CreateAccountPage;
