///<reference path="../globals.ts" />

module TSOS {
  export class PCB {
    limitReg: number;
    filename: string;
    time: number = 0;
    waitingTime: number = 0;
    constructor(public pid: number,
                public baseReg: number,
                public location: string,
                public status: string = "Resident",
                public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0) {
      this.limitReg = this.baseReg + 256;
      this.filename = pid + "@sys";
    }

    public getPID(): number {
      return this.pid;
    }

    public setStatus(status): void {
      this.status = status;
    }

    public setFilename(name): void {
      this.filename = name;
    }

    public updateBaseReg(base) {
      this.baseReg = base;
      this.limitReg = base + 256;
    }
  }
}
