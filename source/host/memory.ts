/**
 * A virtual 6502 memory module.
 */

module TSOS {

    export class Memory extends Hardware implements ClockListener {
        // Maximum range of memory addresses as a constant
        private readonly range: number = 0x300;
        // Maximum value of memory data as a constant
        private readonly dataRange: number = 0x100;
        // Desired string length of memory addresses
        private readonly hexRange: number = 0x04;
        // Desired string length of values held in a memory address
        private readonly valueRange: number = 0x02;
        // Memory Address Register
        private MAR: number = 0x0000;
        // Memory Data Register
        private MDR: number = 0x00;
        // Array of all memory addresses
        private addresses: number[] = [];
        // Array of key-value pairs for memory partitions. Key = index, value = value at index.
        public partitions: number[] = [0x000, 0x100, 0x200];    // 0: 0x000, 1: 0x100, 2: 0x200

        constructor() {
            super('RAM', 0);
        }

        // Setting initial memory values to 0x00
        public initializeMemoryAddresses() {
            for (let i = 0x0; i < this.range; i++) {
                this.addresses[i] = 0x00;
            }
            this.log("Initialized Memory");
        }

        // Takes an address as input and logs its properly formatted hex value to the console
        private displayMemoryPrivate(address: number) {
            let properAddress: String = this.hexLog(address, this.hexRange);
            if (address < this.addresses.length) {
                this.log(`Address: ${properAddress} Contains Value: ${this.hexLog(this.addresses[address], this.valueRange)}`);
            } else {
                // Handles out-of-bounds exceptions for the array of addresses
                this.log(`Address: ${properAddress} Contains Value: ERR [hexValue conversion]: Memory Address ${properAddress} ` +
                    `outside of address bounds!`);
            }
        }

        // Calls displayMemoryPrivate() over a defined range
        public displayMemory() {
            let memoryRange: number = 0x15;

            for (let i = 0x0; i < memoryRange; i++) {
                this.displayMemoryPrivate(i);
            }

            // this.displayMemoryPrivate(0x10000); // Test for memory address outside bounds
        }

        // Set all memory data to 0x00
        public reset() {
            this.initializeMemoryAddresses();
        }

        // Pulse
        public pulse() {
            this.log('received clock pulse');
        }

        // Setters and getters for private members
        public setMDR(target: number) {
            if (target >= this.dataRange) {
                this.log('ERR: target value exceeds storage capacity for address.');
                return;
            }
            this.MDR = target;
        }

        public getMDR(): number {
            return this.MDR;
        }

        public setMAR(target: number) {
            if (target >= this.range) {
                this.log('ERR: target address exceeds addressing capacity.');
                return;
            }
            this.MAR = target;
        }

        public getMAR(): number {
            return this.MAR;
        }

        // Read method gets the address currently stored in the MAR and sets the MDR
        // equal to its contents
        public read() {
            let toRead = this.getMAR();
            this.setMDR(this.addresses[toRead]);
        }

        // Write method gets the value currently stored in the MDR and sets the data
        // of the address in the MAR equal to its contents
        public write() {
            let toWrite = this.getMDR();
            this.addresses[this.getMAR()] = toWrite;
        }
    }
}