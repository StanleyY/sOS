///<reference path="../globals.ts" />

module TSOS {
  export class MemoryManager {
    constructor() {
      this.updateDisplay();
    }

    // bytes are the bytes to write. Index is in dec
    public write(bytes, index): void {
      for(var i = 0; i < bytes.length; i = i + 2) {
        _Memory.memory[index] = bytes.substring(i, i+2);
        index++;
      }
      this.updateDisplay();
    }

    public fetchByHex(hexIndex): number {
      return this.fetch(parseInt(hexIndex, 16));
    }

    public fetch(index): number {
      return _Memory.memory[index];
    }

    public updateDisplay() {
      _MemoryDisplay.value = _Memory.memory.join(" ");
    }
  }
}
