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
            this.registeredProcesses = [];
            this.processIdCounter = 0;
        }
        // Allocates memory for the program passed via param.
        allocateMemory(program) {
            // Query current baseRegister for existing data
            if (_MemoryAccessor.readImmediate(this.baseRegister) != 0x0000) {
                _StdOut.putText('ERR: Unable to allocate memory - memory block already in use.');
                return;
            }
            // Allocate memory, calling the Memory Accessor to write the program to the allocated space.
            _MemoryAccessor.writeProgram(program, this.baseRegister, this.limitRegister);
            // Create the Process Control Block, assign a process ID, and push to the registered processes array.
            let processControlBlock = new TSOS.ProcessControlBlock(this.processIdCounter++, this.baseRegister, _CPU);
            this.registeredProcesses.push(processControlBlock);
            // Write the Process Control Block to index.html to test this functionality
            // TODO: Clean this up for a proper display of stored processes.
            let textArea = document.getElementById('taProcessControlBlock');
            if (!textArea.textContent) {
                textArea.textContent = `PID: ${processControlBlock.processId} State: ${processControlBlock.state}`;
            }
            else {
                // TODO: Does not yet update input if textArea has text already in it.
                textArea.textContent += `\r\nPID: ${processControlBlock.processId} State: ${processControlBlock.state}`;
            }
            // Print info to console
            _StdOut.putText(`Program loaded into memory block ${this.baseRegister / this.limitRegister} ` +
                `with process ID ${processControlBlock.processId}.`);
        }
        // Deallocates the memory assigned to a process after execution.
        deallocateMemory() {
            _MemoryAccessor.clearProgram(this.baseRegister, this.limitRegister);
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map