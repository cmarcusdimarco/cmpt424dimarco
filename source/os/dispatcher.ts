/**
 * A virtual representation of the dispatcher.
 *
 * Responsible for giving control of the CPU to the process selected by the short-term scheduler.
 */

module TSOS {
    export class Dispatcher {

        // Initialize CPU with a process and set isExecuting to true.
        public dispatch(params) {
            // Since this method will be called with a param of type <any> from the Kernel, we need to check type.
            if (params[0] instanceof TSOS.ProcessControlBlock) {
                _Kernel.krnTrace(`Dispatching process ${params[0].processId}...`);
                params[0].updateGUI('RUNNING');
                _CPU.initWithPCB(params[0]);
                _CPU.isExecuting = true;
            } else {
                console.log('ERR: Dispatcher passed a parameter not of type ProcessControlBlock.');
            }
        }
    }
}