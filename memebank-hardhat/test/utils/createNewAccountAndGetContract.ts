import { ethers } from "hardhat";
import { ContractTransactionResponse, EventLog, TransactionReceipt } from "ethers";
import {
    Account,
} from "../../typechain-types";

export async function createNewAccountAndGetContract(tx: ContractTransactionResponse): Promise<[Account, string]> {
    const receipt: TransactionReceipt | null = await tx.wait();

    // Get the newly created contract address
    const accountCreatedLog = receipt?.logs.find(log =>
        log instanceof EventLog && log.fragment.name === "AccountCreated"
    ) as EventLog;
    const newAccountAddress = accountCreatedLog.args[0] as string;

    // Get instance of new contract
    const account = await ethers.getContractAt("Account", newAccountAddress) as Account;

    return [account, newAccountAddress];
}
