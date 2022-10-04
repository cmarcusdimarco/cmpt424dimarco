var TSOS;
(function (TSOS) {
    class Hardware {
        constructor(name, idNumber) {
            this.name = null;
            this.debug = true;
            this.name = name;
            this.idNumber = idNumber;
        }
        log(message) {
            if (this.debug) {
                console.log(`HW - ${this.name} id: ${this.idNumber} - ${Date.now()}: ${message}`);
                return true;
            }
            return false;
        }
        hexLog(target, desiredLength) {
            // Determine number of leading 0's to add, if necessary, by subtracting the
            // string length from the desired length
            let result = target.toString(16);
            let padding = desiredLength - result.length;
            result = result.toUpperCase();
            // Add leading 0's
            for (let i = 0x0; i < padding; i++) {
                result = '0' + result;
            }
            return result;
        }
    }
    TSOS.Hardware = Hardware;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=hardware.js.map