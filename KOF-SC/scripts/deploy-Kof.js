// scripts/deploy.js
require("@nomiclabs/hardhat-ethers");

async function main() {

	const KingOfFool = await ethers.getContractFactory("KingOfFool");
	console.log("Deploying ...");
	const box = await KingOfFool.deploy(
		"0xeb8f08a975Ab53E34D8a0330E0D34de942C95926"
	);
	console.log("KingOfFool :", box.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
