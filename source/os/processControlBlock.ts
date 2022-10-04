/**
 * A Process Control Block (PCB) is a representation of the state of the CPU throughout the execution of a process.
 * It is a fundamental part of context switching, as pushing/popping PCBs from the stack is the way in which
 * the CPU is able to execute multiple processes.
 */

module TSOS {
    export class ProcessControlBlock {
        public readonly processId: number;
        public programCounter: number;
        public instructionRegister: number;
        public accumulator: number;
        public xRegister: number;
        public yRegister: number;
        public zFlag: number;
        public state: string;

        constructor() {
        }
    }
}