/* ----------------------------------
   DeviceDriverDiskSystem.ts

   The Kernel Disk System Device Driver.
   ---------------------------------- */

module TSOS {

    export class DeviceDriverDiskSystem extends DeviceDriver {

        private readonly diskDataLength: number = 120;  // String length of data entries for any disk storage record

        constructor() {
            super();
            this.driverEntry = this.krnDSDriverEntry;
        }

        public krnDSDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk System Device Driver
            this.status = "loaded";
        }

        // Format
        public format() {

            // These variable is redundant, but they help with readability to reference the long strings as the shorter
            // variable names for the loops below. The strings are space-delineated to partition between the
            // active flag, the reference pointer to the next storage address, and the actual data within
            let zeroString = "0 000 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            let masterBootRecordString = "1 000 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

            // Initialize and/or reset the storage map
            for (let track = 0; track < 4; track++) {
                for (let sector = 0; sector < 8; sector++) {
                    for (let block = 0; block < 8; block++) {
                        // Skip the master boot record, held at 0:0:0
                        if (track + sector + block === 0) {
                            sessionStorage.setItem(`${track}:${sector}:${block}`, masterBootRecordString);
                        } else {
                            sessionStorage.setItem(`${track}:${sector}:${block}`, zeroString);
                        }
                        this.updateGUI(`${track}:${sector}:${block}`);
                    }
                }
            }

        }

        // Create filename
        public create(filename: string) {

            // Convert filename to ASCII
            let asciiFilename = Ascii.convertStringToAscii(filename);

            // Add trailing 0s to filename for consistency between GUI and disk data
            for (let i = asciiFilename.length; i < this.diskDataLength; i++) {
                asciiFilename += '0';
            }

            // Loop through data map to find next available disk location, starting in track 1
            let header: string = '';    // Pointer to file data location on disk

            headerLoops:
            for (let track = 1; track < 4; track++) {
                for (let sector = 0; sector < 8; sector++) {
                    for (let block = 0; block < 8; block++) {
                        if (sessionStorage.getItem(`${track}:${sector}:${block}`).startsWith('0')) {
                            header = `${track}${sector}${block}`;
                            break headerLoops;
                        }
                    }
                }
            }

            // Loop through directory map to find first available directory entry
            directoryLoops:
            for (let sector = 0; sector < 8; sector++) {
                for (let block = 0; block < 8; block++) {
                    // Upon finding an available directory entry...
                    if (sessionStorage.getItem(`0:${sector}:${block}`).startsWith('0')) {
                        // ...overwrite its contents with the new data...
                        sessionStorage.setItem(`0:${sector}:${block}`,
                            `1 ${header} ${asciiFilename}`);
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
            fileContents[1] = '999';    // Setting the header to an unreachable value will signify that this is the final block in the file.
            sessionStorage.setItem(fileAddress, fileContents.join(' '));
            // Update the GUI.
            this.updateGUI(fileAddress);

            return true;
        }

        // Read file
        public read(filename: string) {
            let fileAddress: string;
            let fileContents: string = '';
            let blockContents: string[];

            // Get the starting block of the filename.
            fileAddress = this.getFileAddressByFilename(filename);

            do {
                // Split the sessionStorage item and return the data portion.
                blockContents = sessionStorage.getItem(fileAddress).split(' ');
                // Append the block contents to the file contents.
                fileContents += Ascii.convertAsciiToString(blockContents[2]);
                // Reassign fileAddress to the value in the header section of the current block.
                fileAddress = blockContents[1];
            } while (fileAddress !== '999');   // If the block header points to another block, continue the process.
            return fileContents;
        }

        // Write file

        // Delete file

        // Copy file

        // Rename file

        // ls

        // Update GUI
        public updateGUI(rowID: string) {
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
            } else {
                console.error('Error updating GUI for disk system.');
                return false;
            }
        }

        // Helper method to reduce duplicate lines of code.
        private getFileAddressByFilename(filename: string) {
            let fileAddress: string = '';

            // Get ASCII filename.
            let asciiFilename = Ascii.convertStringToAscii(filename);

            // Loop through directory map to find matching directory entry
            for (let sector = 0; sector < 8; sector++) {
                for (let block = 0; block < 8; block++) {
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
    }
}