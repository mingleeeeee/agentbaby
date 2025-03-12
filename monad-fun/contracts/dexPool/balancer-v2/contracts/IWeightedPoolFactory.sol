// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.28;

// import {TokenConfig, PoolRoleAccounts, TokenType, IRateProvider} from "../../interfaces/contracts/vault/VaultTypes.sol";
import {IERC20 as BalancerIERC20} from "../@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";
import "../@balancer-labs/v2-interfaces/contracts/pool-utils/IRateProvider.sol";

interface IWeightedPoolFactory {
    /**
     * @notice Deploys a new `WeightedPool`.
     * @dev Tokens must be sorted for pool registration.
     * @param name The name of the pool
     * @param symbol The symbol of the pool
     * @param tokens An array of descriptors for the tokens the pool will manage
     * @param normalizedWeights The pool weights (must add to FixedPoint.ONE)
     * @param rateProviders An array of rate providers for the tokens
     * @param swapFeePercentage Initial swap fee percentage
     * @param owner The owner of the pool
     */
    function create(
        string memory name,
        string memory symbol,
        BalancerIERC20[] memory tokens,
        uint256[] memory normalizedWeights,
        IRateProvider[] memory rateProviders,
        uint256 swapFeePercentage,
        address owner
    ) external returns (address);

    function getPoolVersion() external view returns (string memory);

    function version() external view returns (string memory);
}
