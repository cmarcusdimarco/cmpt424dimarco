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
        }

        // writeImmediate() writes a value to a single byte of memory.
        public writeImmediate(address: number, value: number) {
            this.memory.setMAR(address);
            this.memory.setMDR(value);
            this.memory.write();
        }

        // flashProgram() will write a static program into memory.
        public flashProgram() {
            this.writeImmediate(0x0000, 0xA2);
            this.writeImmediate(0x0001, 0x03);
            this.writeImmediate(0x0002, 0xFF);
            this.writeImmediate(0x0003, 0x39);
            this.writeImmediate(0x0004, 0x00);
            this.writeImmediate(0x0005, 0xA9);
            this.writeImmediate(0x0006, 0x07);
            this.writeImmediate(0x0007, 0x8D);
            this.writeImmediate(0x0008, 0x63);
            this.writeImmediate(0x0009, 0x00);
            this.writeImmediate(0x000A, 0xA9);
            this.writeImmediate(0x000B, 0x01);
            this.writeImmediate(0x000C, 0x8D);
            this.writeImmediate(0x000D, 0x64);
            this.writeImmediate(0x000E, 0x00);
            this.writeImmediate(0x000F, 0x8D);
            this.writeImmediate(0x0010, 0x65);
            this.writeImmediate(0x0011, 0x00);
            this.writeImmediate(0x0012, 0x8D);
            this.writeImmediate(0x0013, 0x66);
            this.writeImmediate(0x0014, 0x00);
            this.writeImmediate(0x0015, 0xAC);
            this.writeImmediate(0x0016, 0x66);
            this.writeImmediate(0x0017, 0x00);
            this.writeImmediate(0x0018, 0xA2);
            this.writeImmediate(0x0019, 0x01);
            this.writeImmediate(0x001A, 0xFF);
            this.writeImmediate(0x001B, 0xEE);
            this.writeImmediate(0x001C, 0x65);
            this.writeImmediate(0x001D, 0x00);
            this.writeImmediate(0x001E, 0xEE);
            this.writeImmediate(0x001F, 0x65);
            this.writeImmediate(0x0020, 0x00);
            this.writeImmediate(0x0021, 0xAD);
            this.writeImmediate(0x0022, 0x66);
            this.writeImmediate(0x0023, 0x00);
            this.writeImmediate(0x0024, 0x6D);
            this.writeImmediate(0x0025, 0x65);
            this.writeImmediate(0x0026, 0x00);
            this.writeImmediate(0x0027, 0x8D);
            this.writeImmediate(0x0028, 0x66);
            this.writeImmediate(0x0029, 0x00);
            this.writeImmediate(0x002A, 0xA2);
            this.writeImmediate(0x002B, 0x03);
            this.writeImmediate(0x002C, 0xFF);
            this.writeImmediate(0x002D, 0x61);
            this.writeImmediate(0x002E, 0x00);
            this.writeImmediate(0x002F, 0xEE);
            this.writeImmediate(0x0030, 0x64);
            this.writeImmediate(0x0031, 0x00);
            this.writeImmediate(0x0032, 0xAA);
            this.writeImmediate(0x0033, 0xEC);
            this.writeImmediate(0x0034, 0x63);
            this.writeImmediate(0x0035, 0x00);
            this.writeImmediate(0x0036, 0xD0);
            this.writeImmediate(0x0037, 0xDD);
            this.writeImmediate(0x0038, 0x00);
            this.writeImmediate(0x0039, 0x54);
            this.writeImmediate(0x003A, 0x68);
            this.writeImmediate(0x003B, 0x65);
            this.writeImmediate(0x003C, 0x20);
            this.writeImmediate(0x003D, 0x66);
            this.writeImmediate(0x003E, 0x69);
            this.writeImmediate(0x003F, 0x72);
            this.writeImmediate(0x0040, 0x73);
            this.writeImmediate(0x0041, 0x74);
            this.writeImmediate(0x0042, 0x20);
            this.writeImmediate(0x0043, 0x73);
            this.writeImmediate(0x0044, 0x69);
            this.writeImmediate(0x0045, 0x78);
            this.writeImmediate(0x0046, 0x20);
            this.writeImmediate(0x0047, 0x70);
            this.writeImmediate(0x0048, 0x65);
            this.writeImmediate(0x0049, 0x72);
            this.writeImmediate(0x004A, 0x66);
            this.writeImmediate(0x004B, 0x65);
            this.writeImmediate(0x004C, 0x63);
            this.writeImmediate(0x004D, 0x74);
            this.writeImmediate(0x004E, 0x20);
            this.writeImmediate(0x004F, 0x73);
            this.writeImmediate(0x0050, 0x71);
            this.writeImmediate(0x0051, 0x75);
            this.writeImmediate(0x0052, 0x61);
            this.writeImmediate(0x0053, 0x72);
            this.writeImmediate(0x0054, 0x65);
            this.writeImmediate(0x0055, 0x73);
            this.writeImmediate(0x0056, 0x20);
            this.writeImmediate(0x0057, 0x69);
            this.writeImmediate(0x0058, 0x6E);
            this.writeImmediate(0x0059, 0x20);
            this.writeImmediate(0x005A, 0x68);
            this.writeImmediate(0x005B, 0x65);
            this.writeImmediate(0x005C, 0x78);
            this.writeImmediate(0x005D, 0x20);
            this.writeImmediate(0x005E, 0x61);
            this.writeImmediate(0x005F, 0x72);
            this.writeImmediate(0x0060, 0x65);
            this.writeImmediate(0x0061, 0x20);
            this.writeImmediate(0x0062, 0x00);
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