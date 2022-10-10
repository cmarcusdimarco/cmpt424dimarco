/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var isControlled = params[2];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted + " controlled:" + isControlled);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isControlled === true && keyCode == 67) {
                    _Kernel.krnHaltProgram();
                    return;
                }
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 8) || // backspace
                (keyCode == 9) || // tab
                (keyCode == 38 && isShifted === false) || // up arrow
                (keyCode == 40)) { // down arrow
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57))) { // digits
                // Check for shifted keyboard number keys
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = ')';
                            break;
                        case 49:
                            chr = '!';
                            break;
                        case 50:
                            chr = '@';
                            break;
                        case 51:
                            chr = '#';
                            break;
                        case 52:
                            chr = '$';
                            break;
                        case 53:
                            chr = '%';
                            break;
                        case 54:
                            chr = '^';
                            break;
                        case 55:
                            chr = '&';
                            break;
                        case 56:
                            chr = '*';
                            break;
                        case 57:
                            chr = '(';
                            break;
                        default: break;
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 186 && keyCode <= 192) || // Symbols, IE Keycodes
                (keyCode >= 219 && keyCode <= 222) || // Symbols, IE Keycodes
                (keyCode >= 44 && keyCode <= 47) || // Symbols, Mozilla/ASCII Keycodes
                (keyCode == 39) || // Symbols, Mozilla/ASCII Keycodes
                (keyCode == 59) || // Symbols, Mozilla/ASCII Keycodes
                (keyCode == 61) || // Symbols, Mozilla/ASCII Keycodes
                (keyCode >= 91 && keyCode <= 93) || // Symbols, Mozilla/ASCII Keycodes
                (keyCode == 96)) {
                switch (keyCode) {
                    case 59:
                    case 186:
                        chr = isShifted ? ':' : ';';
                        break;
                    case 61:
                    case 187:
                        chr = isShifted ? '+' : '=';
                        break;
                    case 44:
                    case 188:
                        chr = isShifted ? '<' : ',';
                        break;
                    case 45:
                    case 189:
                        chr = isShifted ? '_' : '-';
                        break;
                    case 46:
                    case 190:
                        chr = isShifted ? '>' : '.';
                        break;
                    case 47:
                    case 191:
                        chr = isShifted ? '?' : '/';
                        break;
                    case 96:
                    case 192:
                        chr = isShifted ? '~' : '`';
                        break;
                    case 91:
                    case 219:
                        chr = isShifted ? '{' : '[';
                        break;
                    case 92:
                    case 220:
                        chr = isShifted ? '|' : String.fromCharCode(92); // Using fromCharCode to avoid escaping '\'
                        break;
                    case 93:
                    case 221:
                        chr = isShifted ? '}' : ']';
                        break;
                    case 39:
                    case 222:
                        chr = isShifted ? '"' : "'";
                        break;
                    default: break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map