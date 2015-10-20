///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

  export class Cpu {

    constructor(public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public isExecuting: boolean = false) {
    }

    public init(): void {
      this.PC = 0;
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Zflag = 0;
      this.isExecuting = false;
    }

    public cycle(): void {
      _Kernel.krnTrace('CPU cycle');
      // TODO: Accumulate CPU usage and profiling statistics here.
      // Do the real work here. Be sure to set this.isExecuting appropriately.
      if (this.isExecuting) {
        var opCode = this.readNextMemValue();
        this.opCodeLookup(opCode);
      }
    }

    public readNextMemValue(): number {
      var temp = _MMU.fetch(this.PC);
      this.PC++;
      return Utils.parseHex(temp);
    }

    public opCodeLookup(opCode) {
      if(opCode == "A9") {
        this.loadAcc();
      } else if (opCode == "A2") {
        this.loadX();
      } else if (opCode == "A0") {
        this.loadY();
      } else if (opCode == "FF") {
        this.sysCall();
      } else if (opCode == "00") {
        this.isExecuting = false;
      } else {
        throw "ILLEGAL OPERATION"
      }
    }

    public loadAcc() {
      this.Acc = this.readNextMemValue();
    }

    public loadX() {
      this.Xreg = this.readNextMemValue();
    }

    public loadY() {
      this.Yreg = this.readNextMemValue();
    }

    public sysCall() {
      var val = this.readNextMemValue();
      if (val == 1) {
        _Console.putText(this.Yreg);
      } else if (val == 2) {

      } else {
        throw "INVALID";
      }
    }
  }
}
