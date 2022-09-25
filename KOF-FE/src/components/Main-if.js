import { useEffect, useState } from "react";
import Select from 'react-select';
import axios from "axios";
import Web3 from 'web3';
import { connectWeb3Wallet } from '../hooks/useWeb3'
import {
	contractAddress,
	USDCAddress,
	ETHUSDC_URL,
	PROVIDER,
	ETHBigNum,
	USDCBigNum
} from '../config/constants.js'
import "./styles.css"
const contractABI = require("../abi/contract.json");
const usdcABI = require("../abi/usdc.json");
let web3;
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
	web3 = new Web3(window.ethereum);
} else {
	const provider = new Web3.providers.HttpProvider(PROVIDER);
	web3 = new Web3(provider);
}
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
const usdcInstance = new web3.eth.Contract(usdcABI, USDCAddress)


const Main = () => {
	const [walletAddress, setWallet] = useState("");
	const currency = [
		{ value: "ETH", label: 'ETH' },
		{ value: "USDC", label: 'USDC' }
	];
	const [curr, setCurr] = useState("ETH");
	const [amount, setAmount] = useState(0);
	const [rate, setRate] = useState(1);


	useEffect(async () => {
		await getExchangeRate();
	}, []);

	const getExchangeRate = async () => {
		const exchangeRate = await axios.get(ETHUSDC_URL);
		console.log(exchangeRate.data);
		setRate(exchangeRate.data.USDC);
	}
	const selectCurr = (e) => {
		setCurr(e.value);
	}
	const handleChange = (e) => {
		setAmount(e.target.value);
	}
	const connectWalletPressed = async () => {
		const walletResponse = await connectWeb3Wallet();
		setWallet(walletResponse.selectedAddress);
	};
	const getApprovementFromUSDC = async () => {
		await usdcInstance.methods
			.approve(contractAddress, 2 * amount * USDCBigNum)
			.send({ from: walletAddress });
	}

	const onDepositPressed = async () => {
		try {
			if (walletAddress == "") {
				alert("Please Connect Wallet!");
			} else {
				const isUserInfo = await contractInstance.methods
					.isUserInfo()
					.call();

				if (!isUserInfo) { // when there is not prev person
					if (curr === "ETH") {
						await contractInstance.methods
							.depositETH(curr)
							.send({
								from: walletAddress,
								value: amount * ETHBigNum
							})
					} else {
						await getApprovementFromUSDC();
						await contractInstance.methods
							.depositUSDC(amount * USDCBigNum, curr)
							.send({ from: walletAddress })
					}
				} else { // when there is prev person
					const prevDataRes = await contractInstance.methods
						.getPreviosPersonDepositInfo()
						.call();
					console.log(typeof (walletAddress))
					console.log(typeof (prevDataRes.addr));
					if (walletAddress == prevDataRes.addr) {
						console.log("AAA");
						alert("You have already deposited!");
					} else {
						console.log("BBB");
						switch (curr) {
							case "ETH":
								if (prevDataRes.currency === "ETH") {
									if (2 * amount < 3 * prevDataRes.amt / ETHBigNum) {
										alert("You have to deposit more! 111");
									} else {
										await contractInstance.methods
											.depositETH(curr)
											.send({
												from: walletAddress,
												value: amount * ETHBigNum
											})
									}
								} else {
									if (2 * amount * rate < 3 * prevDataRes.amt / USDCBigNum) {
										alert("You have to deposit more! 222");
									} else {
										await contractInstance.methods
											.depositETH(curr)
											.send({
												from: walletAddress,
												value: amount * ETHBigNum
											})
									}
								}
								break;
							case "USDC":
								if (prevDataRes.currency === "ETH") {
									if (2 * amount < rate * 3 * prevDataRes.amt / ETHBigNum) {
										alert("You have to deposit more! 333");
									} else {
										await getApprovementFromUSDC();
										await contractInstance.methods
											.depositUSDC(amount * USDCBigNum, curr)
											.send({ from: walletAddress })
									}
								} else {
									if (2 * amount < 3 * prevDataRes.amt / USDCBigNum) {
										alert("You have to deposit more! 444");
									} else {
										await getApprovementFromUSDC();
										await contractInstance.methods
											.depositUSDC(amount * USDCBigNum, curr)
											.send({ from: walletAddress })
									}
								}
								break;
							default:
								break;
						}
					}
				}
			}
		}
		catch (e) {
			console.log(e);
		}
	};

	return (
		<div className="Deposit">
			<div className="wallet-button">
				<button className="wallet-btn" onClick={connectWalletPressed}>
					{walletAddress.length > 0 ? (
						String(walletAddress).substring(0, 6) +
						"..." +
						String(walletAddress).substring(38)
					) : (
						<span>Connect Wallet</span>
					)}
				</button>
			</div>
			<div className="currency-module">
				<input
					type="text"
					className="currency-amount"
					placeholder="Input Amount"
					onChange={handleChange}
				/>
				<Select
					className="currency-unit"
					value={currency.find(obj => obj.value === curr)}
					options={currency}
					onChange={selectCurr}
				/>
			</div>
			<button id="deposit-btn" onClick={onDepositPressed}>
				Deposit
			</button>
		</div>
	);
};

export default Main;
