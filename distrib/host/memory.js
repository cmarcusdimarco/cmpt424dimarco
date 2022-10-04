/**
 * A virtual 6502 memory module.
 */
var TSOS;
(function (TSOS) {
    class Memory extends TSOS.Hardware {
        constructor() {
            super('RAM', 0);
            // Maximum range of memory addresses as a constant
            this.range = 0x300;
            // Maximum value of memory data as a constant
            this.dataRange = 0x100;
            // Desired string length of memory addresses
            this.hexRange = 0x04;
            // Desired string length of values held in a memory address
            this.valueRange = 0x02;
            // Memory Address Register
            this.MAR = 0x0000;
            // Memory Data Register
            this.MDR = 0x00;
            // Array of all memory addresses
            this.addresses = [];
        }
        // Setting initial memory values to 0x00
        initializeMemoryAddresses() {
            for (let i = 0x0; i < this.range; i++) {
                this.addresses[i] = 0x00;
            }
            this.log("Initialized Memory");
        }
        // Takes an address as input and logs its properly formatted hex value to the console
        displayMemoryPrivate(address) {
            let properAddress = this.hexLog(address, this.hexRange);
            if (address < this.addresses.length) {
                this.log(`Address: ${properAddress} Contains Value: ${this.hexLog(this.addresses[address], this.valueRange)}`);
            }
            else {
                // Handles out-of-bounds exceptions for the array of addresses
                this.log(`Address: ${properAddress} Contains Value: ERR [hexValue conversion]: Memory Address ${properAddress} ` +
                    `outside of address bounds!`);
            }
        }
        // Calls displayMemoryPrivate() over a defined range
        displayMemory() {
            let memoryRange = 0x15;
            for (let i = 0x0; i < memoryRange; i++) {
                this.displayMemoryPrivate(i);
            }
            // this.displayMemoryPrivate(0x10000); // Test for memory address outside bounds
        }
        // Set all memory data to 0x00
        reset() {
            this.initializeMemoryAddresses();
        }
        // Pulse
        pulse() {
            this.log('received clock pulse');
        }
        // Setters and getters for private members
        setMDR(target) {
            if (target >= this.dataRange) {
                this.log('ERR: target value exceeds storage capacity for address.');
                return;
            }
            this.MDR = target;
        }
        getMDR() {
            return this.MDR;
        }
        setMAR(target) {
            if (target >= this.range) {
                this.log('ERR: target address exceeds addressing capacity.');
                return;
            }
            this.MAR = target;
        }
        getMAR() {
            return this.MAR;
        }
        // Read method gets the address currently stored in the MAR and sets the MDR
        // equal to its contents
        read() {
            let toRead = this.getMAR();
            this.setMDR(this.addresses[toRead]);
        }
        // Write method gets the value currently stored in the MDR and sets the data
        // of the address in the MAR equal to its contents
        write() {
            let toWrite = this.getMDR();
            this.addresses[this.getMAR()] = toWrite;
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map