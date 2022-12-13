/**
 * A virtual representation of the CPU scheduler.
 *
 * Responsible for selecting which process will have control of the CPU based on scheduling paradigm.
 */
var TSOS;
(function (TSOS) {
    class CpuScheduler {
        // Constructor
        constructor() {
            this.readyQueue = new TSOS.Queue;
            this.quantum = 6;
            this.cycleCounter = 0;
        }
        // Add a process to the ready queue. Begin execution if no program is currently being run.
        enqueue(process) {
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
                    }
                    else {
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
        // Context switch poll, to be called at the end of every CPU cycle
        pollForContextSwitch(process) {
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
                    // If nextProcess is on the disk...
                    if (nextProcess.location === 'DSK') {
                        // ...check for an available memory partition (which there should be, since one process finished)...
                        if (_MemoryManager.hasAvailableMemoryPartition()) {
                            // ...if one is present, swap in the process.
                            _Swapper.swapIntoMemory(nextProcess);
                        }
                        else {
                            // otherwise, swap out the process at the end of the queue and then swap in the nextProcess.
                            _Swapper.swapOutFromMemory(this.readyQueue.peekTail());
                            _Swapper.swapIntoMemory(nextProcess);
                        }
                    }
                    let params = new Array(nextProcess);
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_SCHEDULER_IRQ, params));
                    this.cycleCounter = 0;
                }
                else {
                    // Return out of function if CPU is done executing and no other processes are in ready queue.
                    return;
                }
            }
            else if (this.cycleCounter >= this.quantum) {
                // If quantum has been reached, enqueue PCB and have dispatcher switch to next process.
                this.enqueue(process);
                let nextProcess = this.readyQueue.dequeue();
                // If nextProcess is on the disk...
                if (nextProcess.location === 'DSK') {
                    // ...check for an available memory partition...
                    if (_MemoryManager.hasAvailableMemoryPartition()) {
                        // ...if one is present, swap in the process.
                        _Swapper.swapIntoMemory(nextProcess);
                    }
                    else {
                        // otherwise, swap out the process that was just requeued and then swap in the nextProcess.
                        _Swapper.swapOutFromMemory(process);
                        _Swapper.swapIntoMemory(nextProcess);
                    }
                }
                let params = new Array(nextProcess);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_SCHEDULER_IRQ, params));
                this.cycleCounter = 0;
            }
        }
        extractProcess(process) {
            for (let i = 0; i < this.readyQueue.getSize(); i++) {
                if (this.readyQueue[i] === process) {
                    this.readyQueue.extract(i);
                    return;
                }
            }
            // Error log if process not found
            _Kernel.krnTrace('ERR: Process to be extracted not found in ready queue.');
        }
        clearQueue() {
            this.readyQueue = new TSOS.Queue();
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map