/**
 * A Process Control Block (PCB) is a representation of the state of the CPU throughout the execution of a process.
 * It is a fundamental part of context switching, as pushing/popping PCBs from the stack is the way in which
 * the CPU is able to execute multiple processes.
 */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(processId, address) {
            this.processId = processId;
            this.startingAddress = address;
            // Initialize state to 0's
            this.accumulator = 0x00;
            this.instructionRegister = 0x00;
            this.programCounter = 0x0000;
            this.xRegister = 0x00;
            this.yRegister = 0x00;
            this.zFlag = 0x0;
            this.state = 'RESIDENT';
        }
        // Update PCB log of CPU state
        update(CPU) {
            // Get state from CPU
            let currentState = CPU.getCpuState();
            this.accumulator = currentState[0];
            this.instructionRegister = currentState[1];
            this.programCounter = currentState[2];
            this.xRegister = currentState[3];
            this.yRegister = currentState[4];
            this.zFlag = currentState[5];
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map