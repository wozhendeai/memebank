import { Log } from "ethers";
import { Address } from "viem";

// Log created when `AccountCreated` event is emitted
export interface AccountCreatedLog extends Log {
    topics: [string, Address, Address]
}  