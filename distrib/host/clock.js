var TSOS;
(function (TSOS) {
    class Clock extends TSOS.Hardware {
        // Constructor
        constructor() {
            super('CLK', 0);
            // Array of ClockListeners
            this.listeners = [];
        }
        // Add new listener to array
        addListener(listener) {
            this.listeners.push(listener);
        }
        pulse() {
            this.log('Clock Pulse Initialized');
            for (let i = 0; i < this.listeners.length; i++) {
                this.listeners[i].pulse();
            }
        }
    }
    TSOS.Clock = Clock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=clock.js.map