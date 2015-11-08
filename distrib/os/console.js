///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, tempBuffer, bufferHistory, bufferHistoryPos) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (tempBuffer === void 0) { tempBuffer = ""; }
            if (bufferHistory === void 0) { bufferHistory = []; }
            if (bufferHistoryPos === void 0) { bufferHistoryPos = -1; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.tempBuffer = tempBuffer;
            this.bufferHistory = bufferHistory;
            this.bufferHistoryPos = bufferHistoryPos;
            this.lineHeight = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal"
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer while storing it if it is different from
                    // the most recent history.
                    if (this.bufferHistory[this.bufferHistory.length - 1] != this.buffer) {
                        this.bufferHistory[this.bufferHistory.length] = this.buffer;
                    }
                    this.bufferHistoryPos = this.bufferHistory.length;
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    // Check if buffer is empty or not
                    if (this.buffer.length > 0) {
                        var removedChar = this.buffer.charAt(this.buffer.length - 1);
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                        this.removeChar(removedChar);
                    }
                }
                else if (chr === String.fromCharCode(9)) {
                    this.autoComplete();
                }
                else if (chr === String.fromCharCode(38)) {
                    this.goUpHistory();
                }
                else if (chr === String.fromCharCode(40)) {
                    this.goDownHistory();
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.goUpHistory = function () {
            if (this.bufferHistoryPos > 0) {
                if (this.bufferHistoryPos == this.bufferHistory.length) {
                    // Store what was newly entered but not executed.
                    if (this.bufferHistory[this.bufferHistoryPos - 1] != this.buffer) {
                        this.tempBuffer = this.buffer;
                    }
                }
                this.bufferHistoryPos--;
                this.removeLines(this.buffer);
                this.buffer = this.bufferHistory[this.bufferHistoryPos];
                this.replaceLine(this.buffer);
            }
        };
        Console.prototype.goDownHistory = function () {
            if (this.bufferHistoryPos < this.bufferHistory.length) {
                this.bufferHistoryPos++;
                this.removeLines(this.buffer);
                if (this.bufferHistoryPos == this.bufferHistory.length) {
                    this.buffer = this.tempBuffer;
                }
                else {
                    this.buffer = this.bufferHistory[this.bufferHistoryPos];
                }
                this.replaceLine(this.buffer);
            }
        };
        Console.prototype.autoComplete = function () {
            var output = _OsShell.commandListNames.filter(function (name) {
                return name.startsWith(this.buffer);
            }.bind(this));
            if (output.length > 0) {
                if (output.length > 1) {
                    this.advanceLine();
                    this.putText("Possible Options:");
                    this.advanceLine();
                    this.putText(output.join(", "));
                    this.advanceLine();
                    this.putText(">" + this.buffer);
                }
                else {
                    this.putText(output[0].substring(0 + this.buffer.length));
                    this.buffer = output[0];
                }
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + offset > _Canvas.width - _DefaultFontSize) {
                    var i = 1;
                    do {
                        offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text.substring(0, i));
                        i++;
                    } while (i < text.length && this.currentXPosition + offset < _Canvas.width - _DefaultFontSize);
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    this.advanceLine();
                    this.putText(text.substring(i));
                }
                else {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        };
        Console.prototype.removeChar = function (char) {
            if (char !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, char);
                // Clear the area using a rectange the size of the character.
                _DrawingContext.clearRect(this.currentXPosition - offset, this.currentYPosition - _DefaultFontSize, offset + 1, this.lineHeight + 1);
                this.currentXPosition = this.currentXPosition - offset;
                if (this.currentXPosition < 0) {
                    this.currentXPosition = _Canvas.width;
                    this.currentYPosition = this.currentYPosition - this.lineHeight;
                }
            }
        };
        Console.prototype.replaceLine = function (text) {
            this.removeLine();
            this.putText(">" + text);
        };
        Console.prototype.removeLine = function () {
            _DrawingContext.clearRect(0, this.currentYPosition - _DefaultFontSize, _Canvas.width, this.lineHeight);
            this.currentXPosition = 0;
        };
        Console.prototype.removeLines = function (text) {
            var lines = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text) / _Canvas.width;
            for (var i = 0; i < lines - 1; i++) {
                this.removeLine();
                this.currentYPosition = this.currentYPosition - this.lineHeight;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += this.lineHeight;
            if (this.currentYPosition > _Canvas.height) {
                this.expandCanvas();
            }
        };
        Console.prototype.expandCanvas = function () {
            // Expanding the Canvas causes it to be wiped.The original canvas is
            // stored and then redrawn after the Canvas is resized.
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = _Canvas.width;
            tempCanvas.height = _Canvas.height;
            var tempContext = tempCanvas.getContext('2d');
            tempContext.drawImage(_Canvas, 0, 0);
            _Canvas.height += 100;
            _DrawingContext.drawImage(tempCanvas, 0, 0);
            var consoleDiv = document.getElementById("divConsole");
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
