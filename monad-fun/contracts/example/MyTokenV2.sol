// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./MyTokenV1.sol";

/**
 *  Transparent Proxy 升級示範
 */
contract MyTokenV2 is MyTokenV1 {
    // 新增一個函式來確認合約版本
    function version() public pure returns (string memory) {
        return "V2";
    }
}
