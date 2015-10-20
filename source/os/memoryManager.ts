///<reference path="../globals.ts" />

module TSOS {
  export class MemoryManager {
    constructor() {
      this.updateDisplay();
    }

    // bytes are the bytes to write. Index is in dec
    public write(bytes, index): void {
      if (index < 256 && index > -1) {
        for(var i = 0; i < bytes.length; i = i + 2) {
          _Memory.memory[index] = bytes.substring(i, i+2);
          index++;
        }
        this.updateDisplay();
      } else {
        _CPU.illegalMemAccess();
      }
    }

    public fetchByHex(hexIndex): number {
      return this.fetch(parseInt(hexIndex, 16));
    }

    public fetch(index): number {
      if (index < 256 && index > -1) {
        return _Memory.memory[index];
      } else {
        _CPU.illegalMemAccess();
      }
    }

    public updateDisplay() {
      _MemoryDisplay.value = _Memory.memory.join(" ");
    }
  }
}
