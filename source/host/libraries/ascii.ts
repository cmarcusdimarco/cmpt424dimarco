module TSOS {

    export class Ascii {
        private static toTable: Map<number, string> = new Map();
        private static fromTable: Map<string, number> = new Map();
        private static isInitialized: boolean = false;

        // Lookup String item for a provided code
        public static lookup(key: number): string {
            if (!Ascii.isInitialized) {
                Ascii.initializeTables();
            }

            if (Ascii.toTable.has(key)) {
                return Ascii.toTable.get(key);
            } else {
                return '';
            }
        }

        // Lookup code for a provided String item
        public static lookupCode(key: string): number {
            if (!Ascii.isInitialized) {
                Ascii.initializeTables();
            }

            if (Ascii.fromTable.has(key)) {
                return Ascii.fromTable.get(key);
            } else {
                return 0xFF;
            }
        }

        // Helper function for converting a full string to ASCII hex codes.
        public static convertStringToAscii(string: string) {
            let asciiString: string = '';
            for (let i = 0; i < string.length; i++) {
                asciiString += this.lookupCode(string.charAt(i)).toString(16);
            }

            return asciiString.toUpperCase();
        }

        public static convertAsciiToString(ascii: string) {
            // Input validation: since ASCII is represented in hex codes, input string must be divisible by 2.
            if (ascii.length % 2 !== 0) {
                console.log(`ERR: could not validate ${ascii} as a valid ASCII-encoded string.`);
                return false;
            }

            let string: string = '';
            for (let i = 0; i < ascii.length; i += 2) {
                // Get the two-character hex code.
                let asciiCharString: string = '';
                asciiCharString += ascii.substring(i, i + 2);
                // Convert to standard notation and append to result string.
                string += this.lookup(parseInt(asciiCharString, 16));
            }

            return string;
        }

        // Initialize ASCII character codes for lookup
        private static initializeTables() {
            Ascii.toTable.set(0x0A, '\n');
            Ascii.fromTable.set('\n', 0x0A);
            Ascii.toTable.set(0x20, ' ');
            Ascii.fromTable.set(' ', 0x20);
            Ascii.toTable.set(0x21, '!');
            Ascii.fromTable.set('!', 0x21);
            Ascii.toTable.set(0x22, '"');
            Ascii.fromTable.set('"', 0x22);
            Ascii.toTable.set(0x23, '#');
            Ascii.fromTable.set('#', 0x23);
            Ascii.toTable.set(0x24, '$');
            Ascii.fromTable.set('$', 0x24);
            Ascii.toTable.set(0x25, '%');
            Ascii.fromTable.set('%', 0x25);
            Ascii.toTable.set(0x26, '&');
            Ascii.fromTable.set('&', 0x26);
            Ascii.toTable.set(0x27, "'");
            Ascii.fromTable.set("'", 0x27);
            Ascii.toTable.set(0x28, '(');
            Ascii.fromTable.set('(', 0x28);
            Ascii.toTable.set(0x29, ')');
            Ascii.fromTable.set(')', 0x29);
            Ascii.toTable.set(0x2A, '*');
            Ascii.fromTable.set('*', 0x2A);
            Ascii.toTable.set(0x2B, '+');
            Ascii.fromTable.set('+', 0x2B);
            Ascii.toTable.set(0x2C, ',');
            Ascii.fromTable.set(',', 0x2C);
            Ascii.toTable.set(0x2D, '-');
            Ascii.fromTable.set('-', 0x2D);
            Ascii.toTable.set(0x2E, '.');
            Ascii.fromTable.set('.', 0x2E);
            Ascii.toTable.set(0x2F, '/');
            Ascii.fromTable.set('/', 0x2F);
            Ascii.toTable.set(0x30, '0');
            Ascii.fromTable.set('0', 0x30);
            Ascii.toTable.set(0x31, '1');
            Ascii.fromTable.set('1', 0x31);
            Ascii.toTable.set(0x32, '2');
            Ascii.fromTable.set('2', 0x32);
            Ascii.toTable.set(0x33, '3');
            Ascii.fromTable.set('3', 0x33);
            Ascii.toTable.set(0x34, '4');
            Ascii.fromTable.set('4', 0x34);
            Ascii.toTable.set(0x35, '5');
            Ascii.fromTable.set('5', 0x35);
            Ascii.toTable.set(0x36, '6');
            Ascii.fromTable.set('6', 0x36);
            Ascii.toTable.set(0x37, '7');
            Ascii.fromTable.set('7', 0x37);
            Ascii.toTable.set(0x38, '8');
            Ascii.fromTable.set('8', 0x38);
            Ascii.toTable.set(0x39, '9');
            Ascii.fromTable.set('9', 0x39);
            Ascii.toTable.set(0x3A, ':');
            Ascii.fromTable.set(':', 0x3A);
            Ascii.toTable.set(0x3B, ';');
            Ascii.fromTable.set(';', 0x3B);
            Ascii.toTable.set(0x3C, '<');
            Ascii.fromTable.set('<', 0x3C);
            Ascii.toTable.set(0x3D, '=');
            Ascii.fromTable.set('=', 0x3D);
            Ascii.toTable.set(0x3E, '>');
            Ascii.fromTable.set('>', 0x3E);
            Ascii.toTable.set(0x3F, '?');
            Ascii.fromTable.set('?', 0x3F);
            Ascii.toTable.set(0x40, '@');
            Ascii.fromTable.set('@', 0x40);
            Ascii.toTable.set(0x41, 'A');
            Ascii.fromTable.set('A', 0x41);
            Ascii.toTable.set(0x42, 'B');
            Ascii.fromTable.set('B', 0x42);
            Ascii.toTable.set(0x43, 'C');
            Ascii.fromTable.set('C', 0x43);
            Ascii.toTable.set(0x44, 'D');
            Ascii.fromTable.set('D', 0x44);
            Ascii.toTable.set(0x45, 'E');
            Ascii.fromTable.set('E', 0x45);
            Ascii.toTable.set(0x46, 'F');
            Ascii.fromTable.set('F', 0x46);
            Ascii.toTable.set(0x47, 'G');
            Ascii.fromTable.set('G', 0x47);
            Ascii.toTable.set(0x48, 'H');
            Ascii.fromTable.set('H', 0x48);
            Ascii.toTable.set(0x49, 'I');
            Ascii.fromTable.set('I', 0x49);
            Ascii.toTable.set(0x4A, 'J');
            Ascii.fromTable.set('J', 0x4A);
            Ascii.toTable.set(0x4B, 'K');
            Ascii.fromTable.set('K', 0x4B);
            Ascii.toTable.set(0x4C, 'L');
            Ascii.fromTable.set('L', 0x4C);
            Ascii.toTable.set(0x4D, 'M');
            Ascii.fromTable.set('M', 0x4D);
            Ascii.toTable.set(0x4E, 'N');
            Ascii.fromTable.set('N', 0x4E);
            Ascii.toTable.set(0x4F, 'O');
            Ascii.fromTable.set('O', 0x4F);
            Ascii.toTable.set(0x50, 'P');
            Ascii.fromTable.set('P', 0x50);
            Ascii.toTable.set(0x51, 'Q');
            Ascii.fromTable.set('Q', 0x51);
            Ascii.toTable.set(0x52, 'R');
            Ascii.fromTable.set('R', 0x52);
            Ascii.toTable.set(0x53, 'S');
            Ascii.fromTable.set('S', 0x53);
            Ascii.toTable.set(0x54, 'T');
            Ascii.fromTable.set('T', 0x54);
            Ascii.toTable.set(0x55, 'U');
            Ascii.fromTable.set('U', 0x55);
            Ascii.toTable.set(0x56, 'V');
            Ascii.fromTable.set('V', 0x56);
            Ascii.toTable.set(0x57, 'W');
            Ascii.fromTable.set('W', 0x57);
            Ascii.toTable.set(0x58, 'X');
            Ascii.fromTable.set('X', 0x58);
            Ascii.toTable.set(0x59, 'Y');
            Ascii.fromTable.set('Y', 0x59);
            Ascii.toTable.set(0x5A, 'Z');
            Ascii.fromTable.set('Z', 0x5A);
            Ascii.toTable.set(0x5B, '[');
            Ascii.fromTable.set('[', 0x5B);
            Ascii.toTable.set(0x5C, '\\');
            Ascii.fromTable.set('\\', 0x5C);
            Ascii.toTable.set(0x5D, ']');
            Ascii.fromTable.set(']', 0x5D);
            Ascii.toTable.set(0x5E, '^');
            Ascii.fromTable.set('^', 0x5E);
            Ascii.toTable.set(0x5F, '_');
            Ascii.fromTable.set('_', 0x5F);
            Ascii.toTable.set(0x60, '`');
            Ascii.fromTable.set('`', 0x60);
            Ascii.toTable.set(0x61, 'a');
            Ascii.fromTable.set('a', 0x61);
            Ascii.toTable.set(0x62, 'b');
            Ascii.fromTable.set('b', 0x62);
            Ascii.toTable.set(0x63, 'c');
            Ascii.fromTable.set('c', 0x63);
            Ascii.toTable.set(0x64, 'd');
            Ascii.fromTable.set('d', 0x64);
            Ascii.toTable.set(0x65, 'e');
            Ascii.fromTable.set('e', 0x65);
            Ascii.toTable.set(0x66, 'f');
            Ascii.fromTable.set('f', 0x66);
            Ascii.toTable.set(0x67, 'g');
            Ascii.fromTable.set('g', 0x67);
            Ascii.toTable.set(0x68, 'h');
            Ascii.fromTable.set('h', 0x68);
            Ascii.toTable.set(0x69, 'i');
            Ascii.fromTable.set('i', 0x69);
            Ascii.toTable.set(0x6A, 'j');
            Ascii.fromTable.set('j', 0x6A);
            Ascii.toTable.set(0x6B, 'k');
            Ascii.fromTable.set('k', 0x6B);
            Ascii.toTable.set(0x6C, 'l');
            Ascii.fromTable.set('l', 0x6C);
            Ascii.toTable.set(0x6D, 'm');
            Ascii.fromTable.set('m', 0x6D);
            Ascii.toTable.set(0x6E, 'n');
            Ascii.fromTable.set('n', 0x6E);
            Ascii.toTable.set(0x6F, 'o');
            Ascii.fromTable.set('o', 0x6F);
            Ascii.toTable.set(0x70, 'p');
            Ascii.fromTable.set('p', 0x70);
            Ascii.toTable.set(0x71, 'q');
            Ascii.fromTable.set('q', 0x71);
            Ascii.toTable.set(0x72, 'r');
            Ascii.fromTable.set('r', 0x72);
            Ascii.toTable.set(0x73, 's');
            Ascii.fromTable.set('s', 0x73);
            Ascii.toTable.set(0x74, 't');
            Ascii.fromTable.set('t', 0x74);
            Ascii.toTable.set(0x75, 'u');
            Ascii.fromTable.set('u', 0x75);
            Ascii.toTable.set(0x76, 'v');
            Ascii.fromTable.set('v', 0x76);
            Ascii.toTable.set(0x77, 'w');
            Ascii.fromTable.set('w', 0x77);
            Ascii.toTable.set(0x78, 'x');
            Ascii.fromTable.set('x', 0x78);
            Ascii.toTable.set(0x79, 'y');
            Ascii.fromTable.set('y', 0x79);
            Ascii.toTable.set(0x7A, 'z');
            Ascii.fromTable.set('z', 0x7A);
            Ascii.toTable.set(0x7B, '{');
            Ascii.fromTable.set('{', 0x7B);
            Ascii.toTable.set(0x7C, '|');
            Ascii.fromTable.set('|', 0x7C);
            Ascii.toTable.set(0x7D, '}');
            Ascii.fromTable.set('}', 0x7D);
            Ascii.toTable.set(0x7E, '~');
            Ascii.fromTable.set('~', 0x7E);
        }
    }
}