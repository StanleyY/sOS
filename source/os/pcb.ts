///<reference path="../globals.ts" />

module TSOS {
  export class PCB {
    limitReg: number;
    time: number = 0;
    waitingTime: number = 0;
    constructor(public pid: number,
                public baseReg: number,
                public status: string = "Resident",
                public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0) {
      this.limitReg = this.baseReg + 256;
    }

    public getPID(): number {
      return this.pid;
    }

    public setStatus(status): void {
      this.status = status;
    }
  }
}
