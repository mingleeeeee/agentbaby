// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * Transparent Proxy 版本，不繼承 UUPSUpgradeable
 */
contract MyTokenV1 is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    // 供測試使用的變數
    uint256 public myValue;

    // constructor() {
    //     _disableInitializers();
    // }

    function initialize(
        string memory name,
        string memory symbol,
        uint256 initialValue
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(msg.sender);

        // 讓部署者持有一些初始代幣
        _mint(msg.sender, 10000000000 * 10 ** decimals());

        // 初始化自訂變數
        myValue = initialValue;
    }

    // 只有 Owner 能設定
    function setMyValue(uint256 newValue) public onlyOwner {
        myValue = newValue;
    }
}
