///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(pid, baseReg, status, PC, Acc, Xreg, Yreg, Zflag) {
            if (status === void 0) { status = "Resident"; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            this.pid = pid;
            this.baseReg = baseReg;
            this.status = status;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.limitReg = this.baseReg + 256;
        }
        PCB.prototype.getPID = function () {
            return this.pid;
        };
        PCB.prototype.setStatus = function (status) {
            this.status = status;
        };
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
