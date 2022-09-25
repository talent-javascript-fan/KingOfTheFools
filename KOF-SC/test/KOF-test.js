const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

let prevDepositor;
let nextDepositor;
let TestUSDCInstance;
let testUSDCContract;
let testcoin;
let KOFInstance;
let kofContract;

describe("KingOfFool", function () {
	before(async function () {
		[prevDepositor, nextDepositor] = await ethers.getSigners();
		TestUSDCInstance = await ethers.getContractFactory("TestUSDC");
		testUSDCContract = await TestUSDCInstance.deploy();
		testcoin = await testUSDCContract.deployed();
		await testUSDCContract.transfer(nextDepositor.address, 10000);

		KOFInstance = await ethers.getContractFactory("KingOfFool");
		kofContract = await KOFInstance.deploy(testcoin.address);
		await kofContract.deployed();
	});

	/* Unit test for depositETH() function */
	describe('Check depositETH', function () {
		it("Should Fail", async () => {
			await expectRevert(
				kofContract.depositETH(prevDepositor.address, {
					from: prevDepositor.address,
					value: 0
				}),
				"Amount should much than 0"
			);
		})
		it("Inital ETH Deposit by prev person", async () => {
			await kofContract.depositETH(prevDepositor.address, {
				from: prevDepositor.address,
				value: ethers.utils.parseEther("50")
			});
			expect(await kofContract.isUserInfo()).to.be.equal(true);
			expect((await kofContract.getETHBalance()).toString())
				.to.be.equal(ethers.utils.parseEther("50").toString());

		})
		it("Next ETH Deposit by prev person", async () => {
			await expectRevert(
				kofContract.depositETH(prevDepositor.address, {
					from: prevDepositor.address,
					value: ethers.utils.parseEther("150")
				}),
				"You have already deposited!"
			);
		})
		it("ETH Deposit by next person", async () => {
			await kofContract.connect(nextDepositor).depositETH(nextDepositor.address, {
				from: nextDepositor.address,
				value: ethers.utils.parseEther("150")
			});
			expect((await kofContract.connect(nextDepositor).getETHBalance()).toString())
				.to.be.equal(ethers.utils.parseEther("50").toString());
			expect(parseFloat(await nextDepositor.getBalance()))
				.to.be.within(
					parseInt(ethers.utils.parseEther("9848")),
					parseInt(ethers.utils.parseEther("9850"))
				);
			expect(parseFloat(await prevDepositor.getBalance()))
				.to.be.within(
					parseInt(ethers.utils.parseEther("10098")),
					parseInt(ethers.utils.parseEther("10100"))
				);
		})
	})

	/* Unit test for depositUSDC() function */
	describe('Check depositUSDC', function () {
		before(async () => {
			await testUSDCContract.approve(kofContract.address, 50000);
			await testUSDCContract.connect(nextDepositor).approve(kofContract.address, 50000);
			await kofContract.initializeUsers();
		});
		it("Initialize Users", async () => {
			expect(await kofContract.isUserInfo()).to.be.equal(false);
		})
		it("Should Fail", async () => {
			await expectRevert(
				kofContract.depositUSDC(prevDepositor.address, 0),
				"Amount should much than 0"
			);
		})
		it("Inital USDC Deposit by prev person", async () => {
			await kofContract.depositUSDC(
				prevDepositor.address, 50
			);
			expect(await kofContract.isUserInfo()).to.be.equal(true);
			expect((await kofContract.getUSDCBalance()).toString())
				.to.be.equal('50');
		})
		it("Next USDC Deposit by prev person", async () => {
			await expectRevert(
				kofContract.depositUSDC(prevDepositor.address, 150),
				"You have already deposited!"
			);
		})
		it("USDC Deposit by next person", async () => {
			await kofContract.connect(nextDepositor).depositUSDC(nextDepositor.address, 150);
			expect((await kofContract.connect(nextDepositor).getUSDCBalance()).toString())
				.to.be.equal('50');
			expect(parseInt(await testUSDCContract.balanceOf(nextDepositor.address)))
				.to.be.equal(parseInt("9850"));
			expect(parseInt(await testUSDCContract.balanceOf(prevDepositor.address)))
				.to.be.equal(parseInt("10100"));
		})
	})
});
