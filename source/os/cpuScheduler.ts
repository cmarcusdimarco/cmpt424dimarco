/**
 * A virtual representation of the CPU scheduler.
 *
 * Responsible for selecting which process will have control of the CPU based on scheduling paradigm.
 */

module TSOS {
    export class CpuScheduler {
        public readyQueue: Queue = new TSOS.Queue;
        public quantum: number = 6;
        public cycleCounter: number = 0;


        // Constructor
        constructor() {
        }

        // Add a process to the ready queue. Begin execution if no program is currently being run.
        public enqueue(process: TSOS.ProcessControlBlock) {
            process.updateGUI('READY');
            this.readyQueue.enqueue(process);
            _Kernel.krnTrace(`Enqueued process ${process.processId} in ready queue.`);
            if (!_CPU.isExecuting) {
                this.readyQueue.dequeue();
                _Dispatcher.dispatch(process);
                process.updateGUI('RUNNING');
            }
        }

        // Set scheduling method
        // Default = Round Robin

        // Context switch poll, to be called at the end of every CPU cycle
        public pollForContextSwitch(process: TSOS.ProcessControlBlock) {
            // Increment cycleCounter to track current process's CPU time
            if (this.readyQueue.getSize() !== 0) {
                this.cycleCounter++;
            }

            // If quantum has been reached, enqueue PCB and have dispatcher switch to next process.
            if (this.cycleCounter >= this.quantum) {
                this.readyQueue.enqueue(process);
                _Kernel.krnTrace(`Enqueued process ${process.processId} in ready queue.`);
                let nextProcess = this.readyQueue.dequeue();
                _Dispatcher.dispatch(nextProcess);
                nextProcess.updateGUI('RUNNING');
                this.cycleCounter = 0;
            }

            // If one process finishes and other processes are in the queue, dispatch next process.
            if (!_CPU.isExecuting && this.readyQueue.getSize() > 0) {
                let nextProcess = this.readyQueue.dequeue();
                _Dispatcher.dispatch(nextProcess);
                nextProcess.updateGUI('RUNNING');
                this.cycleCounter = 0;
            }
        }
    }
}