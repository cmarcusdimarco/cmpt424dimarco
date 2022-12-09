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
            for (let track = 0; track < 4; track++) {
                for (let sector = 0; sector < 8; sector++) {
                    for (let block = 0; block < 8; block++) {
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
            let asciiFilename = '';
            for (let i = 0; i < filename.length; i++) {
                asciiFilename += TSOS.Ascii.lookupCode(filename.charAt(i)).toString(16);
            }
            // Add trailing 0s to filename for consistency between GUI and disk data
            for (let i = asciiFilename.length; i < this.diskDataLength; i++) {
                asciiFilename += '0';
            }
            // Loop through data map to find next available disk location, starting in track 1
            let header = ''; // Pointer to file data location on disk
            headerLoops: for (let track = 1; track < 4; track++) {
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
            for (let sector = 0; sector < 8; sector++) {
                for (let block = 0; block < 8; block++) {
                    // Upon finding an available directory entry...
                    if (sessionStorage.getItem(`0:${sector}:${block}`).startsWith('0')) {
                        // ...overwrite its contents with the new data...
                        sessionStorage.setItem(`0:${sector}:${block}`, `1 ${header} ${asciiFilename.toUpperCase()}`);
                        // ...and update the GUI.
                        this.updateGUI(`0:${sector}:${block}`);
                        return true;
                    }
                }
            }
        }
        // Write file
        // Read file
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
    }
    TSOS.DeviceDriverDiskSystem = DeviceDriverDiskSystem;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDiskSystem.js.map