//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./SafeMath.sol";
import "./IERC20.sol";
import "./SafeERC20.sol";
import "./ReentrancyGuard.sol";
import "./Ownable.sol";

contract KingOfFool is ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    DepositInfo[] private Users;
    struct DepositInfo {
        address addr;
        uint256 amt;
        string currency;
    }

    event Deposited(address indexed _user, uint256 _amount);
    event Transferred(address indexed _user, string _msg);

    address USDC;

    constructor(address _usdc) {
        USDC = _usdc;
    }

    /**
     * @dev A method to deposit ETH
     * @param _addr Adsress of depositors
     */
    function depositETH(address _addr) external payable {
        _addr = msg.sender;
        require(msg.value > 0, "Amount should much than 0");
        if (Users.length == 0) {
            Users.push(
                DepositInfo({addr: _addr, amt: msg.value, currency: "ETH"})
            );
            emit Deposited(_addr, msg.value);
        } else {
            require(
                _addr != Users[Users.length - 1].addr,
                "You have already deposited!"
            );
            payable(Users[Users.length - 1].addr).transfer(msg.value);
            emit Transferred(_addr, "You became a King of the Fools!");
        }
    }

    /**
     * @dev A method to deposit USDC
     * @param _amount Amount to be deposited
     * @param _addr Adsress of depositors
     */
    function depositUSDC(address _addr, uint256 _amount) external {
        require(_amount > 0, "Amount should much than 0");
        _addr = msg.sender;
        if (Users.length == 0) {
            IERC20(USDC).transferFrom(_addr, address(this), _amount);
            Users.push(
                DepositInfo({addr: _addr, amt: _amount, currency: "USDC"})
            );
            emit Deposited(_addr, _amount);
        } else {
            require(
                _addr != Users[Users.length - 1].addr,
                "You have already deposited!"
            );
            IERC20(USDC).transferFrom(_addr, address(this), _amount);
            IERC20(USDC).transfer(Users[Users.length - 1].addr, _amount);
            emit Transferred(_addr, "You became a King of the Fools!");
        }
    }

    /**
     * @dev A method to get ETH Balance
     */
    function getETHBalance() external view returns (uint256) {
        return (address(this).balance);
    }

    /**
     * @dev A method to get USDC Balance
     */
    function getUSDCBalance() external view returns (uint256) {
        return (IERC20(USDC).balanceOf(address(this)));
    }

    /**
     * @dev A method to get deposited info
     */
    function getPrevPersonInfo() external view returns (DepositInfo memory) {
        require(Users.length > 0, "Nobody deposited!");
        return (Users[Users.length - 1]);
    }

    /**
     * @dev A method to get deposit status
     */
    function isUserInfo() external view returns (bool) {
        if (Users.length == 0) {
            return false;
        } else {
            return true;
        }
    }

    function initializeUsers() external onlyOwner {
        require(Users.length > 0, "Nobody deposited");
        Users.pop();
    }
}
