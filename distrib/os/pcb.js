///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        // TODO project 3, add useful functions.
        // Turn status into an Enum.
        function PCB(pid, status, PC, Xreg, Yreg, Zflag) {
            if (status === void 0) { status = "Ready"; }
            if (PC === void 0) { PC = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            this.pid = pid;
            this.status = status;
            this.PC = PC;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        PCB.updatePcbDisplay = function () {
            if (_PcbList.length > 0) {
                _PcbListDisplay.value = "";
                for (var i = 0; i < _PcbList.length; i++) {
                    _PcbListDisplay.value += "PID: " + _PcbList[i].pid + ", status: " + _PcbList[i].status + "\n";
                }
            }
            else {
                _PcbListDisplay.value = "No active processes";
            }
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
