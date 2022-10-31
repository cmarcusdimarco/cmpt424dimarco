/**
 * A Process Control Block (PCB) is a representation of the state of the CPU throughout the execution of a process.
 * It is a fundamental part of context switching, as pushing/popping PCBs from the stack is the way in which
 * the CPU is able to execute multiple processes.
 */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(processId, address) {
            // Array of HTML/DOM fields
            this.htmlFields = [];
            this.processId = processId;
            this.startingAddress = address;
            // Initialize state to 0's
            this.accumulator = '00';
            this.instructionRegister = '00';
            this.programCounter = '0000';
            this.xRegister = '00';
            this.yRegister = '00';
            this.zFlag = '0';
            this.state = 'RESIDENT';
        }
        // Update PCB log of CPU state
        update(CPU) {
            // Get state from CPU
            let currentState = CPU.getCpuState();
            this.accumulator = currentState.accumulator;
            this.instructionRegister = currentState.instructionRegister;
            this.programCounter = currentState.programCounter;
            this.xRegister = currentState.xRegister;
            this.yRegister = currentState.yRegister;
            this.zFlag = currentState.zFlag;
        }
        // Assign HTML fields when htmlRoot is assigned
        assignDOMFields(htmlRoot) {
            this.htmlRoot = htmlRoot;
            this.htmlPID = `${htmlRoot}ID`;
            this.htmlState = `${htmlRoot}State`;
            this.htmlPC = `${htmlRoot}PC`;
            this.htmlIR = `${htmlRoot}IR`;
            this.htmlACC = `${htmlRoot}ACC`;
            this.htmlX = `${htmlRoot}X`;
            this.htmlY = `${htmlRoot}Y`;
            this.htmlZ = `${htmlRoot}Z`;
        }
        // Update GUI to most current PCB status, using optional param to update state
        updateGUI(state) {
            // Check for htmlRoot
            if (this.htmlRoot.length == 0) {
                console.log(`ERR: HTML ID is not set for process ${this.processId}`);
                return;
            }
            // Update state if passed
            if (state) {
                this.state = state;
            }
            // Update GUI using htmlId
            document.getElementById(this.htmlPID).innerText = this.processId.toString();
            document.getElementById(this.htmlState).innerText = this.state;
            document.getElementById(this.htmlPC).innerText = this.programCounter;
            document.getElementById(this.htmlIR).innerText = this.instructionRegister;
            document.getElementById(this.htmlACC).innerText = this.accumulator;
            document.getElementById(this.htmlX).innerText = this.xRegister;
            document.getElementById(this.htmlY).innerText = this.yRegister;
            document.getElementById(this.htmlZ).innerText = this.zFlag;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map