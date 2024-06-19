import { useEffect, useState } from 'react';
import { useReadContracts } from 'wagmi';
import { contracts } from '../contracts/contracts';
import useAccountAddresses from './useAccountAddresses';
import { formatUnits } from 'viem';

interface Account {
    address: string;
    value: string;
}

const useAccountData = () => {
    const { accountAddresses, isLoading: isLoadingAddresses, error: addressesError } = useAccountAddresses();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [totalBalance, setTotalBalance] = useState<string>("0");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { data, error: readError, isLoading: isReadLoading } = useReadContracts({
        contracts: accountAddresses.map(address => ({
            address,
            abi: contracts.Account.abi,
            functionName: 'getTotalAccountBalance'
        })),
    });

    useEffect(() => {
        setIsLoading(isLoadingAddresses || isReadLoading);
        setError(addressesError || readError);

        // Handle case where there are no accounts
        const hasAccounts = accountAddresses.length !== 0;
        if (!hasAccounts && !isLoadingAddresses) {
            // No accounts and not loading any data, so clear any previous accounts and stop any loading indications
            setAccounts([]);
            setIsLoading(false);
            setTotalBalance("0");
            return;
        }

        if (hasAccounts && data) {
            const accountBalances = data.map((result, index) => ({
                address: accountAddresses[index],
                value: result.status === 'success' && typeof result.result === 'bigint' && result.result ? formatUnits(result.result, 18) : "0"
            }));

            setAccounts(accountBalances);

            // Calculate the total balance
            const total = accountBalances.reduce((sum, account) => {
                const accountValue = parseFloat(account.value);
                return sum + accountValue;
            }, 0);

            setTotalBalance(total.toString());
        }
    }, [data, accountAddresses, isLoadingAddresses, isReadLoading, addressesError, readError]);

    return { accounts, totalBalance, isLoading, error };
};

export default useAccountData;
