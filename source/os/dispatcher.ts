/**
 * A virtual representation of the dispatcher.
 *
 * Responsible for giving control of the CPU to the process selected by the short-term scheduler.
 */

module TSOS {
    export class Dispatcher {

        // Initialize CPU with a process and set isExecuting to true.
        public dispatch(process: TSOS.ProcessControlBlock) {
            _Kernel.krnTrace(`Dispatching process ${process.processId}...`);
            _CPU.initWithPCB(process);
            _CPU.isExecuting = true;
        }
    }
}