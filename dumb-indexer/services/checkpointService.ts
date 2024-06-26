import prisma from '../prismaClient';
import { ethers } from 'ethers';
import { contracts } from "../contracts/contracts";
import { createAccount } from './accountService';
import { createBalanceHistory } from './balanceService';
import { getAvailableMargin } from '../utils/getAvailableMargin.ts';
import { Address } from 'viem';
import { accountFactoryContract, client } from '../viemClient.ts';
import { load } from 'ts-dotenv';

const env = load({
    DEPLOYED_BLOCK: String
})

export async function getLastProcessedBlock(): Promise<bigint> {
    const checkpoint = await prisma.checkpoint.findFirst({
        where: { name: 'lastProcessedBlock' },
    });

    if (checkpoint) {
        return BigInt(checkpoint.value);
    } else {
        // On first startup, we start from deployed block
        console.log('No last processed block found, starting from deployed block');
        const DEPLOYED_BLOCK = env.DEPLOYED_BLOCK;
        await saveLastProcessedBlock(BigInt(DEPLOYED_BLOCK));
        return BigInt(DEPLOYED_BLOCK);
    }
}

export async function saveLastProcessedBlock(blockNumber: bigint) {
    await prisma.checkpoint.upsert({
        where: { name: 'lastProcessedBlock' },
        update: { value: blockNumber.toString() },
        create: { name: 'lastProcessedBlock', value: blockNumber.toString() },
    });
}

export async function processNewAccounts(fromBlock: bigint, toBlock: bigint) {
    // Create the event filter
    const filter = await accountFactoryContract.createEventFilter.AccountCreated({
        fromBlock,
        toBlock
    })

    // Get the logs using the filter
    const logs = await client.getFilterLogs({ filter })

    for (const log of logs) {
        const [, account, creator] = log.topics;
        console.log(`New account created: ${account} by ${creator}`);

        try {
            const newAccount = await createAccount(account as string, creator as string);
            const balance = await getAvailableMargin(account as Address);
            await createBalanceHistory(newAccount.id, contracts.PerpsMarketProxy.address, balance.toString());
        } catch (error) {
            console.error('Error processing new account:', error);
        }
    }
}
