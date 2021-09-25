// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract DStorage {
    string public name = "Dstorage";
    uint public fileCount = 0;
    
    mapping (uint => File) public files;

    struct File {
        uint fileId;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        string fileDescription;
        uint uploadTime;
        address payable uploader;
    }

    event FileUploaded(
        uint fileId,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        string fileDescription,
        uint uploadTime,
        address payable uploader
    );

    constructor() public {

    }

    function uploadFile (string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDesc) public {
        // Make sure the file hash exists
        require(bytes(_fileHash).length > 0);
        // Make sure file type exists
        require(bytes(_fileType).length > 0);
        // Make sure file description exists
        require(bytes(_fileName).length > 0);
        // Make sure file name exists
        require(bytes(_fileDesc).length > 0);
        /// Make sure uploader address exists
        require(msg.sender != address(0));
        // Make sure file size is more than 0
        require(_fileSize > 0);

        fileCount++;
        files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDesc, block.timestamp, msg.sender);

        // Trigger an event
        emit FileUploaded(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDesc, block.timestamp, msg.sender);
    }
    
}

