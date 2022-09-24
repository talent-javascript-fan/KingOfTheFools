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
	const ETH_USDC = [
		{ value: "ETH", label: 'ETH' },
		{ value: "USDC", label: 'USDC' }
	];
	const [curr, setCurr] = useState("ETH");
	const [amount, setAmount] = useState(0);
	const [rate, setRate] = useState(1);
	const [approve, setApprove] = useState(false);
	const [trxStatus, setTrxStatus] = useState("");

	useEffect(() => {
		const getExchangeRate = async () => {
			const exchangeRate = await axios.get(ETHUSDC_URL);
			setRate(exchangeRate.data.USDC);
		}
		getExchangeRate();
		const interval = setInterval(() => {
			eventListner();
		}, 2000);
		return () => clearInterval(interval);
	}, []);


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

	const getUSDCApprove = async () => {
		await usdcInstance.methods
			.approve(contractAddress, 2 * amount * USDCBigNum)
			.send({ from: walletAddress });
		setApprove(true);
	}

	const eventListner = () => {
		contractInstance.events.allEvents()
			.on('data', async (e) => {
				setTrxStatus(e.event)
			})
	}

	const onDepositPressed = async () => {
		try {
			switch (walletAddress) {
				case "":
					alert("Please Connect Wallet!");
					break;
				default:
					const isUserInfo = await contractInstance.methods
						.isUserInfo()
						.call();
					switch (isUserInfo) {
						case false: // when there is not prev person
							if (curr === "ETH") {
								await contractInstance.methods
									.depositETH()
									.send({
										from: walletAddress,
										value: amount * ETHBigNum
									})
							} else {
								!approve && (await getUSDCApprove());
								await contractInstance.methods
									.depositUSDC(amount * USDCBigNum)
									.send({ from: walletAddress })
							}
							break;
						default: // when there is prev person
							const prevDataRes = await contractInstance.methods
								.getPrevPersonInfo()
								.call();
							switch (prevDataRes.addr) {
								case walletAddress:
									alert("You have already deposited!");
									break;
								default:
									switch (curr) {
										case "ETH":
											switch (prevDataRes.currency) {
												case "ETH":
													if (2 * amount * ETHBigNum < 3 * prevDataRes.amt) {
														alert("You should more!");
													} else {
														await contractInstance.methods
															.depositETH()
															.send({
																from: walletAddress,
																value: amount * ETHBigNum
															})
													}
													break;
												default:
													if (2 * amount * rate * USDCBigNum < 3 * prevDataRes.amt) {
														alert("You should deposit more!");
													} else {
														await contractInstance.methods
															.depositETH()
															.send({
																from: walletAddress,
																value: amount * ETHBigNum
															})
													}
													break;
											}
											break;
										default:
											switch (prevDataRes.currency) {
												case "ETH":
													if (2 * amount * ETHBigNum < rate * 3 * prevDataRes.amt) {
														alert("You should deposit more!");
													} else {
														!approve && (await getUSDCApprove());
														await contractInstance.methods
															.depositUSDC(amount * USDCBigNum)
															.send({ from: walletAddress })
													}
													break;
												default:
													if (2 * amount * USDCBigNum < 3 * prevDataRes.amt) {
														alert("You should deposit more!");
													} else {
														!approve && (await getUSDCApprove());
														await contractInstance.methods
															.depositUSDC(amount * USDCBigNum)
															.send({ from: walletAddress })
													}
													break;
											}
											break;
									}
									break;
							}
							break;
					}
					break;
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
					value={ETH_USDC.find(obj => obj.value === curr)}
					options={ETH_USDC}
					onChange={selectCurr}
				/>
			</div>
			{!trxStatus && (
				<button id="deposit-btn" onClick={onDepositPressed}>Deposit</button>
			)}
			{trxStatus && (
				<h1 className="trx-result">{trxStatus} successfully!</h1>
			)}
		</div>
	);
};

export default Main;
