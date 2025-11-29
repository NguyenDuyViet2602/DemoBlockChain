// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./LearnHubToken.sol";

/**
 * @title CoursePayment
 * @dev Contract to handle course purchases using LHT tokens
 */
contract CoursePayment is AccessControl {
    bytes32 public constant PAYMENT_HANDLER_ROLE = keccak256("PAYMENT_HANDLER_ROLE");
    
    LearnHubToken public token;
    address public treasury; // Address to receive payment tokens
    
    // Exchange rate: 1 VND = ? LHT (with 18 decimals)
    // Example: 1000 LHT = 1 VND means rate = 1000 * 10^18
    uint256 public vndToLhtRate; // Amount of LHT (with 18 decimals) per 1 VND
    
    // Track payments to prevent double spending
    mapping(uint256 => bool) public orderPaid; // orderId => paid
    
    event CoursePurchased(
        address indexed buyer,
        uint256 indexed orderId,
        uint256 vndAmount,
        uint256 lhtAmount,
        string reason
    );
    
    event ExchangeRateUpdated(uint256 newRate);
    event TreasuryUpdated(address newTreasury);

    constructor(address admin, address tokenAddress, address treasuryAddress, uint256 initialRate) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAYMENT_HANDLER_ROLE, admin);
        token = LearnHubToken(tokenAddress);
        treasury = treasuryAddress;
        vndToLhtRate = initialRate;
    }

    modifier onlyPaymentHandler() {
        require(hasRole(PAYMENT_HANDLER_ROLE, msg.sender), "CoursePayment: Not a payment handler");
        _;
    }

    /**
     * @dev Process course payment using LHT tokens
     * @param buyer Address of the buyer
     * @param orderId Order ID from backend
     * @param vndAmount Amount in VND
     * @param reason Reason for payment (for logging)
     */
    function payWithLHT(
        address buyer,
        uint256 orderId,
        uint256 vndAmount,
        string memory reason
    ) external onlyPaymentHandler {
        require(!orderPaid[orderId], "CoursePayment: Order already paid");
        require(buyer != address(0), "CoursePayment: Invalid buyer address");
        require(vndAmount > 0, "CoursePayment: Invalid amount");
        
        // Calculate LHT amount needed
        uint256 lhtAmount = (vndAmount * vndToLhtRate) / 1e18;
        require(lhtAmount > 0, "CoursePayment: LHT amount too small");
        
        // Check buyer balance
        require(token.balanceOf(buyer) >= lhtAmount, "CoursePayment: Insufficient LHT balance");
        
        // Transfer tokens from buyer to treasury
        require(token.transferFrom(buyer, treasury, lhtAmount), "CoursePayment: Transfer failed");
        
        // Mark order as paid
        orderPaid[orderId] = true;
        
        emit CoursePurchased(buyer, orderId, vndAmount, lhtAmount, reason);
    }

    /**
     * @dev Update exchange rate (only admin)
     * @param newRate New exchange rate (LHT with 18 decimals per 1 VND)
     */
    function updateExchangeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate > 0, "CoursePayment: Invalid rate");
        vndToLhtRate = newRate;
        emit ExchangeRateUpdated(newRate);
    }

    /**
     * @dev Update treasury address (only admin)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "CoursePayment: Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @dev Calculate LHT amount needed for a VND amount
     * @param vndAmount Amount in VND
     * @return lhtAmount Amount in LHT (with 18 decimals)
     */
    function calculateLHTAmount(uint256 vndAmount) external view returns (uint256) {
        return (vndAmount * vndToLhtRate) / 1e18;
    }

    /**
     * @dev Check if order has been paid
     * @param orderId Order ID
     * @return paid Whether the order has been paid
     */
    function isOrderPaid(uint256 orderId) external view returns (bool) {
        return orderPaid[orderId];
    }
}

