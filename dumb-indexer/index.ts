import { load } from 'ts-dotenv';
import express from 'express';
import { ethers } from 'ethers';
import accountRoutes from './routes/accounts.ts';
import balanceRoutes from './routes/balances.ts';
import { createAccount, getAccounts } from './services/accountService.ts';
import { createBalanceHistory } from './services/balanceService.ts';
import { contracts } from "./contracts/contracts.ts";
import { client, accountFactoryContract } from "./viemClient.ts";
import { getAvailableMargin } from "./utils/getAvailableMargin.ts";
import { AccountCreatedLog } from 'types.ts';
import { Address } from 'viem';
import { getLastProcessedBlock, processNewAccounts, saveLastProcessedBlock } from './services/checkpointService.ts';

const PORT = 3000;
const ETHEREUM_RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base/lzSHv83ZGfiUFE_YizE9vhXlAsViU7eE";
const RETRY_INTERVAL = 60000; // 1 minute

// Ethereum provider
const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

const perpsMarketProxy = new ethers.Contract(
    contracts.PerpsMarketProxy.address,
    contracts.PerpsMarketProxy.abi,
    provider
);

// @notice Indexes users balances every hour 
async function startIndexing() {
    console.log("Starting to index!");
    while (true) {
        try {
            // Gets all accounts to track
            const accounts = await getAccounts();
            // Loops through them all
            for (const account of accounts) {
                // Get users balance
                const balance = await perpsMarketProxy.getAvailableMargin(account.address);
                // Insert into database
                await createBalanceHistory(account.id, contracts.PerpsMarketProxy.address, balance.toString());
            }

            // Wait for 1 hour
            await new Promise(resolve => setTimeout(resolve, 3600000));
        } catch (error) {
            console.error('Error during indexing:', error);
            // Wait for 1 minute before retrying if there's an error
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

// Tracks new accounts
async function listenForNewAccounts() {
    let lastProcessedBlock = await getLastProcessedBlock();

    while (true) {
        try {
            const latestBlock = await client.getBlockNumber();

            if (latestBlock > lastProcessedBlock) {
                await processNewAccounts(lastProcessedBlock + 1n, latestBlock);
                lastProcessedBlock = latestBlock;
                await saveLastProcessedBlock(lastProcessedBlock);
            }

            // Set up a listener for new events
            const unwatch = accountFactoryContract.watchEvent.AccountCreated({
                onLogs: async (logs) => {
                    for (const log of logs) {
                        const account = log.topics[1];
                        const creator = log.topics[2];
                        const blockNumber = log.blockNumber as bigint;

                        console.log(`New account created in real-time: ${account} by ${creator}`);
                        try {
                            await processNewAccounts(BigInt(blockNumber), BigInt(blockNumber));
                            await saveLastProcessedBlock(BigInt(blockNumber));
                        } catch (error) {
                            console.error('Error processing new account:', error);
                        }
                    }
                },
                onError: (error) => console.error('Error in event listener:', error)
            });

            // Keep the function running
            await new Promise(() => {});
        } catch (error) {
            console.error('Error in listenForNewAccounts:', error);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
        }
    }
}

// Express app
const app = express();

app.use(express.json());
app.use('/accounts', accountRoutes);
app.use('/balances', balanceRoutes);

// Main function
async function main() {
    try {
        listenForNewAccounts();
        startIndexing();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error in main function:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});