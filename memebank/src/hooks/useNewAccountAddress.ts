// Retrieves the address of the next Account contract if a user deployed one
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { contracts } from '../contracts/contracts';
import { base } from 'viem/chains';
import { ComponentAccountType } from '../types';

export const useNewAccountAddress = (selectedAccountType: ComponentAccountType) => {
    const [newAccountAddress, setNewAccountAddress] = useState<`0x${string}` | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { address } = useAccount();

    const { data, status, error: readError } = useReadContract({
        abi: contracts.AccountFactory.abi,
        address: contracts.AccountFactory.address,
        functionName: 'determineNewAccountAddress',
        args: address ? [address, selectedAccountType.strategyId] as const : undefined,
        chainId: base.id,
        query: {
            enabled: !!address && selectedAccountType !== undefined
        }
    });

    useEffect(() => {
        if (status === 'pending') {
            setLoading(true);
        } else if (status === 'success' && data) {
            setNewAccountAddress(data);
            setLoading(false);
            setError(null);
        } else if (status === 'error') {
            setError(readError?.message || 'Failed to fetch the new account address');
            setLoading(false);
        }
    }, [data, status, readError]);

    return {
        newAccountAddress,
        loading,
        error,
    };
};
