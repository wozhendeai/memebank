import { contracts } from './contracts/contracts.ts'
import { createPublicClient, getContract, http } from 'viem'
import { base } from 'viem/chains'
 
export const client = createPublicClient({ 
  chain: base, 
  transport: http(), 
}) 

export const accountFactory = getContract({
  address: contracts.PerpsMarketProxy.address,
  abi: contracts.PerpsMarketProxy.abi,
  client: client,
})  
