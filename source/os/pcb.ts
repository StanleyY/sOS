///<reference path="../globals.ts" />

module TSOS {
  export class PCB {

    // TODO project 3, add useful functions.
    // Turn status into an Enum.
    constructor(public pid: number,
                public status: string = "Ready",
                public PC: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0) {
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
