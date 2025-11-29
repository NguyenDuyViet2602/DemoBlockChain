// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./LearnHubToken.sol";

/**
 * @title RewardDistribution
 * @dev Contract to manage reward distribution for learning activities
 */
contract RewardDistribution is AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    LearnHubToken public token;
    
    // Reward amounts for different activities (in LHT, with 18 decimals)
    uint256 public lessonReward = 10 * 10**18; // 10 LHT
    uint256 public quizBaseReward = 10 * 10**18; // 10 LHT base
    uint256 public assignmentReward = 50 * 10**18; // 50 LHT
    uint256 public courseCompletionReward = 200 * 10**18; // 200 LHT
    uint256 public reviewReward = 5 * 10**18; // 5 LHT
    uint256 public forumReward = 3 * 10**18; // 3 LHT
    uint256 public streakReward = 20 * 10**18; // 20 LHT

    // Track rewards to prevent double claiming
    mapping(address => mapping(string => mapping(uint256 => bool))) public rewardsClaimed;
    // Format: rewardsClaimed[user][activityType][activityId] = true/false

    event RewardDistributed(
        address indexed user,
        string activityType,
        uint256 activityId,
        uint256 amount,
        string reason
    );

    constructor(address admin, address tokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        token = LearnHubToken(tokenAddress);
    }

    modifier onlyDistributor() {
        require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "RewardDistribution: Not a distributor");
        _;
    }

    /**
     * @dev Distribute reward for completing a lesson
     */
    function distributeLessonReward(address user, uint256 lessonId) 
        external 
        onlyDistributor 
    {
        string memory activityType = "lesson";
        require(!rewardsClaimed[user][activityType][lessonId], "RewardDistribution: Already claimed");
        
        rewardsClaimed[user][activityType][lessonId] = true;
        token.mint(user, lessonReward, "Lesson completion reward");
        
        emit RewardDistributed(user, activityType, lessonId, lessonReward, "Lesson completed");
    }

    /**
     * @dev Distribute reward for completing a quiz
     * @param score Score percentage (0-100)
     */
    function distributeQuizReward(address user, uint256 quizId, uint256 score) 
        external 
        onlyDistributor 
    {
        require(score >= 70, "RewardDistribution: Score too low");
        
        string memory activityType = "quiz";
        require(!rewardsClaimed[user][activityType][quizId], "RewardDistribution: Already claimed");
        
        // Calculate reward based on score (70-100% = 10-50 LHT)
        uint256 reward = quizBaseReward + ((score - 70) * quizBaseReward) / 30;
        if (reward > 50 * 10**18) reward = 50 * 10**18; // Cap at 50 LHT
        
        rewardsClaimed[user][activityType][quizId] = true;
        token.mint(user, reward, "Quiz completion reward");
        
        emit RewardDistributed(user, activityType, quizId, reward, "Quiz completed");
    }

    /**
     * @dev Distribute reward for completing an assignment
     */
    function distributeAssignmentReward(address user, uint256 assignmentId) 
        external 
        onlyDistributor 
    {
        string memory activityType = "assignment";
        require(!rewardsClaimed[user][activityType][assignmentId], "RewardDistribution: Already claimed");
        
        rewardsClaimed[user][activityType][assignmentId] = true;
        token.mint(user, assignmentReward, "Assignment completion reward");
        
        emit RewardDistributed(user, activityType, assignmentId, assignmentReward, "Assignment completed");
    }

    /**
     * @dev Distribute reward for completing a course
     */
    function distributeCourseCompletionReward(address user, uint256 courseId) 
        external 
        onlyDistributor 
    {
        string memory activityType = "course";
        require(!rewardsClaimed[user][activityType][courseId], "RewardDistribution: Already claimed");
        
        rewardsClaimed[user][activityType][courseId] = true;
        token.mint(user, courseCompletionReward, "Course completion reward");
        
        emit RewardDistributed(user, activityType, courseId, courseCompletionReward, "Course completed");
    }

    /**
     * @dev Distribute reward for writing a review
     */
    function distributeReviewReward(address user, uint256 reviewId) 
        external 
        onlyDistributor 
    {
        string memory activityType = "review";
        require(!rewardsClaimed[user][activityType][reviewId], "RewardDistribution: Already claimed");
        
        rewardsClaimed[user][activityType][reviewId] = true;
        token.mint(user, reviewReward, "Review reward");
        
        emit RewardDistributed(user, activityType, reviewId, reviewReward, "Review submitted");
    }

    /**
     * @dev Distribute reward for forum participation
     */
    function distributeForumReward(address user, uint256 forumId) 
        external 
        onlyDistributor 
    {
        string memory activityType = "forum";
        require(!rewardsClaimed[user][activityType][forumId], "RewardDistribution: Already claimed");
        
        rewardsClaimed[user][activityType][forumId] = true;
        token.mint(user, forumReward, "Forum participation reward");
        
        emit RewardDistributed(user, activityType, forumId, forumReward, "Forum participation");
    }

    /**
     * @dev Distribute reward for login streak
     * Day 1: 20 LHT, Day 2+: +10 LHT per day (Day 2 = 30, Day 3 = 40, ...)
     */
    function distributeStreakReward(address user, uint256 streakDays) 
        external 
        onlyDistributor 
    {
        require(streakDays >= 1, "RewardDistribution: Streak must be at least 1 day");
        
        string memory activityType = "streak";
        require(!rewardsClaimed[user][activityType][streakDays], "RewardDistribution: Already claimed");
        
        // Day 1: 20 LHT, Day 2+: 20 + (streakDays - 1) * 10
        uint256 reward;
        if (streakDays == 1) {
            reward = 20 * 10**18; // 20 LHT for first day
        } else {
            reward = (20 + (streakDays - 1) * 10) * 10**18; // 20 + (n-1)*10 LHT
        }
        
        rewardsClaimed[user][activityType][streakDays] = true;
        token.mint(user, reward, "Login streak reward");
        
        emit RewardDistributed(user, activityType, streakDays, reward, "Login streak achieved");
    }

    /**
     * @dev Update reward amounts (only admin)
     */
    function updateRewardAmounts(
        uint256 _lessonReward,
        uint256 _quizBaseReward,
        uint256 _assignmentReward,
        uint256 _courseCompletionReward,
        uint256 _reviewReward,
        uint256 _forumReward,
        uint256 _streakReward
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lessonReward = _lessonReward;
        quizBaseReward = _quizBaseReward;
        assignmentReward = _assignmentReward;
        courseCompletionReward = _courseCompletionReward;
        reviewReward = _reviewReward;
        forumReward = _forumReward;
        streakReward = _streakReward;
    }

    /**
     * @dev Grant distributor role (only admin)
     */
    function grantDistributorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, account);
    }

    /**
     * @dev Check if reward has been claimed
     */
    function isRewardClaimed(address user, string memory activityType, uint256 activityId) 
        external 
        view 
        returns (bool) 
    {
        return rewardsClaimed[user][activityType][activityId];
    }
}

