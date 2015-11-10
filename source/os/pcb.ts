///<reference path="../globals.ts" />

module TSOS {
  export class PCB {
    limitReg: number;
    constructor(public pid: number,
                public base: number,
                public status: string = "Resident",
                public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0) {
      this.limitReg = base + 256;
    }

    public getPID(): number {
      return this.pid;
    }

    public setStatus(status): void {
      this.status = status;
    }

    public static updatePcbDisplay() {
      if (_PcbList.length > 0) {
        _PcbListDisplay.value = "";
        for (var i = 0; i < _PcbList.length; i++) {
          _PcbListDisplay.value += "PID: " + _PcbList[i].pid + ", status: " + _PcbList[i].status + "\n";
        }
      } else {
        _PcbListDisplay.value = "No active processes";
      }
    }
  }
}
