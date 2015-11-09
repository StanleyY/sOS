///<reference path="../globals.ts" />

module TSOS {
  export class Memory {
    memory: string[];
    constructor() {
      // Memory is currently 768 bytes.
      this.memory = [];
      for (var i = 0; i < 768; i++) {
        this.memory.push("00");
      }
    }
  }
}
