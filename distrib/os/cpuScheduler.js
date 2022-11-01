/**
 * A virtual representation of the CPU scheduler.
 */
var TSOS;
(function (TSOS) {
    class CpuScheduler {
        // Constructor
        constructor() {
            this.readyQueue = new TSOS.Queue;
        }
    }
    TSOS.CpuScheduler = CpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map