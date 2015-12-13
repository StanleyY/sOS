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
    baseReg: number = 0;
    limitReg: number = 256;
    constructor(public PC: number = 0,
                public IR: string = "00",
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public isExecuting: boolean = false) {
    }

    public init(): void {
      this.PC = 0;
      this.IR = "00";
      this.Acc = 0;
      this.Xreg = 0;
      this.Yreg = 0;
      this.Zflag = 0;
      this.isExecuting = false;
      this.updateDisplay();
    }

    public updateDisplay(): void {
      var temp = "PC: " + this.PC + "\n" +
                 "IR: 0x" + this.IR + "\n" +
                 "Acc: " + this.Acc + "\n" +
                 "X reg: " + this.Xreg + "\n" +
                 "Y reg: " + this.Yreg + "\n" +
                 "Z flag: " + this.Zflag;
      _CpuDisplay.value = temp;
    }

    public loadPCB(pcb): void {
      this.PC = pcb.PC;
      this.Acc = pcb.Acc;
      this.Xreg = pcb.Xreg;
      this.Yreg = pcb.Yreg;
      this.Zflag = pcb.Zflag;
      this.baseReg = pcb.baseReg;
      this.limitReg = pcb.limitReg;
    }

    public illegalMemAccess() {
      this.abort("Out of bound memory access, Aborting.");
    }

    public abort(message) {
      _StdOut.putText(message);
      _Console.advanceLine();
      _StdOut.putText(">");
      this.init();
    }

    public cycle(): void {
      if (this.isExecuting) {
        _Kernel.krnTrace('CPU cycle');
        var opCode = this.readNextMemValueInHex();
        this.opCodeLookup(opCode);
        this.updateDisplay();
      }
    }

    public readNextMemValue(): number {
      return Utils.parseHex(this.readNextMemValueInHex());
    }

    public readNextMemValueInHex(): number {
      var temp = _MMU.fetch(this.baseReg, this.PC);
      this.PC++;
      return temp;
    }

    public readNextTwoMemValues(): number {
      var temp = _MMU.fetch(this.baseReg, this.PC);
      this.PC++;
      temp = _MMU.fetch(this.baseReg, this.PC) + temp;  // Big Endian
      this.PC++;
      return Utils.parseHex(temp);
    }

    // Index is in decimal
    public readMemValue(index): number {
      return Utils.parseHex(_MMU.fetch(this.baseReg, index));
    }

    public opCodeLookup(opCode) {
      this.IR = opCode;
      if(opCode == "A9") {
        this.loadAcc();
      } else if (opCode == "AD") {
        this.loadAccFromMem();
      } else if (opCode == "8D") {
        this.storeAcc();
      } else if (opCode == "6D") {
        this.addAcc();
      } else if (opCode == "A2") {
        this.loadX();
      } else if (opCode == "AE") {
        this.loadXFromMem();
      } else if (opCode == "A0") {
        this.loadY();
      } else if (opCode == "AC") {
        this.loadYFromMem();
      } else if (opCode == "EA") {
        // No Op
      } else if (opCode == "EC") {
        this.compareX();
      } else if (opCode == "D0") {
        this.branch();
      } else if (opCode == "EE") {
        this.incrementByte();
      } else if (opCode == "FF") {
        this.sysCall();
      } else if (opCode == "00") {
        this.abort("");  // Break
      } else {
        this.abort("Unknown Operation, Aborting.");
      }
    }

    public loadAcc() {
      this.Acc = this.readNextMemValue();
    }

    public loadAccFromMem() {
      var memLocation = this.readNextTwoMemValues();
      this.Acc = this.readMemValue(memLocation);
    }

    public loadX() {
      this.Xreg = this.readNextMemValue();
    }

    public loadXFromMem() {
      var memLocation = this.readNextTwoMemValues();
      this.Xreg = this.readMemValue(memLocation);
    }

    public loadY() {
      this.Yreg = this.readNextMemValue();
    }

    public loadYFromMem() {
      var memLocation = this.readNextTwoMemValues();
      this.Yreg = this.readMemValue(memLocation);
    }

    public storeAcc() {
      var memLocation = this.readNextTwoMemValues();
      _MMU.write(Utils.intToHex(this.Acc), this.baseReg, memLocation);
    }

    public addAcc() {
      var memLocation = this.readNextTwoMemValues();
      this.Acc += this.readMemValue(memLocation);
    }

    public compareX() {
      var memLocation = this.readNextTwoMemValues();
      if(this.readMemValue(memLocation) == this.Xreg) {
        this.Zflag = 1;
      } else {
        this.Zflag = 0;
      }
    }

    public branch() {
      var n = this.readNextMemValue();
      if (this.Zflag == 0) {
        this.PC += n;
        this.PC = this.PC % 256;  // For branches that wrap around
      }
    }

    public incrementByte() {
      var memLocation = this.readNextTwoMemValues();
      _MMU.increment(this.baseReg, memLocation);
    }

    public sysCall() {
      if (this.Xreg == 1) {
        _Console.putText("" + this.Yreg);
      } else if (this.Xreg == 2) {
        var address = this.Yreg;
        var char = this.readMemValue(address);
        var output = "";
        while(address < 256 &&  char != 0) {
          output += String.fromCharCode(char);
          address++;
          char = this.readMemValue(address);
        }
        _StdOut.putText(output);
      } else {
        this.abort("Invalid Sys Call, Aborting.");
      }
    }
  }
}
