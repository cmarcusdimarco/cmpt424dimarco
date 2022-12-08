/* ----------------------------------
   DeviceDriverDiskSystem.ts

   The Kernel Disk System Device Driver.
   ---------------------------------- */

module TSOS {

    export class DeviceDriverDiskSystem extends DeviceDriver {

        constructor() {
            super();
            this.driverEntry = this.krnDSDriverEntry;
        }

        public krnDSDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk System Device Driver
            this.status = "loaded";
        }

        // Format

        // Create filename

        // Write file

        // Read file

        // Delete file

        // Copy file

        // Rename file

        // ls
    }

}