///<reference path="../globals.ts" />

module TSOS {
  export class MemoryManager {
    constructor() {
      this.updateDisplay();
    }

    // bytes are the bytes to write. Index is in hex
    public write(bytes, index): void {
      index = parseInt(index, 16); // Convert hex to decimal.
      for(var i = 0; i < bytes.length; i = i + 2) {
        _Memory.memory[index] = bytes.substring(i, i+2);
        index++;
      }
      this.updateDisplay();
    }

    public updateDisplay() {
      _MemoryDisplay.value = _Memory.memory.join(" ");
    }
  }
}
