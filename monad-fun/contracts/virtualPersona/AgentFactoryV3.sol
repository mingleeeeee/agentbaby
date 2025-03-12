// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import "./IAgentFactoryV3.sol";
import "./IAgentToken.sol";

contract AgentFactoryV3 is
    IAgentFactoryV3,
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 private _nextId;
    address public tokenImplementation;
    uint256 public applicationThreshold; // for proposeAgent

    address[] public allTokens;
    address[] public allDAOs;

    address public assetToken; // Base currency
    uint256 public maturityDuration; // Staking duration in seconds for initial LP. eg: 10years

    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE"); // Able to withdraw and execute applications

    event NewPersonaOasis(address token, address lp);
    event NewPersona(
        uint256 virtualId,
        address token,
        address dao,
        address tba,
        address veToken,
        address lp
    );
    event NewApplication(uint256 id);

    enum ApplicationStatus {
        Active,
        Executed,
        Withdrawn
    }

    struct Application {
        string name;
        string symbol;
        string tokenURI;
        ApplicationStatus status;
        uint256 withdrawableAmount;
        address proposer;
        uint8[] cores;
        uint256 proposalEndBlock;
        uint256 virtualId;
        bytes32 tbaSalt;
        address tbaImplementation;
        uint32 daoVotingPeriod;
        uint256 daoThreshold;
    }

    mapping(uint256 => Application) private _applications;

    address public gov; // Deprecated in v2, execution of application does not require DAO decision anymore

    modifier onlyGov() {
        require(msg.sender == gov, "Only DAO can execute proposal");
        _;
    }

    event ApplicationThresholdUpdated(uint256 newThreshold);
    event GovUpdated(address newGov);
    event ImplContractsUpdated(address token, address dao);
    // REMOVE
    // address private _vault; // Vault to hold all Virtual NFTs

    bool internal locked;

    modifier noReentrant() {
        require(!locked, "cannot reenter");
        locked = true;
        _;
        locked = false;
    }

    ///////////////////////////////////////////////////////////////
    // V2 Storage
    ///////////////////////////////////////////////////////////////
    address[] public allTradingTokens;
    address private _tokenAdmin;
    address public defaultDelegatee;

    // Default agent token params
    bytes private _tokenSupplyParams;
    bytes private _tokenTaxParams;

    bytes32 public constant BONDING_ROLE = keccak256("BONDING_ROLE");

    ///////////////////////////////////////////////////////////////

    // NEW
    // address private _balancerVault; // Balancer vault address
    address private _kuruRouterAddress;
    string public _baseTokenSymbol;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address tokenImplementation_,
        address assetToken_,
        uint256 applicationThreshold_,
        uint256 nextId_,
        address kuruRouterAddress_,
        string memory baseTokenSymbol_
    ) public initializer {
        __Pausable_init();
        __AccessControl_init();

        tokenImplementation = tokenImplementation_;
        assetToken = assetToken_;
        applicationThreshold = applicationThreshold_;
        _nextId = nextId_;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _kuruRouterAddress = kuruRouterAddress_;
        _baseTokenSymbol = baseTokenSymbol_;
    }

    function getApplication(
        uint256 proposalId
    ) public view returns (Application memory) {
        return _applications[proposalId];
    }

    function proposeAgent(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        uint8[] memory cores,
        bytes32 tbaSalt,
        address tbaImplementation,
        uint32 daoVotingPeriod,
        uint256 daoThreshold
    ) public whenNotPaused returns (uint256) {
        address sender = _msgSender();
        require(
            IERC20(assetToken).balanceOf(sender) >= applicationThreshold,
            "Insufficient asset token"
        );
        require(
            IERC20(assetToken).allowance(sender, address(this)) >=
                applicationThreshold,
            "Insufficient asset token allowance"
        );
        require(cores.length > 0, "Cores must be provided");

        IERC20(assetToken).safeTransferFrom(
            sender,
            address(this),
            applicationThreshold
        );

        uint256 id = _nextId++;
        uint256 proposalEndBlock = block.number; // No longer required in v2
        Application memory application = Application(
            name,
            symbol,
            tokenURI,
            ApplicationStatus.Active,
            applicationThreshold,
            sender,
            cores,
            proposalEndBlock,
            0,
            tbaSalt,
            tbaImplementation,
            daoVotingPeriod,
            daoThreshold
        );
        _applications[id] = application;
        emit NewApplication(id);

        return id;
    }

    function withdraw(uint256 id) public noReentrant {
        Application storage application = _applications[id];

        require(
            msg.sender == application.proposer ||
                hasRole(WITHDRAW_ROLE, msg.sender),
            "Not proposer"
        );

        require(
            application.status == ApplicationStatus.Active,
            "Application is not active"
        );

        require(
            block.number > application.proposalEndBlock,
            "Application is not matured yet"
        );

        uint256 withdrawableAmount = application.withdrawableAmount;

        application.withdrawableAmount = 0;
        application.status = ApplicationStatus.Withdrawn;

        IERC20(assetToken).safeTransfer(
            application.proposer,
            withdrawableAmount
        );
    }

    function _executeApplication(
        uint256 id,
        bool canStake,
        bytes memory tokenSupplyParams_,
        address kuruRouterAddress_,
        string memory baseTokenSymbol_
    ) internal returns (address) {
        require(
            _applications[id].status == ApplicationStatus.Active,
            "Application is not active"
        );

        require(_tokenAdmin != address(0), "Token admin not set");

        Application storage application = _applications[id];

        uint256 initialAmount = application.withdrawableAmount;
        application.withdrawableAmount = 0;
        application.status = ApplicationStatus.Executed;
        // C1
        // create new Agent Token contract on DEX
        // initialize Agent Token
        address token = _createNewAgentToken(
            application.name,
            application.symbol,
            tokenSupplyParams_,
            kuruRouterAddress_,
            baseTokenSymbol_
        );

        // C2
        // create LP Pool
        // address lp = IAgentToken(token).liquidityPools()[0];
        // transfer virtuals to new Agent Token contract
        IERC20(assetToken).safeTransfer(token, initialAmount);
        // add Initial liquidity
        // NOTE:MONAD need to change
        IAgentToken(token).addInitialLiquidity(address(this));

        return token;
    }

    // manual execute application
    function executeApplication(uint256 id, bool canStake) public noReentrant {
        // This will bootstrap an Agent with following components:
        // C1: Agent Token
        // C2: LP Pool + Initial liquidity
        // C3: Agent veToken - remove this
        // C4: Agent DAO - remove this
        // C5: Agent NFT - remove this
        // C6: TBA - remove this
        // C7: Stake liquidity token to get veToken - remove this

        Application storage application = _applications[id];

        require(
            msg.sender == application.proposer ||
                hasRole(WITHDRAW_ROLE, msg.sender),
            "Not proposer"
        );

        _executeApplication(
            id,
            canStake,
            _tokenSupplyParams,
            _kuruRouterAddress,
            _baseTokenSymbol
        );
    }

    // DEX token : initialize Agent Token
    function _createNewAgentToken(
        string memory name,
        string memory symbol,
        bytes memory tokenSupplyParams_,
        address kuruRouterAddress_,
        string memory baseTokenSymbol_
    ) internal returns (address instance) {
        instance = Clones.clone(tokenImplementation);
        // initialize Agent Token
        IAgentToken(instance).initialize(
            [_tokenAdmin, assetToken],
            abi.encode(name, symbol),
            tokenSupplyParams_,
            _tokenTaxParams,
            kuruRouterAddress_,
            baseTokenSymbol_
        );

        allTradingTokens.push(instance);
        return instance;
    }

    function totalAgents() public view returns (uint256) {
        return allTokens.length;
    }

    function setApplicationThreshold(
        uint256 newThreshold
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        applicationThreshold = newThreshold;
        emit ApplicationThresholdUpdated(newThreshold);
    }

    function setImplementations(
        address token
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenImplementation = token;
    }

    function setMaturityDuration(
        uint256 newDuration
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        maturityDuration = newDuration;
    }

    function setTokenAdmin(
        address newTokenAdmin
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenAdmin = newTokenAdmin;
    }

    // manual execute
    function setTokenSupplyParams(
        uint256 maxSupply,
        uint256 lpSupply,
        uint256 vaultSupply,
        uint256 maxTokensPerWallet,
        uint256 maxTokensPerTxn,
        uint256 botProtectionDurationInSeconds,
        address vault
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenSupplyParams = abi.encode(
            maxSupply,
            lpSupply,
            vaultSupply,
            maxTokensPerWallet,
            maxTokensPerTxn,
            botProtectionDurationInSeconds,
            vault
        );
    }

    function setTokenTaxParams(
        uint256 projectBuyTaxBasisPoints,
        uint256 projectSellTaxBasisPoints,
        uint256 taxSwapThresholdBasisPoints,
        address projectTaxRecipient
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenTaxParams = abi.encode(
            projectBuyTaxBasisPoints,
            projectSellTaxBasisPoints,
            taxSwapThresholdBasisPoints,
            projectTaxRecipient
        );
    }

    function setAssetToken(
        address newToken
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        assetToken = newToken;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _msgSender()
        internal
        view
        override(ContextUpgradeable)
        returns (address sender)
    {
        sender = ContextUpgradeable._msgSender();
    }

    function _msgData()
        internal
        view
        override(ContextUpgradeable)
        returns (bytes calldata)
    {
        return ContextUpgradeable._msgData();
    }

    function initFromBondingCurve(
        string memory name,
        string memory symbol,
        uint8[] memory cores,
        bytes32 tbaSalt,
        address tbaImplementation,
        uint32 daoVotingPeriod,
        uint256 daoThreshold,
        uint256 applicationThreshold_ // assetBalance in bonding curve
    ) public whenNotPaused onlyRole(BONDING_ROLE) returns (uint256) {
        address sender = _msgSender();
        require(
            IERC20(assetToken).balanceOf(sender) >= applicationThreshold_,
            "Insufficient asset token"
        );
        require(
            IERC20(assetToken).allowance(sender, address(this)) >=
                applicationThreshold_,
            "Insufficient asset token allowance"
        );
        require(cores.length > 0, "Cores must be provided");

        // transfer from sender(bonding contract address) to this contract
        IERC20(assetToken).safeTransferFrom(
            sender,
            address(this),
            applicationThreshold_
        );

        uint256 id = _nextId++;
        uint256 proposalEndBlock = block.number; // No longer required in v2
        Application memory application = Application(
            name,
            symbol,
            "",
            ApplicationStatus.Active,
            applicationThreshold_,
            sender,
            cores,
            proposalEndBlock,
            0,
            tbaSalt,
            tbaImplementation,
            daoVotingPeriod,
            daoThreshold
        );
        _applications[id] = application;
        emit NewApplication(id);

        return id;
    }

    // create DEX MEME COIN
    function executeBondingCurveApplication(
        uint256 id,
        uint256 totalSupply,
        uint256 lpSupply, // remaining MEME tokens in inside pool pair
        address vault // fpair address
    ) public onlyRole(BONDING_ROLE) noReentrant returns (address) {
        bytes memory tokenSupplyParams = abi.encode(
            totalSupply, // maxSupply
            lpSupply, // lpSupply, remaining MEME tokens in inside pool pair
            totalSupply - lpSupply, // vaultSupply (sale in inside pool, for unwrap)
            totalSupply, // maxTokensPerWallet
            totalSupply, // maxTokensPerTxn
            0, // botProtectionDurationInSeconds
            vault // vault address, the place stored new agent token(fpair address)
        );

        // NEW: add poolFactoryAddress param => kuruRouterAddress
        address token = _executeApplication(
            id,
            true,
            tokenSupplyParams,
            _kuruRouterAddress,
            _baseTokenSymbol
        );

        return token;
    }

    function setDefaultDelegatee(
        address newDelegatee
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultDelegatee = newDelegatee;
    }

    function _contextSuffixLength()
        internal
        view
        override(ContextUpgradeable)
        returns (uint256)
    {
        return super._contextSuffixLength();
    }

    function getKuruRouterAddress() public view returns (address) {
        return _kuruRouterAddress;
    }

    function setKuruRouterAddress(
        address kuruRouterAddress_
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _kuruRouterAddress = kuruRouterAddress_;
    }
}
