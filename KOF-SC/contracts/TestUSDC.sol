//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDC is ERC20, Ownable {
    uint256 public tokenTotalSupply = 20000;

    constructor() ERC20("TestUSDC", "TestUSDC") {
        _mint(msg.sender, tokenTotalSupply);
    }
}
