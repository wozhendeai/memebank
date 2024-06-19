import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi'; // Changed to useContractRead which is typically correct
import { contracts } from '../contracts/contracts';

const useAccountAddresses = () => {
  const { address } = useAccount();
  const [accountAddresses, setAccountAddresses] = useState<`0x${string}`[]>([]);

  const { data, isLoading, error } = useReadContract({
    address: contracts.AccountFactory.address,
    abi: contracts.AccountFactory.abi,
    functionName: 'getAccountsByUser',
    args: address ? [address] as const : undefined,
  });

  useEffect(() => {
    if (data) {
      setAccountAddresses([...data]);
    }
  }, [data]);

  return { accountAddresses, isLoading, error };
};

export default useAccountAddresses;
