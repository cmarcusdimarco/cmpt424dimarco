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

            // Query memory partitions for existing data
            for (let partitionBaseAddress of _Memory.partitions) {
                if (_MemoryAccessor.readImmediate(partitionBaseAddress) == 0x0000) {

                    // Validate program length - return error if overflow
                    if (program.length >= this.limitRegister) {
                        _StdOut.putText('ERR: Unable to allocate memory - user program exceeds available memory.');
                        return;
                    }

                    // Allocate memory, calling the Memory Accessor to write the program to the allocated space.
                    this.baseRegister = partitionBaseAddress;
                    _MemoryAccessor.writeProgram(program, this.baseRegister, this.limitRegister);

                    // Create the Process Control Block, assign a process ID, and push to the registered processes array.
                    let processControlBlock = new ProcessControlBlock(this.processIdCounter++, this.baseRegister);
                    this.registeredProcesses.push(processControlBlock);

                    // Find the first available space in the GUI PCB table and assign it to the new PCB.
                    let tableLength: number = (<HTMLTableElement>document.getElementById('tableProcessControlBlock')).rows.length;
                    for (let i = 1; i < tableLength; i++) {
                        let stateCell = document.getElementById(`pcb${i - 1}State`);
                        if (stateCell.innerText == 'N/A' || stateCell.innerText == 'TERMINATED') {
                            processControlBlock.assignDOMFields(`pcb${i - 1}`);
                            break;
                        }
                    }

                    // Update GUI to reflect new PCB
                    processControlBlock.updateGUI();

                    // Print info to console
                    _StdOut.putText(`Program loaded into memory block ${this.baseRegister / this.limitRegister} ` +
                        `with process ID ${processControlBlock.processId}.`);
                    return;
                }
            }

            // Print error message if memory is full
            _StdOut.putText('ERR: Unable to allocate memory - all memory partitions already in use.');
        }

        // Deallocates the memory assigned to a process after execution.
        public deallocateMemory(process: TSOS.ProcessControlBlock) {
            // Find the non-terminated process whose halt command occurs within a specific address range.
            process.updateGUIToZero('TERMINATED');
            _MemoryAccessor.clearProgram(process.startingAddress, this.limitRegister);
        }
    }
}