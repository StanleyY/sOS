///<reference path="../globals.ts" />

module TSOS {
  export class MemoryManager {
    availableParitions: number[];

    constructor() {
      this.availableParitions = [0, 1, 2];
      this.updateDisplay();
    }

    public clearMemory() {
      this.availableParitions = [0, 1, 2];
      _Memory.memory = [];
      for (var i = 0; i < 768; i++) {
        _Memory.memory.push("00");
      }
    }

    public getMemoryAddress(base, index) {
      if (index < 256 && index > -1) {
        return base + index;
      } else {
        _CPU.illegalMemAccess();
        return -1;
      }
    }

    // Loads the program into memory and creates a pcb.
    // Returns the PCB or null if no partitions available.
    public loadProgram(bytes) {
      if (this.availableParitions.length < 1) {
        return null;
      }
      var base = this.availableParitions.shift() * 256;
      this.write(bytes, base, 0);
      Control.hostLog("Allocated Memory Partition: " + base / 256, "Memory Manager");
      return base;
    }

    // bytes are the bytes to write. Index is in decimal
    public write(bytes, base, index): void {
      index = this.getMemoryAddress(base, index);
      if (index > -1) {
        for(var i = 0; i < bytes.length; i = i + 2) {
          _Memory.memory[index] = bytes.substring(i, i+2);
          index++;
        }
      }
    }

    public fetchByHex(base, hexIndex): number {
      return this.fetch(base, parseInt(hexIndex, 16));
    }

    public fetch(base, index): number {
      index = this.getMemoryAddress(base, index);
      if (index > -1) {
        return _Memory.memory[index];
      }
    }

    public increment(base, index): void {
      index = this.getMemoryAddress(base, index);
      if (index > -1) {
        var temp = Utils.intToHex((Utils.parseHex(_Memory.memory[index]) + 1));
        _Memory.memory[index] = temp;
      }
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
