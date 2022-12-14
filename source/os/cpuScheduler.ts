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
        public schedulingAlgorithm: string = 'ROUND ROBIN';


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
                // If no other processes in readyQueue and process is on the disk...
                if (this.readyQueue.isEmpty() && process.location === 'DSK') {
                    // ...check for an available memory partition...
                    if (_MemoryManager.hasAvailableMemoryPartition()) {
                        // ...if one is present, swap in the process.
                        _Swapper.swapIntoMemory(process);
                    } else {
                        // otherwise, swap one out and then swap in the process.
                        for (let otherProcess of _MemoryManager.registeredProcesses) {
                            if (otherProcess.state !== 'TERMINATED' && process.processId !== otherProcess.processId) {
                                _Swapper.swapOutFromMemory(otherProcess);
                                _Swapper.swapIntoMemory(process);
                                break;
                            }
                        }
                    }
                }
                let params = new Array(process);
                _Dispatcher.dispatch(params);
            }
        }

        // Set scheduling method
        // Default = Round Robin
        public getSchedule() {
            return this.schedulingAlgorithm;
        }

        public setSchedule(schedulingAlgorithm: string) {
            // Validate input
            if (schedulingAlgorithm === 'ROUND ROBIN') {
                this.schedulingAlgorithm = schedulingAlgorithm;
                this.quantum = 6;
            } else if (schedulingAlgorithm === 'PRIORITY' || schedulingAlgorithm === 'FCFS') {
                this.schedulingAlgorithm = schedulingAlgorithm;
                this.quantum = Number.MAX_VALUE;
            }
        }

        // Context switch poll, to be called at the end of every CPU cycle
        public pollForContextSwitch(process: TSOS.ProcessControlBlock) {
            // Increment cycleCounter to track current process's CPU time
            this.cycleCounter++;
            // Update in GUI
            if (this.schedulingAlgorithm === 'ROUND ROBIN') {
                process.updateQuantum(this.cycleCounter);
            }

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
                    let nextProcess = this.schedulingAlgorithm === 'PRIORITY' ? this.extractHighPriorityProcess() : this.readyQueue.dequeue();
                    // If nextProcess is on the disk...
                    if (nextProcess.location === 'DSK') {
                        // ...check for an available memory partition (which there should be, since one process finished)...
                        if (_MemoryManager.hasAvailableMemoryPartition()) {
                            // ...if one is present, swap in the process.
                            _Swapper.swapIntoMemory(nextProcess);
                        } else {
                            // otherwise, swap out the process at the end of the queue and then swap in the nextProcess.
                            _Swapper.swapOutFromMemory(this.readyQueue.peekTail());
                            _Swapper.swapIntoMemory(nextProcess);
                        }
                    }
                    let params = new Array(nextProcess);
                    _KernelInterruptQueue.enqueue(new Interrupt(CPU_SCHEDULER_IRQ, params));
                    this.cycleCounter = 0;
                } else {
                    // Return out of function if CPU is done executing and no other processes are in ready queue.
                    return;
                }
            } else if (this.cycleCounter >= this.quantum) {
                // If quantum has been reached, enqueue PCB and have dispatcher switch to next process.
                // Note: quantum should not be reachable in FCFS and Priority.
                this.enqueue(process);
                let nextProcess = this.readyQueue.dequeue();
                // If nextProcess is on the disk...
                if (nextProcess.location === 'DSK') {
                    // ...check for an available memory partition...
                    if (_MemoryManager.hasAvailableMemoryPartition()) {
                        // ...if one is present, swap in the process.
                        _Swapper.swapIntoMemory(nextProcess);
                    } else {
                        // otherwise, swap out the process that was just requeued and then swap in the nextProcess.
                        _Swapper.swapOutFromMemory(process);
                        _Swapper.swapIntoMemory(nextProcess);
                    }
                }
                let params = new Array(nextProcess);
                _KernelInterruptQueue.enqueue(new Interrupt(CPU_SCHEDULER_IRQ, params));
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

        public extractHighPriorityProcess() {
            let highestPriority = Number.MAX_VALUE;
            let highestPriorityProcessIndex;
            let highestPriorityProcess;
            for (let i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue.peekIndex(i).priority < highestPriority) {
                    highestPriorityProcessIndex = i;
                    highestPriority = this.readyQueue.peekIndex(i).priority;
                    highestPriorityProcess = this.readyQueue.peekIndex(i);
                }
            }

            this.readyQueue.extract(highestPriorityProcessIndex);

            return highestPriorityProcess;
        }
    }
}