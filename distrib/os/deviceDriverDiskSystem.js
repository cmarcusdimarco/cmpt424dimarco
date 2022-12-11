/* ----------------------------------
   DeviceDriverDiskSystem.ts

   The Kernel Disk System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    class DeviceDriverDiskSystem extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.diskDataLength = 120; // String length of data entries for any disk storage record
            this.trackMax = 4; // Number of tracks available to disk storage
            this.sectorMax = 8; // Number of sectors available within each track
            this.blockMax = 8; // Number of blocks available within each sector
            this.driverEntry = this.krnDSDriverEntry;
        }
        krnDSDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk System Device Driver
            this.status = "loaded";
        }
        // Format
        format() {
            // These variable is redundant, but they help with readability to reference the long strings as the shorter
            // variable names for the loops below. The strings are space-delineated to partition between the
            // active flag, the reference pointer to the next storage address, and the actual data within
            let zeroString = "0 000 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            let masterBootRecordString = "1 000 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            // Initialize and/or reset the storage map
            for (let track = 0; track < this.trackMax; track++) {
                for (let sector = 0; sector < this.sectorMax; sector++) {
                    for (let block = 0; block < this.blockMax; block++) {
                        // Skip the master boot record, held at 0:0:0
                        if (track + sector + block === 0) {
                            sessionStorage.setItem(`${track}:${sector}:${block}`, masterBootRecordString);
                        }
                        else {
                            sessionStorage.setItem(`${track}:${sector}:${block}`, zeroString);
                        }
                        this.updateGUI(`${track}:${sector}:${block}`);
                    }
                }
            }
        }
        // Create filename
        create(filename) {
            // Convert filename to ASCII
            let asciiFilename = TSOS.Ascii.convertStringToAscii(filename);
            // Add trailing 0s to filename for consistency between GUI and disk data
            for (let i = asciiFilename.length; i < this.diskDataLength; i++) {
                asciiFilename += '0';
            }
            // Loop through data map to find next available disk location, starting in track 1
            let header = ''; // Pointer to file data location on disk
            headerLoops: for (let track = 1; track < this.trackMax; track++) {
                for (let sector = 0; sector < this.sectorMax; sector++) {
                    for (let block = 0; block < this.blockMax; block++) {
                        if (sessionStorage.getItem(`${track}:${sector}:${block}`).startsWith('0')) {
                            header = `${track}${sector}${block}`;
                            break headerLoops;
                        }
                    }
                }
            }
            // Loop through directory map to find first available directory entry
            directoryLoops: for (let sector = 0; sector < this.sectorMax; sector++) {
                for (let block = 0; block < this.blockMax; block++) {
                    // Upon finding an available directory entry...
                    if (sessionStorage.getItem(`0:${sector}:${block}`).startsWith('0')) {
                        // ...overwrite its contents with the new data...
                        sessionStorage.setItem(`0:${sector}:${block}`, `1 ${header} ${asciiFilename}`);
                        // ...and update the GUI.
                        this.updateGUI(`0:${sector}:${block}`);
                        break directoryLoops;
                    }
                }
            }
            // Lastly, set 'active' flag and header value at file destination.
            let fileAddress = header.charAt(0) + ':' +
                header.charAt(1) + ':' +
                header.charAt(2);
            let fileContents = sessionStorage.getItem(fileAddress).split(' ');
            fileContents[0] = '1';
            fileContents[1] = '999'; // Setting the header to an unreachable value will signify that this is the final block in the file.
            sessionStorage.setItem(fileAddress, fileContents.join(' '));
            // Update the GUI.
            this.updateGUI(fileAddress);
            return true;
        }
        // Read file
        read(filename) {
            let blockAddress;
            let fileContents = '';
            let blockContents;
            // Get the starting block of the filename.
            blockAddress = this.getFileAddressByFilename(filename);
            do {
                // Split the sessionStorage item and return the data portion.
                blockContents = sessionStorage.getItem(blockAddress).split(' ');
                // Append the block contents to the file contents.
                fileContents += TSOS.Ascii.convertAsciiToString(blockContents[2]);
                // Reassign fileAddress to the value in the header section of the current block.
                blockAddress = blockContents[1].charAt(0) + ':' +
                    blockContents[1].charAt(1) + ':' +
                    blockContents[1].charAt(2);
            } while (blockAddress !== '9:9:9'); // If the block header points to another block, continue the process.
            return fileContents;
        }
        // Write file
        write(filename, data) {
            let blockAddress = this.getFileAddressByFilename(filename);
            let asciiData = TSOS.Ascii.convertStringToAscii(data);
            // Determine amount of blocks needed to write data
            let blocksToWrite = Math.ceil(asciiData.length / this.diskDataLength);
            // Pad asciiData with 0s at end if needed
            for (let i = asciiData.length; i < (blocksToWrite * this.diskDataLength); i++) {
                asciiData += '0';
            }
            // Starting with the initial block...
            for (let i = 0; i < blocksToWrite; i++) {
                // ...update its active flag and its data with the appropriate section of asciiData...
                let values = sessionStorage.getItem(blockAddress).split(' ');
                let substringStart = i * this.diskDataLength;
                let substringEnd = (i * this.diskDataLength) + this.diskDataLength;
                values[0] = '1';
                values[2] = asciiData.substring(substringStart, substringEnd);
                // ...check if data remains to be written...
                if (blocksToWrite > i + 1) {
                    // ...if so, find the next available (preferably adjacent) block...
                    let nextBlockAddress = '';
                    findNextBlock: for (let track = parseInt(blockAddress.charAt(0)); track < this.trackMax; track++) {
                        // We need conditional assignment of inner loop iterators to ensure that once the local track is searched,
                        // we can start the next track from sector instead of the current block's sector.
                        let sector = track === parseInt(blockAddress.charAt(0)) ? parseInt(blockAddress.charAt(2)) : 0;
                        for (; sector < this.sectorMax; sector++) {
                            // Same here, but starting the next sector from block 0 instead of the current block.
                            let block = sector === parseInt(blockAddress.charAt(2)) ? parseInt(blockAddress.charAt(4)) + 1 : 0;
                            for (; block < this.blockMax; block++) {
                                // Upon finding an inactive block...
                                if (sessionStorage.getItem(`${track}:${sector}:${block}`).startsWith('0')) {
                                    // ...set nextBlockAddress to the new block and set the current block's header to point to the new block.
                                    nextBlockAddress = `${track}:${sector}:${block}`;
                                    values[1] = `${track}${sector}${block}`;
                                    break findNextBlock;
                                }
                            }
                        }
                    }
                    // If no nextBlockAddress was found, throw an error.
                    if (nextBlockAddress === '') {
                        throw new Error('ERR: Unable to find sufficient available blocks to write data. Please reduce the file size or free some disk space and try again.');
                    }
                    // Join the values and write the full string to the disk...
                    sessionStorage.setItem(blockAddress, values.join(' '));
                    // ...update the GUI...
                    this.updateGUI(blockAddress);
                    // ...and update blockAddress to nextBlockAddress.
                    blockAddress = nextBlockAddress;
                }
                else {
                    // If there is no more data to write, check the header to mark any previously used blocks as inactive
                    if (values[1] !== '000' && values[1] !== '999') {
                        let blockToDeactivate = values[1].charAt(0) + ':' +
                            values[1].charAt(1) + ':' +
                            values[1].charAt(2);
                        this.deactivateUnreferencedBlocks(blockToDeactivate);
                    }
                    // ...update the header to '999' to show that it is the final block in the file...
                    values[1] = '999';
                    // ...join the values and write the full string to the disk...
                    sessionStorage.setItem(blockAddress, values.join(' '));
                    // ... and update the GUI.
                    this.updateGUI(blockAddress);
                }
            }
        }
        // Delete file
        // Copy file
        // Rename file
        // ls
        // Update GUI
        updateGUI(rowID) {
            // Remove colon-delineation for compatibility with HTML Frontend
            let id = rowID.replace(/:/g, '');
            // Parse input
            // Index 0 - active flag
            // Index 1 - header pointer
            // Index 2 - data string
            let values = sessionStorage.getItem(rowID).split(' ');
            // If values is not null, assign fields
            if (values) {
                document.getElementById(`diskCell${id}active`).innerText = values[0];
                document.getElementById(`diskCell${id}header`).innerText = values[1];
                document.getElementById(`diskCell${id}data`).innerText = values[2];
                return true;
            }
            else {
                console.error('Error updating GUI for disk system.');
                return false;
            }
        }
        // Helper method to reduce duplicate lines of code.
        getFileAddressByFilename(filename) {
            let fileAddress = '';
            // Get ASCII filename.
            let asciiFilename = TSOS.Ascii.convertStringToAscii(filename);
            // Loop through directory map to find matching directory entry
            for (let sector = 0; sector < this.sectorMax; sector++) {
                for (let block = 0; block < this.blockMax; block++) {
                    let directoryEntry = sessionStorage.getItem(`0:${sector}:${block}`);
                    // Only check active (and existing!) entries.
                    if (directoryEntry && directoryEntry.startsWith('1')) {
                        // If active, split into an array for easier parsing.
                        let directoryEntryValues = directoryEntry.split(' ');
                        // Check the data value (index = 2) for matching filename.
                        // Since we are using 0-padded string values, our comparison is using two checks:
                        // the string must start with the filename, and the string must only contain 0 after the filename.
                        // The second test occurs using this very cool regex.
                        if (directoryEntryValues[2].startsWith(asciiFilename) && /^0+$/.test(directoryEntryValues[2].substring(asciiFilename.length))) {
                            // Manipulate the fileAddress to be colon-delineated for sessionStorage lookup.
                            fileAddress = directoryEntryValues[1].charAt(0) + ':' +
                                directoryEntryValues[1].charAt(1) + ':' +
                                directoryEntryValues[1].charAt(2);
                            // Return formatted fileAddress.
                            return fileAddress;
                        }
                    }
                }
            }
            // Throw error if no match found
            throw new Error(`ERR: No file named ${filename} found in file system.`);
        }
        deactivateUnreferencedBlocks(blockAddress) {
            let values = sessionStorage.getItem(blockAddress).split(' ');
            // Recursive call to traverse all blocks in the unreferenced path
            if (values[1] !== '000' && values[1] !== '999') {
                let blockToDeactivate = values[1].charAt(0) + ':' +
                    values[1].charAt(1) + ':' +
                    values[1].charAt(2);
                this.deactivateUnreferencedBlocks(blockToDeactivate);
            }
            // Set active flag to inactive
            values[0] = '0';
            // Don't change anything else. Update GUI.
            sessionStorage.setItem(blockAddress, values.join(' '));
            this.updateGUI(blockAddress);
        }
    }
    TSOS.DeviceDriverDiskSystem = DeviceDriverDiskSystem;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDiskSystem.js.map