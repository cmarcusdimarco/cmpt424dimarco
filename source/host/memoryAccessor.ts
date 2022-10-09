module TSOS {

    export class MemoryAccessor extends Hardware {
        private memory: Memory;
        private lowOrderByte: number;
        private highOrderByte: number;

        // Constructor
        constructor(memory: Memory) {
            super('MA', 0);
            this.memory = memory;
        }

        // Setters for low order and high order bytes
        public setLowOrder(byte: number) {
            if (byte > 0xFF) {
                this.log(`ERR: target value exceeds storage range!`);
                return;
            }
            this.lowOrderByte = byte;
        }

        public setHighOrder(byte: number) {
            if (byte > 0xFF) {
                this.log(`ERR: target value exceeds storage range!`);
                return;
            }
            this.highOrderByte = byte;
        }

        // Getter to return low order byte for use in D0's reference to a relative memory address
        public getLowOrderByte(): number {
            return this.lowOrderByte;
        }

        // Getter to return high order byte for use in FF's reference to a prestored memory address
        public getHighOrderByte(): number {
            return this.highOrderByte;
        }

        // Set MAR when passed bytes encoded in little Endian
        public setMARLittleEndian(lowOrder: number, highOrder: number) {
            let lowString = lowOrder.toString(16);
            let highString = highOrder.toString(16);
            let fullString = "0x".concat(highString.concat(lowString));
            this.memory.setMAR(Number(fullString));
        }

        // read takes a low-order and a high-order byte in little Endian
        // and returns the value stored in the refactored address.
        public read(): number {
            this.setMARLittleEndian(this.lowOrderByte, this.highOrderByte);
            this.memory.read();
            return this.memory.getMDR();
        }

        // readImmediate takes a 16-bit memory address as a parameter
        // and returns the value stored in the address.
        public readImmediate(address16Bit: number): number {
            this.memory.setMAR(address16Bit);
            this.memory.read();
            return this.memory.getMDR();
        }

        // write takes a low-order and a high-order byte in little Endian
        // and writes the third parameter to the address.
        public write(value: number) {
            this.setMARLittleEndian(this.lowOrderByte, this.highOrderByte);
            this.memory.setMDR(value);
            this.memory.write();
            // Update the OS GUI
            let location = document.getElementById(`memoryCell${this.hexLog(this.memory.getMAR(), 4)}`);
            location.textContent = this.hexLog(value, 2);
        }

        // writeImmediate() writes a value to a single byte of memory.
        public writeImmediate(address: number, value: number) {
            this.memory.setMAR(address);
            this.memory.setMDR(value);
            this.memory.write();
            // Update the OS GUI
            let location = document.getElementById(`memoryCell${this.hexLog(address, 4)}`);
            location.textContent = this.hexLog(value, 2);
        }

        // writeProgram() will write a user-provided program into memory starting at the base address.
        public writeProgram(program: number[], address: number, limit: number) {
            for (let i = 0; i < program.length && i < address + limit; i++) {
                // Write the op code into the desired memory address
                this.writeImmediate(address + i, program[i]);
            }
        }

        // clearProgram() will remove all data from the provided range after executing that program.
        public clearProgram(address: number, limit: number) {
            for (let i = 0; i < address + limit; i++) {
                this.writeImmediate(address + i, 0x00);
            }
        }

        // memoryDump() takes two parameters, fromAddress and toAddress, and prints
        // the value stored within the defined range of addresses.
        public memoryDump(fromAddress: number, toAddress: number) {
            // Test for range integrity
            if (toAddress <= fromAddress || fromAddress < 0x00 || toAddress >= 0x1000) {
                return;
            }
            this.log('Memory Dump: Debug');
            this.log('--------------------------------------');
            for (let i = 0x0000; i <= toAddress - fromAddress; i++) {
                let valueStored = this.readImmediate(i);
                this.log(`Addr ${this.hexLog(i, 4)}:  | ${this.hexLog(valueStored, 2)}`);
            }
            this.log('--------------------------------------');
            this.log('Memory Dump: Complete');
        }
    }
}