module TSOS {

    export class Clock extends Hardware {
        // Array of ClockListeners
        private listeners: ClockListener[] = [];

        // Constructor
        constructor() {
            super('CLK', 0);
        }

        // Add new listener to array
        public addListener(listener: ClockListener) {
            this.listeners.push(listener);
        }

        public pulse() {
            this.log('Clock Pulse Initialized');
            for (let i = 0; i < this.listeners.length; i++) {
                this.listeners[i].pulse();
            }
        }
    }
}