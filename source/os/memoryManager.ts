/**
 * The Memory Manager is responsible for allocating and deallocating memory to the operating system.
 * Therefore, it must interface with the memory modules via system calls.
 */

module TSOS {
    export class MemoryManager {
        public baseRegister: number = 0x0000;               // First physical address to allocate
        public readonly limitRegister: number = 0x0100;     // Maximum range of logical addresses
        public registeredProcesses: ProcessControlBlock[] = [];
        public processIdCounter: number = 0;

        constructor() {
        }

        // Allocates memory for the program passed via param.
        public allocateMemory(program: number[]) {
            // Query current baseRegister for existing data
            if (_MemoryAccessor.readImmediate(this.baseRegister) != 0x0000) {
                _StdOut.putText('ERR: Unable to allocate memory - memory block already in use.');
                return;
            }

            // Allocate memory, calling the Memory Accessor to write the program to the allocated space.
            _MemoryAccessor.writeProgram(program, this.baseRegister, this.limitRegister);

            // Create the Process Control Block, assign a process ID, and push to the registered processes array.
            let processControlBlock = new ProcessControlBlock(this.processIdCounter++, this.baseRegister, _CPU);
            this.registeredProcesses.push(processControlBlock);

            // Write the Process Control Block to index.html to test this functionality
            // TODO: Clean this up for a proper display of stored processes.
            let textArea = document.getElementById('taProcessControlBlock');
            if (!textArea.textContent) {
                textArea.textContent = `PID: ${processControlBlock.processId} State: ${processControlBlock.state}\r\n`;
            } else {
                // TODO: Does not yet update input if textArea has text already in it.
                textArea.append(`PID: ${processControlBlock.processId} State: ${processControlBlock.state}\r\n`);
            }

            // Print info to console
            _StdOut.putText(`Program loaded into memory block ${this.baseRegister / this.limitRegister} ` +
                                 `with process ID ${processControlBlock.processId}.`);
        }

        // Deallocates the memory assigned to a process after execution.
        public deallocateMemory(haltAddress: number) {
            // Find the non-terminated process whose halt command occurs within a specific address range.
            for (let process of this.registeredProcesses) {
                // If found, set status to TERMINATED and update OS GUI
                if (process.startingAddress == haltAddress % this.limitRegister && process.state != 'TERMINATED') {
                    process.state = 'TERMINATED';
                    let docProcess = document.getElementById('taProcessControlBlock');
                    docProcess.textContent = `PID: ${process.processId} State: ${process.state}\r\n`;
                    break;
                }
            }
            _MemoryAccessor.clearProgram(this.baseRegister, this.limitRegister);
        }
    }
}