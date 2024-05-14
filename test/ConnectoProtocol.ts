/* eslint-disable no-unused-vars */
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ConnectoProtocol, ConnectoToken } from "../typechain";
import { NATIVE_TOKEN, ListingType } from "../constants";
import moment from "moment";
import { BigNumber } from "ethers";

describe("ConnectoProtocol", function () {
  let connectoProtocol: ConnectoProtocol, connectoToken: ConnectoToken;
  let treasury: SignerWithAddress,
    fan: SignerWithAddress,
    idol: SignerWithAddress;
  const FEE = BigNumber.from(50); // aka 5%

  before(async () => {
    [treasury, fan, idol] = await ethers.getSigners();

    const ConnectoTokenFactory = await ethers.getContractFactory(
      "ConnectoToken"
    );
    connectoToken = (await upgrades.deployProxy(
      ConnectoTokenFactory,
      ["Connecto Token", "CT"],
      {
        initializer: "initialize",
      }
    )) as unknown as ConnectoToken;

    const ConnectoProtocolFactory = await ethers.getContractFactory(
      "ConnectoProtocol"
    );
    connectoProtocol = (await upgrades.deployProxy(
      ConnectoProtocolFactory,
      [
        treasury.address, /// owner
        treasury.address, /// treasury
        FEE,
      ],
      { initializer: "initialize" }
    )) as unknown as ConnectoProtocol;
  });

  const calculateAmount = (amount: BigNumber, fee: BigNumber): BigNumber => {
    return amount.mul(fee).div(BigNumber.from("10000"));
  };

  it("Should 'donate' by Connecto Token", async function () {
    const donateAmount = ethers.utils.parseEther("2");
    const donateToken = connectoToken.address;
    /// mint & approve
    await (
      await connectoToken.connect(fan).mint(fan.address, donateAmount)
    ).wait(1);
    await (
      await connectoToken
        .connect(fan)
        .approve(connectoProtocol.address, donateAmount)
    ).wait(1);

    /// call donate
    const balanceOfFanBefore = await connectoToken.balanceOf(fan.address);
    const donateTx = await (
      await connectoProtocol
        .connect(fan)
        .donate(idol.address, donateToken, donateAmount)
    ).wait(1);
    const balanceOfFanAfter = await connectoToken.balanceOf(fan.address);
    expect(donateTx).to.be.emit(connectoProtocol, "Donated");
    /// sub transaction fee
    expect(balanceOfFanAfter.toString()).to.be.eq(
      balanceOfFanBefore.sub(donateAmount).toString()
    );

    const claimableAmountOfTreasury = await connectoProtocol.claimableAmount(
      treasury.address,
      donateToken
    );
    const claimableAmountOfIdol = await connectoProtocol.claimableAmount(
      idol.address,
      donateToken
    );
    const feeAmount = calculateAmount(donateAmount, FEE);
    expect(claimableAmountOfTreasury.toString()).to.be.eq(feeAmount.toString());
    expect(claimableAmountOfIdol.toString()).to.be.eq(
      donateAmount.sub(feeAmount).toString()
    );

    /// call claim
    const balanceOfTreasuryBefore = await connectoToken.balanceOf(
      treasury.address
    );
    const balanceOfIdolBefore = await connectoToken.balanceOf(idol.address);
    const treasuryClaimTx = await (
      await connectoProtocol.connect(treasury).claim(donateToken)
    ).wait(1);
    console.log(treasuryClaimTx.status);
    const balanceOfTreasuryAfter = await connectoToken.balanceOf(
      treasury.address
    );
    // console.log("balanceOfTreasuryAfter", balanceOfTreasuryAfter.toString());
    expect(balanceOfTreasuryBefore.add(feeAmount).toString()).eq(
      balanceOfTreasuryAfter.toString()
    );

    const idolClaimTx = await (
      await connectoProtocol.connect(idol).claim(donateToken)
    ).wait(1);
    console.log(idolClaimTx.status);
    const balanceOfIdolAfter = await connectoToken.balanceOf(idol.address);
    // console.log("balanceOfIdolAfter", balanceOfIdolAfter.toString());
    expect(balanceOfIdolBefore.add(donateAmount.sub(feeAmount)).toString()).eq(
      balanceOfIdolAfter.toString()
    );
  });

  it("Should 'donate' by Native Token", async function () {
    const donateAmount = ethers.utils.parseEther("2");
    const donateToken = NATIVE_TOKEN;
    /// call donate
    const balanceOfFanBefore = await fan.getBalance();
    const donateTx = await (
      await connectoProtocol
        .connect(fan)
        .donate(idol.address, donateToken, donateAmount, {
          value: donateAmount,
        })
    ).wait(1);
    const donateTransactionFee = donateTx.effectiveGasPrice.mul(
      donateTx.gasUsed
    );
    const balanceOfFanAfter = await fan.getBalance();
    expect(donateTx).to.be.emit(connectoProtocol, "Donated");
    /// sub transaction fee
    expect(balanceOfFanAfter.toString()).to.be.eq(
      balanceOfFanBefore.sub(donateAmount).sub(donateTransactionFee).toString()
    );

    const claimableAmountOfTreasury = await connectoProtocol.claimableAmount(
      treasury.address,
      donateToken
    );
    const claimableAmountOfIdol = await connectoProtocol.claimableAmount(
      idol.address,
      donateToken
    );
    const feeAmount = calculateAmount(donateAmount, FEE);
    expect(claimableAmountOfTreasury.toString()).to.be.eq(feeAmount.toString());
    expect(claimableAmountOfIdol.toString()).to.be.eq(
      donateAmount.sub(feeAmount).toString()
    );

    /// call claim
    const balanceOfTreasuryBefore = await treasury.getBalance();
    const balanceOfIdolBefore = await idol.getBalance();
    const treasuryClaimTx = await (
      await connectoProtocol.connect(treasury).claim(donateToken)
    ).wait(1);
    console.log(treasuryClaimTx.status);
    const treasuryClaimTransactionFee = treasuryClaimTx.effectiveGasPrice.mul(
      treasuryClaimTx.gasUsed
    );
    const balanceOfTreasuryAfter = await treasury.getBalance();
    // console.log("balanceOfTreasuryAfter", balanceOfTreasuryAfter.toString());
    expect(
      balanceOfTreasuryBefore
        .add(feeAmount)
        .sub(treasuryClaimTransactionFee)
        .toString()
    ).eq(balanceOfTreasuryAfter.toString());

    const idolClaimTx = await (
      await connectoProtocol.connect(idol).claim(donateToken)
    ).wait(1);
    const idolClaimTransactionFee = idolClaimTx.effectiveGasPrice.mul(
      idolClaimTx.gasUsed
    );
    console.log(idolClaimTx.status);
    const balanceOfIdolAfter = await idol.getBalance();
    // console.log("balanceOfIdolAfter", balanceOfIdolAfter.toString());
    expect(
      balanceOfIdolBefore
        .add(donateAmount.sub(feeAmount))
        .sub(idolClaimTransactionFee)
        .toString()
    ).eq(balanceOfIdolAfter.toString());
  });
});
