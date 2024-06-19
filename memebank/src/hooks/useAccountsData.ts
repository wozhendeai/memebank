import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { contracts } from '../contracts/contracts';
import { formatUnits } from 'viem';
import { AccountData, RawAccountData } from '../types';

const useAccountData = () => {
    const { address } = useAccount();
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [totalBalance, setTotalBalance] = useState<string>("0");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Fetch account details
    const { data, error: contractError, isLoading: contractLoading } = useReadContract({
        address: contracts.AccountFactory.address,
        abi: contracts.AccountFactory.abi,
        functionName: 'getAccountsByUser',
        args: address ? [address] as const : undefined,
        query: {
            enabled: !!address
        }
    });

    useEffect(() => {
        setIsLoading(contractLoading);
        if (contractError) {
            setError(contractError);
        }

        if (data) {
            const formattedAccounts = data.map((account: RawAccountData) => ({
                address: account.accountAddress,
                accountId: account.accountId,
                totalBalance: formatUnits(account.totalBalance, 18),  // Format from BigInt to human-readable string
                strategyType: account.strategyType
            }));
    
            setAccounts(formattedAccounts);
                // Calculate the total balance
            const total = formattedAccounts.reduce((acc, account) => acc + parseFloat(account.totalBalance), 0);
            setTotalBalance(total.toFixed(2));  // Formatting the total to two decimal places

        }
    }, [data, contractError, contractLoading]);

    return { accounts, totalBalance, isLoading, error };
};

export default useAccountData;
