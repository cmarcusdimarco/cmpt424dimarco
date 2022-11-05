/**
 * A Process Control Block (PCB) is a representation of the state of the CPU throughout the execution of a process.
 * It is a fundamental part of context switching, as pushing/popping PCBs from the stack is the way in which
 * the CPU is able to execute multiple processes.
 */

module TSOS {
    export class ProcessControlBlock {
        public readonly processId: number;
        public readonly startingAddress: number;
        public readonly limit: number;
        public memoryPartition: number;
        public programCounter: string;
        public instructionRegister: string;
        public accumulator: string;
        public xRegister: string;
        public yRegister: string;
        public zFlag: string;
        public quantum: number;
        public state: string;

        // HTML/DOM fields using IDs
        public htmlRoot: string;
        public htmlPID: string;
        public htmlState: string;
        public htmlPC: string;
        public htmlIR: string;
        public htmlACC: string;
        public htmlX: string;
        public htmlY: string;
        public htmlZ: string;
        public htmlQuantum: string;

        constructor(processId: number, address: number, limit: number) {
            this.processId = processId;
            this.startingAddress = address;
            this.limit = limit;

            // Determine partition number based on startingAddress
            this.memoryPartition = Math.floor(this.startingAddress / this.limit);

            // Initialize state to 0's
            this.accumulator = '00';
            this.instructionRegister = '00';
            this.programCounter = '0000';
            this.xRegister = '00';
            this.yRegister = '00';
            this.zFlag = '0';
            this.quantum = 0;

            this.state = 'RESIDENT';
        }

        // Update PCB log of CPU state
        public update(CPU: TSOS.Cpu) {
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
        public assignDOMFields(htmlRoot: string) {
            this.htmlRoot = htmlRoot;
            this.htmlPID = `${htmlRoot}ID`;
            this.htmlState = `${htmlRoot}State`;
            this.htmlPC = `${htmlRoot}PC`;
            this.htmlIR = `${htmlRoot}IR`;
            this.htmlACC = `${htmlRoot}ACC`;
            this.htmlX = `${htmlRoot}X`;
            this.htmlY = `${htmlRoot}Y`;
            this.htmlZ = `${htmlRoot}Z`;
            this.htmlQuantum = `${htmlRoot}Quantum`;
        }

        // Update GUI to most current PCB status, using optional param to update state
        public updateGUI(state?: string) {
            // Check for htmlRoot
            if (this.htmlRoot.length === 0) {
                console.log(`ERR: HTML ROOT is not set for process ${this.processId}`);
                return;
            }

            // Update state if passed
            if (state) {
                this.state = state;
            }

            // Update all GUI fields
            document.getElementById(this.htmlPID).innerText = this.processId.toString();
            document.getElementById(this.htmlState).innerText = this.state;

            // If terminated, set CPU registers to 0
            if (state === 'TERMINATED') {
                this.quantum = 0;
                document.getElementById(this.htmlPC).innerText = '0000';
                document.getElementById(this.htmlIR).innerText = '00';
                document.getElementById(this.htmlACC).innerText = '00';
                document.getElementById(this.htmlX).innerText = '00';
                document.getElementById(this.htmlY).innerText = '00';
                document.getElementById(this.htmlZ).innerText = '0';
            } else {
                // Otherwise, set CPU registers to updated values
                document.getElementById(this.htmlPC).innerText = this.programCounter;
                document.getElementById(this.htmlIR).innerText = this.instructionRegister;
                document.getElementById(this.htmlACC).innerText = this.accumulator;
                document.getElementById(this.htmlX).innerText = this.xRegister;
                document.getElementById(this.htmlY).innerText = this.yRegister;
                document.getElementById(this.htmlZ).innerText = this.zFlag;
            }

            this.updateQuantum(this.quantum);
        }

        public updateQuantum(quantum: number) {
            this.quantum = quantum;
            document.getElementById(this.htmlQuantum).innerText = this.quantum.toString();
        }
    }
}