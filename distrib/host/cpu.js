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
        Cpu.prototype.readNextTwoMemValues = function () {
            var temp = _MMU.fetch(this.PC);
            this.PC++;
            temp = _MMU.fetch(this.PC) + temp; // Big Endian
            this.PC++;
            return TSOS.Utils.parseHex(temp);
        };
        // Index is in decimal
        Cpu.prototype.readMemValue = function (index) {
            return TSOS.Utils.parseHex(_MMU.fetch(index));
        };
        Cpu.prototype.opCodeLookup = function (opCode) {
            if (opCode == "A9") {
                this.loadAcc();
            }
            else if (opCode == "AD") {
                this.loadAccFromMem();
            }
            else if (opCode == "8D") {
                this.storeAcc();
            }
            else if (opCode == "6D") {
                this.addAcc();
            }
            else if (opCode == "A2") {
                this.loadX();
            }
            else if (opCode == "AE") {
                this.loadXFromMem();
            }
            else if (opCode == "A0") {
                this.loadY();
            }
            else if (opCode == "AC") {
                this.loadYFromMem();
            }
            else if (opCode == "EA") {
            }
            else if (opCode == "EC") {
                this.compareX();
            }
            else if (opCode == "FF") {
                this.sysCall();
            }
            else if (opCode == "00") {
                this.init(); // Break
            }
            else {
                throw "ILLEGAL OPERATION";
            }
        };
        Cpu.prototype.loadAcc = function () {
            this.Acc = this.readNextMemValue();
        };
        Cpu.prototype.loadAccFromMem = function () {
            var memLocation = this.readNextTwoMemValues();
            this.Acc = this.readMemValue(memLocation);
        };
        Cpu.prototype.loadX = function () {
            this.Xreg = this.readNextMemValue();
        };
        Cpu.prototype.loadXFromMem = function () {
            var memLocation = this.readNextTwoMemValues();
            this.Xreg = this.readMemValue(memLocation);
        };
        Cpu.prototype.loadY = function () {
            this.Yreg = this.readNextMemValue();
        };
        Cpu.prototype.loadYFromMem = function () {
            var memLocation = this.readNextTwoMemValues();
            this.Yreg = this.readMemValue(memLocation);
        };
        Cpu.prototype.storeAcc = function () {
            var memLocation = this.readNextTwoMemValues();
            _MMU.write(TSOS.Utils.intToHex(this.Acc), memLocation);
        };
        Cpu.prototype.addAcc = function () {
            var memLocation = this.readNextTwoMemValues();
            this.Acc += this.readMemValue(memLocation);
        };
        Cpu.prototype.compareX = function () {
            var memLocation = this.readNextTwoMemValues();
            if (this.readMemValue(memLocation) == this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
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
