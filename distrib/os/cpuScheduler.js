/**
 * A virtual representation of the CPU scheduler.
 */
var TSOS;
(function (TSOS) {
    class cpuScheduler {
        // Constructor
        constructor() {
            this.readyQueue = new TSOS.Queue;
        }
    }
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpuScheduler.js.map