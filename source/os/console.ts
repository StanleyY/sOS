///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

  export class Console {
    lineHeight: number;
    constructor(public currentFont = _DefaultFontFamily,
                public currentFontSize = _DefaultFontSize,
                public currentXPosition = 0,
                public currentYPosition = _DefaultFontSize,
                public buffer = "",
                public tempBuffer = "",
                public bufferHistory = [],
                public bufferHistoryPos = -1) {
      this.lineHeight = _DefaultFontSize +
                        _DrawingContext.fontDescent(this.currentFont,
                                                    this.currentFontSize) +
                        _FontHeightMargin;
    }

    public init(): void {
      this.clearScreen();
      this.resetXY();
    }

    private clearScreen(): void {
      _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
    }

    private resetXY(): void {
      this.currentXPosition = 0;
      this.currentYPosition = this.currentFontSize;
    }

    public handleInput(): void {
      while (_KernelInputQueue.getSize() > 0) {
        // Get the next character from the kernel input queue.
        var chr = _KernelInputQueue.dequeue();
        // Check to see if it's "special" (enter or ctrl-c) or "normal"
        if (chr === String.fromCharCode(13)) {  // Enter key
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
        } else if (chr === String.fromCharCode(8)) {  // Backspace
          // Check if buffer is empty or not
          if (this.buffer.length > 0) {
              var removedChar = this.buffer.charAt(
                  this.buffer.length - 1);
              this.buffer = this.buffer.substring(
                  0, this.buffer.length - 1);

              this.removeChar(removedChar);
          }
        } else if (chr === String.fromCharCode(38)) {  // Up Arrow
          if (this.bufferHistoryPos > 0) {
            if (this.bufferHistoryPos == this.bufferHistory.length) {
              if (this.bufferHistory[this.bufferHistoryPos - 1] != this.buffer) {
                this.tempBuffer = this.buffer;
              }
            }
            this.bufferHistoryPos--;
            this.buffer = this.bufferHistory[this.bufferHistoryPos];
            console.log(this.buffer);
          }
        } else if (chr === String.fromCharCode(40)) {  // Up Arrow
          if (this.bufferHistoryPos < this.bufferHistory.length) {
            this.bufferHistoryPos++;
            if (this.bufferHistoryPos == this.bufferHistory.length) {
              this.buffer = this.tempBuffer;
            } else {
              this.buffer = this.bufferHistory[this.bufferHistoryPos];
            }
            console.log(this.buffer);
          }
        } else {
          // This is a "normal" character, so ...
          // ... draw it on the screen...
          this.putText(chr);
          // ... and add it to our buffer.
          this.buffer += chr;
        }
        // TODO: Write a case for Ctrl-C.
      }
    }

    public putText(text): void {
      // My first inclination here was to write two functions: putChar() and putString().
      // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
      // between the two.  So rather than be like PHP and write two (or more) functions that
      // do the same thing, thereby encouraging confusion and decreasing readability, I
      // decided to write one function and use the term "text" to connote string or char.
      //
      // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
      //         Consider fixing that.
      if (text !== "") {
        // Draw the text at the current X and Y coordinates.
        _DrawingContext.drawText(
            this.currentFont, this.currentFontSize,
            this.currentXPosition, this.currentYPosition, text);
        // Move the current X position.
        var offset = _DrawingContext.measureText(
            this.currentFont, this.currentFontSize, text);
        this.currentXPosition = this.currentXPosition + offset;
      }
    }

    public removeChar(char): void {
      if (char !== "") {
        var offset = _DrawingContext.measureText(
            this.currentFont, this.currentFontSize, char);
        // Clear the area using a rectange the size of the character.
        _DrawingContext.clearRect(this.currentXPosition - offset,
                                  this.currentYPosition - this.lineHeight,
                                  offset + 1,
                                  this.lineHeight + 1);
        this.currentXPosition = this.currentXPosition - offset;
      }
    }

    public advanceLine(): void {
      this.currentXPosition = 0;
      /*
       * Font size measures from the baseline to the highest point in the font.
       * Font descent measures from the baseline to the lowest point in the font.
       * Font height margin is extra spacing between the lines.
       */
      this.currentYPosition += this.lineHeight;
      if (this.currentYPosition > _Canvas.height) {
        // When a canvas is resized, it gets wiped. The original image is saved,
        // then restored after resizing.
        var original_canvas = _Canvas.toDataURL();
        _Canvas.height = this.currentYPosition + (this.lineHeight * 3);
        var img = new Image();
        img.src = original_canvas;
        _DrawingContext.drawImage(img, 0, 0);
        var consoleDiv = document.getElementById("divConsole");
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
      }
    }
  }
}
