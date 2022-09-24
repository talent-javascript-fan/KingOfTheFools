// hardhat.config.js
const { alchemyApiKey, mnemonic, RINKEBY_API_KEY, infuraKey } = require("./secrets.json");

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	solidity: {
		version: "0.8.0",
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
	networks: {
		rinkeby: {
			url: "https://rinkeby.infura.io/v3/" + infuraKey,
			gas: 10000000,
			accounts: { mnemonic: mnemonic },
		},
		kovan: {
			url: `https://eth-kovan.alchemyapi.io/v2/${alchemyApiKey}`,
			accounts: { mnemonic: mnemonic },
		},
		testnet: {
			url: "https://data-seed-prebsc-1-s1.binance.org:8545",
			chainId: 97,
			gas: 2100000,
			gasPrice: 20000000000,
			accounts: { mnemonic: mnemonic }
		},
		mainnet: {
			url: "https://bsc-dataseed.binance.org/",
			chainId: 56,
			gasPrice: 20000000000,
			accounts: { mnemonic: mnemonic },
		},
		mumbai: {
			url: "https://matic-mumbai.chainstacklabs.com",
			chainId: 80001,
			gasPrice: 20000000000,
			accounts: { mnemonic: mnemonic }
		},
	},
	etherscan: {
		apiKey: RINKEBY_API_KEY,
	},
};
