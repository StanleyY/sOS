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

    public increment(index): void {
      if (index < 256 && index > -1) {
        var temp = Utils.intToHex((Utils.parseHex(_Memory.memory[index]) + 1));
        _Memory.memory[index] = temp;
      } else {
        _CPU.illegalMemAccess();
      }
      this.updateDisplay();
    }

    public updateDisplay() {
      _MemoryDisplay.value = _Memory.memory.join(" ");
    }
  }
}
