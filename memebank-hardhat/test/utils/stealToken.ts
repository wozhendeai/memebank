import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumberish, Signer } from "ethers";
const {
    loadFixture,
    impersonateAccount,
    stopImpersonatingAccount,
    setBalance
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
import { IERC20 } from "../../typechain-types";
import { COLLATERAL_WHALE } from "./Constants";

export async function stealToken(collateral: IERC20, actor: Signer, amount: BigNumberish) {
    const actorAddress = await actor.getAddress();

    // Impersonate the collateral whale account
    await setBalance(COLLATERAL_WHALE, 100n ** 18n);
    await impersonateAccount(COLLATERAL_WHALE);
    const whaleSigner = await ethers.getSigner(COLLATERAL_WHALE);

    // Ensure whale has enough collateral
    expect(await collateral.balanceOf(COLLATERAL_WHALE)).to.be.greaterThanOrEqual(amount);

    // Transfer collateral from the whale to the actor
    const transferTx = await collateral.connect(whaleSigner).transfer(actorAddress, amount);
    await transferTx.wait();

    // Stop impersonating the collateral whale account
    await stopImpersonatingAccount(COLLATERAL_WHALE);

    // Ensure the actor has the correct collateral balance
    expect(await collateral.balanceOf(actorAddress)).to.be.greaterThanOrEqual(amount);
}

export async function stealTokenCustomWhale(collateral: IERC20, actor: Signer, amount: BigNumberish, WHALE_ADDRESS: string) {
    const actorAddress = await actor.getAddress();
    const actorBalanceOfCollateral = await collateral.balanceOf(actor);

    // Impersonate the collateral whale account
    await setBalance(WHALE_ADDRESS, 100n ** 18n);
    await impersonateAccount(WHALE_ADDRESS);
    const whaleSigner = await ethers.getSigner(WHALE_ADDRESS);

    // Ensure whale has enough collateral
    expect(await collateral.balanceOf(WHALE_ADDRESS)).to.be.greaterThanOrEqual(amount);

    // Transfer collateral from the whale to the actor
    const transferTx = await collateral.connect(whaleSigner).transfer(actorAddress, amount);
    await transferTx.wait();

    // Stop impersonating the collateral whale account
    await stopImpersonatingAccount(WHALE_ADDRESS);

    // Ensure the actor has the correct collateral balance
    expect(await collateral.balanceOf(actorAddress)).to.be.greaterThanOrEqual(amount);
}
