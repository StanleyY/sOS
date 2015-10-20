///<reference path="../globals.ts" />

module TSOS {
  export class Memory {
    memory: string[];
    constructor() {
      // Memory is currently 256 bytes.
      this.memory = [];
      for (var i = 0; i < 256; i++) {
        this.memory.push("00");
      }
    }
  }
}
