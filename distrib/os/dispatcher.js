/**
 * A virtual representation of the dispatcher.
 *
 * Responsible for giving control of the CPU to the process selected by the short-term scheduler.
 */
var TSOS;
(function (TSOS) {
    class Dispatcher {
        // Initialize CPU with a process and set isExecuting to true.
        dispatch(process) {
            _Kernel.krnTrace(`Dispatching process ${process.processId}...`);
            _CPU.initWithPCB(process);
            _CPU.isExecuting = true;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map