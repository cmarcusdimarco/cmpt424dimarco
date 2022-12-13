/**
 * The swapper is responsible for rolling a program out from memory and rolling a second program into memory
 * by interfacing with the disk driver and physical memory using swap files.
 */

module TSOS {
    export class Swapper {

        constructor() {
        }

        // Swap out from memory
        public swapOutFromMemory(process: TSOS.ProcessControlBlock) {

            _Kernel.krnTrace(`Swapping out process ${process.processId}...`);

            // Create swap file
            let processFilename = `.process${process.processId}.swp`;
            _krnDiskSystemDriver.create(processFilename);

            // Get program from memory
            let program: number[] = [];
            for (let i = 0; i < process.startingAddress + process.limit; i++) {
                // Push each op code to the program array
                program.push(_MemoryAccessor.readImmediate(process.startingAddress + i));
            }

            // Convert program to strings
            let programValues: string[] = [];
            // The reference to CPU here is calling a pre-existing function in its Hardware superclass. We are not
            // accessing the CPU from the MemoryManager. I'm just cutting a quick corner with a publicly-scoped function on a
            // global object.
            program.forEach((value) => programValues.push(_CPU.hexLog(value, 2)));

            // Write the program data to the new file
            _krnDiskSystemDriver.write(processFilename, programValues.join(' '));

            // Clear memory partition and remove highlighting
            _MemoryAccessor.clearProgram(process.startingAddress, process.limit);
            process.removeHighlighting();

            // Reassign process fields
            process.startingAddress = -1;
            process.memoryPartition = -1;
            process.location = 'DSK';
        }

        // Swap into memory
        public swapIntoMemory(process: TSOS.ProcessControlBlock) {

            _Kernel.krnTrace(`Swapping in process ${process.processId}...`);

            // Get the program data
            let processFilename = `.process${process.processId}.swp`;
            let program: string[] = _krnDiskSystemDriver.read(processFilename).split(' ');

            // Convert to array of hex values
            let hexValues: number[] = [];
            program.forEach((value) => hexValues.push(parseInt(value, 16)));

            // Find available location in memory (near duplication of memoryManager.allocateMemory())
            for (let partitionBaseAddress of _Memory.partitions) {
                if (_MemoryAccessor.readImmediate(partitionBaseAddress) === 0x0000) {

                    // Write the program to the allocated space.
                    _MemoryAccessor.writeProgram(hexValues, partitionBaseAddress, process.limit);

                    // Delete the process swap file from the disk.
                    _krnDiskSystemDriver.delete(processFilename);

                    // Update the process fields.
                    process.memoryPartition = partitionBaseAddress / process.limit;
                    process.startingAddress = partitionBaseAddress;
                    process.location = 'RAM';

                    return;
                }
            }
        }
    }
}