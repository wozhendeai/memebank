import { SvgIconComponent } from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

export interface RawAccountData {
    accountAddress: `0x${string}`;
    accountId: bigint;
    totalBalance: bigint;
    strategyType: number;
}

export interface AccountData {
    address: `0x${string}`;
    accountId: bigint;
    totalBalance: string;
    strategyType: number;
}

export interface ComponentAccountType {
    title: string;
    description: string;
    icon: SvgIconComponent;
    strategyId: number;
}
/**
 * @notice ENSURE ORDER MATCHES CONTRACT ORDER FOR STRATEGY ENUM AS `DepositMoneyPage#createAccount`, `HomeAccountCard`, `useNewAccountAddress`
 */
export const accountTypes: ComponentAccountType[] = [
    {
        title: "Weekly Outperformers",
        description: "Auto-rebalancing account invested in the top weekly performing memecoins",
        icon: PersonIcon,
        strategyId: 0
    },
    {
        title: "Dog Basket",
        description: "Buy a basket of the top dog coins",
        icon: GroupIcon,
        strategyId: 1
    },
    {
        title: "Political Coins",
        description: "Buy a basket of the top political coins",
        icon: GroupIcon,
        strategyId: 2
    },
];
