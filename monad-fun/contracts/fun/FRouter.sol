// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import "./FFactory.sol";
import "./IFPair.sol";

// import "../tax/IBondingTax.sol";

contract FRouter is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    FFactory public factory;
    address public assetToken;
    address public taxManager;

    error ZeroPairAddress();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address factory_, // FFactory address
        address assetToken_ // virtual asset token address
    ) external initializer {
        __ReentrancyGuard_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        require(factory_ != address(0), "Zero addresses are not allowed.");
        require(assetToken_ != address(0), "Zero addresses are not allowed.");

        factory = FFactory(factory_);
        assetToken = assetToken_;
    }

    function getAmountsOut(
        address token,
        address assetToken_,
        uint256 amountIn
    ) public view returns (uint256 _amountOut) {
        require(token != address(0), "Zero addresses are not allowed.");

        address pairAddress = factory.getPair(token, assetToken);

        if (pairAddress == address(0)) {
            revert ZeroPairAddress(); // Revert if pair does not exist
        }

        IFPair pair = IFPair(pairAddress);
        // A:erc20 token, B:oasis token
        (uint256 reserveA, uint256 reserveB) = pair.getReserves();

        uint256 k = pair.kLast();
        uint256 amountOut;

        if (assetToken_ == assetToken) {
            uint256 newReserveB = reserveB + amountIn;

            uint256 newReserveA = k / newReserveB;

            amountOut = reserveA - newReserveA;
        } else {
            uint256 newReserveA = reserveA + amountIn;

            uint256 newReserveB = k / newReserveA;

            amountOut = reserveB - newReserveB;
        }
        return amountOut;
    }

    function addInitialLiquidity(
        address token_,
        uint256 amountToken_,
        uint256 amountAsset_
    ) public onlyRole(EXECUTOR_ROLE) returns (uint256, uint256) {
        // 先檢查原本的reserve是多少
        require(token_ != address(0), "Zero addresses are not allowed.");

        address pairAddress = factory.getPair(token_, assetToken);

        if (pairAddress == address(0)) {
            revert ZeroPairAddress(); // Revert if pair does not exist
        }

        IFPair pair = IFPair(pairAddress);

        IERC20 token = IERC20(token_);

        // transfer initial 1B MEME token 給 pair
        token.safeTransferFrom(msg.sender, pairAddress, amountToken_);

        // amounToken_ 1B ether MEME token
        // amountAsset_ 6000 ether initial asset token (virtual)
        // mint 不是真的 mint, 是初始化 pair 的 reserve
        pair.mint(amountToken_, amountAsset_);

        return (amountToken_, amountAsset_);
    }

    function sell(
        uint256 amountIn,
        address tokenAddress,
        address to
    ) public nonReentrant onlyRole(EXECUTOR_ROLE) returns (uint256, uint256) {
        require(tokenAddress != address(0), "Zero addresses are not allowed.");
        require(to != address(0), "Zero addresses are not allowed.");
        require(amountIn != 0, "Zero Amount In");
        address pairAddress = factory.getPair(tokenAddress, assetToken);

        if (pairAddress == address(0)) {
            revert ZeroPairAddress(); // Revert if pair does not exist
        }

        IFPair pair = IFPair(pairAddress);

        IERC20 token = IERC20(tokenAddress);

        uint256 amountOut = getAmountsOut(tokenAddress, address(0), amountIn);

        token.safeTransferFrom(to, pairAddress, amountIn);

        uint fee = factory.sellTax();
        uint256 txFee = (fee * amountOut) / 100;

        uint256 amount = amountOut - txFee;
        address feeTo = factory.taxVault();

        pair.transferAsset(to, amount);
        pair.transferAsset(feeTo, txFee);

        pair.swap(amountIn, 0, 0, amountOut);

        // REMOVE this due to the feeTo will be simply set as a user/manager address
        // if (feeTo == taxManager) {
        //     IBondingTax(taxManager).swapForAsset();
        // }

        return (amountIn, amountOut);
    }

    function buy(
        uint256 amountIn,
        address tokenAddress,
        address to
    ) public onlyRole(EXECUTOR_ROLE) nonReentrant returns (uint256, uint256) {
        require(tokenAddress != address(0), "Zero addresses are not allowed.");
        require(to != address(0), "Zero addresses are not allowed.");
        require(amountIn > 0, "amountIn must be greater than 0");

        address pair = factory.getPair(tokenAddress, assetToken);

        if (pair == address(0)) {
            revert ZeroPairAddress(); // Revert if pair does not exist
        }

        uint fee = factory.buyTax();
        uint256 txFee = (fee * amountIn) / 100;
        address feeTo = factory.taxVault();

        uint256 amount = amountIn - txFee;

        IERC20(assetToken).safeTransferFrom(to, pair, amount);

        IERC20(assetToken).safeTransferFrom(to, feeTo, txFee);

        uint256 amountOut = getAmountsOut(tokenAddress, assetToken, amount);

        IFPair(pair).transferTo(to, amountOut);

        IFPair(pair).swap(0, amountOut, amount, 0);

        // REMOVE this due to the feeTo will be simply set as a user/manager address
        // if (feeTo == taxManager) {
        //     IBondingTax(taxManager).swapForAsset();
        // }

        return (amount, amountOut);
    }

    //  transfer virtual to msg.sender
    function graduate(
        address tokenAddress
    ) public onlyRole(EXECUTOR_ROLE) nonReentrant {
        require(tokenAddress != address(0), "Zero addresses are not allowed.");
        address pair = factory.getPair(tokenAddress, assetToken);

        if (pair == address(0)) {
            revert ZeroPairAddress(); // Revert if pair does not exist
        }

        uint256 assetBalance = IFPair(pair).assetBalance();
        FPair(pair).transferAsset(msg.sender, assetBalance);
    }

    function approval(
        address pair,
        address asset,
        address spender,
        uint256 amount
    ) public onlyRole(EXECUTOR_ROLE) nonReentrant {
        require(spender != address(0), "Zero addresses are not allowed.");

        IFPair(pair).approval(spender, asset, amount);
    }

    function setTaxManager(address newManager) public onlyRole(ADMIN_ROLE) {
        taxManager = newManager;
    }
}
