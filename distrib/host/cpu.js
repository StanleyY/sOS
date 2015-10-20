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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.updateDisplay();
        };
        Cpu.prototype.updateDisplay = function () {
            var temp = "PC: " + this.PC + "\n" +
                "Acc: " + this.Acc + "\n" +
                "X reg: " + this.Xreg + "\n" +
                "Y reg: " + this.Yreg + "\n" +
                "Z flag: " + this.Zflag;
            _CpuDisplay.value = temp;
        };
        Cpu.prototype.cycle = function () {
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting) {
                _Kernel.krnTrace('CPU cycle');
                var opCode = this.readNextMemValueInHex();
                this.opCodeLookup(opCode);
                this.updateDisplay();
            }
        };
        Cpu.prototype.readNextMemValue = function () {
            return TSOS.Utils.parseHex(this.readNextMemValueInHex());
        };
        Cpu.prototype.readNextMemValueInHex = function () {
            var temp = _MMU.fetch(this.PC);
            this.PC++;
            return temp;
        };
        Cpu.prototype.opCodeLookup = function (opCode) {
            if (opCode == "A9") {
                this.loadAcc();
            }
            else if (opCode == "A2") {
                this.loadX();
            }
            else if (opCode == "A0") {
                this.loadY();
            }
            else if (opCode == "FF") {
                this.sysCall();
            }
            else if (opCode == "00") {
                this.isExecuting = false;
            }
            else {
                throw "ILLEGAL OPERATION";
            }
        };
        Cpu.prototype.loadAcc = function () {
            this.Acc = this.readNextMemValue();
        };
        Cpu.prototype.loadX = function () {
            this.Xreg = this.readNextMemValue();
        };
        Cpu.prototype.loadY = function () {
            this.Yreg = this.readNextMemValue();
        };
        Cpu.prototype.sysCall = function () {
            if (this.Xreg == 1) {
                _Console.putText("" + this.Yreg);
            }
            else if (this.Xreg == 2) {
            }
            else {
                throw "INVALID SYS CALL";
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
