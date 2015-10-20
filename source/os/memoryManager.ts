///<reference path="../globals.ts" />

module TSOS {
  export class MemoryManager {
    memory: string[];
    constructor() {
      // Fill memory with 256 locations.
      this.memory = [];
      for (var i = 0; i < 256; i++) {
        this.memory.push("00");
      }
      this.updateDisplay();
    }

    // bytes are the bytes to write. Index is in hex
    public write(bytes, index): void {
      index = parseInt(index, 16); // Convert hex to decimal.
      for(var i = 0; i < bytes.length; i = i + 2) {
        this.memory[index] = bytes.substring(i, i+2);
        index++;
      }
      this.updateDisplay();
    }

    public updateDisplay() {
      _MemoryDisplay.value = this.memory.join(" ");
    }
  }
}
