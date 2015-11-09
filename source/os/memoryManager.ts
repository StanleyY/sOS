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
      _MemoryDisplay.innerHTML = ""; // Clear the table
      for (var i = 0; i < _Memory.memory.length; i += 8) {
        var row = <HTMLTableRowElement> _MemoryDisplay.insertRow();  // insert a new row at 0
        var cell = row.insertCell();
        cell.className = "titleCell";
        cell.innerHTML = "0x" + Utils.intToHex(i);
        for (var j = i; j < i + 8; j++) {
          cell = row.insertCell();
          cell.innerHTML = _Memory.memory[j];
        }
      }
    }
  }
}
