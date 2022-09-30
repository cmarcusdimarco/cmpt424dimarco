module TSOS {

    export class Hardware {

        private idNumber: number;

        private name: String = null;

        public debug: boolean = true;

        constructor(name: String, idNumber: number) {
            this.name = name;
            this.idNumber = idNumber;
        }

        public log(message: String): boolean {
            if (this.debug) {
                console.log(`HW - ${this.name} id: ${this.idNumber} - ${Date.now()}: ${message}`);
                return true;
            }

            return false;
        }

        public hexLog(target: number, desiredLength: number): String {
            // Determine number of leading 0's to add, if necessary, by subtracting the
            // string length from the desired length
            let result: String = target.toString(16);
            let padding: number = desiredLength - result.length;
            result = result.toUpperCase();

            // Add leading 0's
            for (let i = 0x0; i < padding; i++) {
                result = '0' + result;
            }

            return result;
        }
    }
}