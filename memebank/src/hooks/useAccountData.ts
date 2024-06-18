import { useEffect, useState } from 'react';
import { useReadContracts } from 'wagmi';
import { contracts } from '../contracts/contracts';
import useAccountAddresses from './useAccountAddresses';

interface Account {
    address: string;
    value: bigint;
}

const useAccountData = () => {
    const { accountAddresses, isLoading: isLoadingAddresses, error: addressesError } = useAccountAddresses();
    const [accounts, setAccounts] = useState<Account[]>([]);
    
    // Handle case where there are no accounts
    const hasAccounts = accountAddresses.length > 0;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { data, error: readError, isLoading: isReadLoading } = useReadContracts({
        contracts: accountAddresses.map(address => ({
            address,
            abi: contracts.Account.abi.abi,
            functionName: 'getTotalAccountBalance'
        })),
    });

    useEffect(() => {
        setIsLoading(isLoadingAddresses || isReadLoading);
        setError(addressesError || readError);
        console.log(accountAddresses, data)
        if (!hasAccounts && !isLoadingAddresses) {
            // No accounts and not loading any data, so clear any previous accounts and stop any loading indications
            setAccounts([]);
            setIsLoading(false);
            return;
        }

        if (data && hasAccounts) {
            const accountBalances = data.map((result, index) => ({
                address: accountAddresses[index],
                value: result.status === 'success' && result.result ? BigInt(result.result) : BigInt(0)
            }));
            setAccounts(accountBalances);
        }
    }, [data, accountAddresses, hasAccounts, isLoadingAddresses, isReadLoading, addressesError, readError]);

    return { accounts, isLoading, error };
};

export default useAccountData;
