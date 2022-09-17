/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", tabIndex = -1, tabBuffer = "", commandsPassed = [], previousCommandIndex = 0) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.tabIndex = tabIndex;
            this.tabBuffer = tabBuffer;
            this.commandsPassed = commandsPassed;
            this.previousCommandIndex = previousCommandIndex;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... add the value to our command history ...
                    this.commandsPassed.push(this.buffer);
                    // ... and reset our buffer and tabIndex.
                    this.buffer = "";
                    this.tabIndex = -1;
                    this.tabBuffer = "";
                    this.previousCommandIndex = this.commandsPassed.length;
                }
                else if (chr === String.fromCharCode(8) && this.buffer.length > 0) { // the Backspace key
                    // Backspace should only clear the last character from the screen if there is text in the buffer...
                    this.deleteText();
                    // ...then it should remove the deleted character from the buffer.
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                else if (chr === String.fromCharCode(9) && this.buffer.length > 0) { // the Tab key
                    // Incrementing the tabIndex each time tab is pressed will allow iteration past matched commands.
                    this.tabIndex++;
                    // Check tabIndex for out-of-bounds exception. If greater than array length, start over.
                    if (this.tabIndex >= _OsShell.commandList.length) {
                        this.tabIndex = 0;
                    }
                    // Check tabBuffer for contents.
                    if (this.tabBuffer.length == 0) {
                        this.tabBuffer = this.buffer;
                    }
                    // The tab key should search the OsShell command list from the last result (or beginning)...
                    for (let i = this.tabIndex; i < _OsShell.commandList.length + this.tabIndex; i++) {
                        // Use modular division to loop back to start of array once array bound is exceeded
                        let index = i % _OsShell.commandList.length;
                        let command = _OsShell.commandList[index].command;
                        // ...and on finding a match...
                        if (command.startsWith(this.tabBuffer) && command != this.buffer) {
                            // ...delete previous tab completion, if present...
                            let k = this.buffer.length; // Preserve value since we are manipulating buffer length in loop.
                            for (let j = this.tabBuffer.length; j < k; j++) {
                                this.deleteText();
                                // ...removing previous tab completion from buffer...
                                this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                            }
                            // ...and type command to buffer, ensuring that we only type the characters that remain.
                            this.putText(command.substring(this.buffer.length));
                            this.buffer += command.substring(this.buffer.length);
                            this.tabIndex = index;
                            break;
                        }
                    }
                }
                else if (chr === String.fromCharCode(38)) {
                    // The up arrow should decrement the previousCommandIndex...
                    if (this.previousCommandIndex != 0) {
                        this.previousCommandIndex--;
                    }
                    let upBufferLength = this.buffer.length;
                    // ...delete all current input...
                    for (let i = 0; i < upBufferLength; i++) {
                        this.deleteText();
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    }
                    // ...and replace it with the previous command used.
                    this.putText(this.commandsPassed[this.previousCommandIndex]);
                    this.buffer = this.commandsPassed[this.previousCommandIndex];
                }
                else if (chr === String.fromCharCode(40)) {
                    // The down arrow should only execute after an up arrow input.
                    if (this.previousCommandIndex != this.commandsPassed.length) {
                        this.previousCommandIndex++;
                        let downBufferLength = this.buffer.length;
                        // Delete all input...
                        for (let i = 0; i < downBufferLength; i++) {
                            this.deleteText();
                            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                        }
                        // ...and replace it with the subsequent command.
                        this.putText(this.commandsPassed[this.previousCommandIndex]);
                        this.buffer = this.commandsPassed[this.previousCommandIndex];
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
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
        deleteText() {
            let charToDelete = this.buffer.charAt(this.buffer.length - 1);
            let offsetX = _DrawingContext.measureText(this.currentFont, this.currentFontSize, charToDelete);
            let offsetY = _DefaultFontSize + // Ensures characters that go above or below line (f, j, etc.) are fully cleared
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // Move the current X and Y position.
            this.currentXPosition = this.currentXPosition - offsetX;
            this.currentYPosition = this.currentYPosition - this.currentFontSize;
            // Clear the most recent character from the screen
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition, offsetX, offsetY);
            // Reset Y position.
            this.currentYPosition = this.currentYPosition + this.currentFontSize;
        }
        advanceLine() {
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
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map