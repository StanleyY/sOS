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

    public write(bytes, index): void {
      console.log(this.memory);
    }

    public updateDisplay() {
      _MemoryDisplay.value = this.memory.join(" ");
    }
  }
}
