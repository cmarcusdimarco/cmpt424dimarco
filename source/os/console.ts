/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8) && this.buffer.length > 0) {    // the Backspace key
                    // Backspace should only clear the last character from the screen if there is text in the buffer...
                    this.deleteText();
                    // ...then it should remove the deleted character from the buffer.
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }

        public deleteText(): void {
            let charToDelete = this.buffer.charAt(this.buffer.length - 1);
            // Clear the most recent character from the screen
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, charToDelete);
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition, -offset, this.currentFontSize);
            // Move the current X position.
            this.currentXPosition = this.currentXPosition - offset;
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            let offsetY = _DefaultFontSize +
                          _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                          _FontHeightMargin;

            this.currentYPosition += offsetY;

            // If the text input would extend beyond the base of the canvas...
            if (this.currentYPosition > _Canvas.height) {
                // ...capture an image of the current canvas minus the top line, which will be truncated...
                let imageData = _DrawingContext.getImageData(0, offsetY, _Canvas.width, _Canvas.height);
                // ...clear the screen...
                this.clearScreen();
                // ...and paste the truncated image at the top.
                _DrawingContext.putImageData(imageData, 0, 0);
                // Set the Y Position to place the cursor at the bottom of the existing text.
                this.currentYPosition = _Canvas.height - _DefaultFontSize;
            }
        }
    }
 }
