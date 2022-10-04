/**
 * The Memory Manager is responsible for allocating and deallocating memory to the operating system.
 * Therefore, it must interface with the memory modules via system calls.
 */
var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.baseRegister = 0x0000; // First physical address to allocate
            this.limitRegister = 0x0100; // Maximum range of logical addresses
        }
        allocateMemory(program) {
            // Query current baseRegister for existing data
            if (_MemoryAccessor.readImmediate(this.baseRegister) != 0x0000) {
                _StdOut.putText('ERR: Unable to allocate memory - memory block already in use.');
                return;
            }
            // Allocate memory, calling the Memory Accessor to write the program to the allocated space.
            _MemoryAccessor.writeProgram(program, this.baseRegister, this.limitRegister);
            _StdOut.putText(`Program loaded into memory block ${this.baseRegister / this.limitRegister} ` +
                `with process ID 0.`);
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map