import { client } from "../viemClient";
import { contracts } from "../contracts/contracts.ts";
import { Address } from "viem";

export async function getAvailableMargin(account: Address): Promise<bigint> {
    try {
        const balance = await client.readContract({
            address: contracts.PerpsMarketProxy.address,
            abi: contracts.PerpsMarketProxy.abi,
            functionName: 'getAvailableMargin',
            args: [account]
        }) as bigint

        return balance
    } catch (error) {
        console.error('Error getting available margin:', error)
        throw error
    }
}