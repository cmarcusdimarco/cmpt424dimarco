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
            this.cycleCounter++;
            // Update in GUI
            process.updateQuantum(this.cycleCounter);

            // Increment turnaround time for executing process and all processes in ready queue
            // Increment wait time for processes in ready queue
            process.updateTurnaround(++process.turnaround);
            for (let i = 0; i < this.readyQueue.getSize(); i++) {
                // Since queue class handles objects of type <any>, check for type <ProcessControlBlock> before accessing properties.
                if (this.readyQueue.q[i] instanceof TSOS.ProcessControlBlock) {
                    this.readyQueue.q[i].updateTurnaround(++this.readyQueue.q[i].turnaround);
                    this.readyQueue.q[i].updateWaitTime(++this.readyQueue.q[i].waitTime);
                }
            }

            // If one process finishes and other processes are in the queue, dispatch next process.
            if (!_CPU.isExecuting) {
                if (this.readyQueue.getSize() > 0) {
                    let nextProcess = this.readyQueue.dequeue();
                    _Dispatcher.dispatch(nextProcess);
                    nextProcess.updateGUI('RUNNING');
                    this.cycleCounter = 0;
                } else {
                    // Return out of function if CPU is done executing and no other processes are in ready queue.
                    return;
                }
            } else if (this.cycleCounter >= this.quantum) {
                // If quantum has been reached, enqueue PCB and have dispatcher switch to next process.
                this.enqueue(process);
                let nextProcess = this.readyQueue.dequeue();
                _Dispatcher.dispatch(nextProcess);
                nextProcess.updateGUI('RUNNING');
                this.cycleCounter = 0;
            }
        }

        public extractProcess(process: TSOS.ProcessControlBlock) {
            for (let i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue[i] === process) {
                    this.readyQueue.extract(i);
                    return;
                }
            }

            // Error log if process not found
            _Kernel.krnTrace('ERR: Process to be extracted not found in ready queue.');
        }

        public clearQueue() {
            this.readyQueue = new TSOS.Queue();
        }
    }
}