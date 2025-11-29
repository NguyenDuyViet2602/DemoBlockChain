// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateNFT
 * @dev ERC-721 NFT for course completion certificates
 */
contract CertificateNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to course ID
    mapping(uint256 => uint256) public tokenToCourse;
    // Mapping from user address to course ID to token ID (to prevent duplicate certificates)
    mapping(address => mapping(uint256 => uint256)) public userCourseToToken;

    event CertificateMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 courseId,
        string metadataURI
    );

    constructor(address admin) ERC721("LearnHub Certificate", "LHCT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /**
     * @dev Mint a certificate NFT for course completion
     * @param to Address to receive the certificate
     * @param courseId Course ID that was completed
     * @param metadataURI URI to metadata JSON
     */
    function mintCertificate(
        address to,
        uint256 courseId,
        string memory metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(
            userCourseToToken[to][courseId] == 0,
            "CertificateNFT: Certificate already minted for this course"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        tokenToCourse[tokenId] = courseId;
        userCourseToToken[to][courseId] = tokenId;

        emit CertificateMinted(to, tokenId, courseId, metadataURI);

        return tokenId;
    }

    /**
     * @dev Get certificate token ID for a user and course
     */
    function getCertificateTokenId(address user, uint256 courseId)
        external
        view
        returns (uint256)
    {
        return userCourseToToken[user][courseId];
    }

    /**
     * @dev Check if user has certificate for a course
     */
    function hasCertificate(address user, uint256 courseId)
        external
        view
        returns (bool)
    {
        return userCourseToToken[user][courseId] != 0;
    }

    /**
     * @dev Grant minter role (only admin)
     */
    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    // The following functions are overrides required by Solidity for OpenZeppelin v4.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

