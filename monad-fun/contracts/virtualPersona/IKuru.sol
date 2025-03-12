// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IOrderBook {
    enum OrderBookType {
        TYPE1, // 0, Market with two ERC20 tokens
        TYPE2, // 1, Market with the base token as MON (ex. MON-USDC)
        TYPE3 // 2, Market with the quote token as MON (ex. USDC-MON)
    }
}

interface IKuruRouter {
    function deployProxy(
        IOrderBook.OrderBookType _type,
        address _baseAssetAddress,
        address _quoteAssetAddress,
        uint96 _sizePrecision,
        uint32 _pricePrecision,
        uint32 _tickSize,
        uint96 _minSize,
        uint96 _maxSize,
        uint256 _takerFeeBps,
        uint256 _makerFeeBps,
        uint96 _kuruAmmSpread
    ) external returns (address proxy);
}

interface IKuruVault {
    function getVaultParams()
        external
        view
        returns (
            address,
            uint256,
            uint96,
            uint256,
            uint96,
            uint96,
            uint96,
            uint96
        );
}

interface IDepositContract {
    function deposit(
        uint256 amount1,
        uint256 amount2,
        address receiver
    ) external payable returns (uint256);
}
