// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../virtualPersona/IKuru.sol";

contract TestKuru is ERC20 {
    using SafeERC20 for IERC20;

    address public kuruRouterAddress;
    address public memeToken;
    address public pairToken;

    address public kuruMarketProxyAddress;
    address public kuruVaultAddress;
    address public lpOwner;

    constructor(
        address kuruRouterAddress_,
        address pairToken_,
        address lpOwner_
    ) ERC20("TEST KURU", "TK") {
        kuruRouterAddress = kuruRouterAddress_;
        memeToken = address(this);
        pairToken = pairToken_;
        lpOwner = lpOwner_;
    }

    function mintTokenToThisContract() external {
        require(
            IERC20(pairToken).balanceOf(msg.sender) >= 1000 ether,
            "Insufficient pair token balance"
        );

        // Transfer 1000 ether worth of pairToken from the sender to this contract
        IERC20(pairToken).transferFrom(msg.sender, address(this), 1000 ether);

        // Mint tokens to this contract
        _mint(address(this), 1000000 * 10 ** 18);

        // then in this contract will have 100000 ether token and 1000 ether pairToken
    }

    function createMarket() external {
        require(kuruMarketProxyAddress == address(0), "Market already created");

        //require pair token > 1000 in this contract
        require(
            IERC20(pairToken).balanceOf(address(this)) >= 1000 ether,
            "Pair token balance < 1000"
        );

        // note: https://docs.kuru.io/developers/deploy_market
        // create a market
        kuruMarketProxyAddress = IKuruRouter(kuruRouterAddress).deployProxy(
            IOrderBook.OrderBookType.TYPE1, //type: two ERC20 address
            address(this), //baseAssetAddress: new tokenAddress
            pairToken, //quoteAssetAddress: WMON address
            10 ** 10, //sizePrecision
            10 ** 8, //pricePrecision
            100, //tickSize
            10 ** 7, //minSize
            10 ** 15, //maxSize
            0, //takerFeeBps, 30 means 0.3%
            0, //makerFeeBps, 10 means 0.1%
            100 //kuruAmmSpread
        );
    }

    function addLiquidity() external {
        (
            address kuruAmmVault,
            uint256 vaultBestBid,
            uint96 bidPartiallyFilledSize,
            uint256 vaultBestAsk,
            uint96 askPartiallyFilledSize,
            uint96 vaultBidOrderSize,
            uint96 vaultAskOrderSize,
            uint96 spread
        ) = IKuruVault(kuruMarketProxyAddress).getVaultParams();

        // store vault address
        kuruVaultAddress = kuruAmmVault;

        //  approve token to kuruAmmVault vault
        _approve(address(this), kuruAmmVault, type(uint256).max);
        IERC20(pairToken).approve(kuruAmmVault, type(uint256).max);

        IDepositContract(kuruAmmVault).deposit(
            balanceOf(address(this)), // NEW MEMETOKEN
            IERC20(pairToken).balanceOf(address(this)), // WMON
            lpOwner // lp token receiver
        );
    }
}
