
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const providerOptions = {
	walletconnect: {
		package: WalletConnectProvider,
		options: {
			infuraId: 'e5a59fc70866465ab79a218c72f22eec'
		},
	}
};

const web3modal = new Web3Modal({
	cacheProvider: false, // optional
	providerOptions // required
});

export const connectWeb3Wallet = async () => {
	const connection = await web3modal.connect();
	return connection;
}

