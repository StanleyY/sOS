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
        function Cpu(PC, IR, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = "00"; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.baseReg = 0;
            this.limitReg = 256;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = "00";
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.updateDisplay();
        };
        Cpu.prototype.updateDisplay = function () {
            var temp = "PC: " + this.PC + "\n" +
                "IR: 0x" + this.IR + "\n" +
                "Acc: " + this.Acc + "\n" +
                "X reg: " + this.Xreg + "\n" +
                "Y reg: " + this.Yreg + "\n" +
                "Z flag: " + this.Zflag;
            _CpuDisplay.value = temp;
        };
        Cpu.prototype.loadPCB = function (pcb) {
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
            this.baseReg = pcb.baseReg;
            this.limitReg = pcb.limitReg;
        };
        Cpu.prototype.illegalMemAccess = function () {
            this.abort("Out of bound memory access, Aborting.");
        };
        Cpu.prototype.abort = function (message) {
            _StdOut.putText(message);
            _Console.advanceLine();
            _StdOut.putText(">");
            this.init();
        };
        Cpu.prototype.cycle = function () {
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
            var temp = _MMU.fetch(this.baseReg, this.PC);
            this.PC++;
            return temp;
        };
        Cpu.prototype.readNextTwoMemValues = function () {
            var temp = _MMU.fetch(this.baseReg, this.PC);
            this.PC++;
            temp = _MMU.fetch(this.baseReg, this.PC) + temp; // Big Endian
            this.PC++;
            return TSOS.Utils.parseHex(temp);
        };
        // Index is in decimal
        Cpu.prototype.readMemValue = function (index) {
            return TSOS.Utils.parseHex(_MMU.fetch(this.baseReg, index));
        };
        Cpu.prototype.opCodeLookup = function (opCode) {
            this.IR = opCode;
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
            else if (opCode == "D0") {
                this.branch();
            }
            else if (opCode == "EE") {
                this.incrementByte();
            }
            else if (opCode == "FF") {
                this.sysCall();
            }
            else if (opCode == "00") {
                this.abort(""); // Break
            }
            else {
                this.abort("Unknown Operation, Aborting.");
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
            _MMU.write(TSOS.Utils.intToHex(this.Acc), this.baseReg, memLocation);
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
        Cpu.prototype.branch = function () {
            var n = this.readNextMemValue();
            if (this.Zflag == 0) {
                this.PC += n;
                this.PC = this.PC % 256; // For branches that wrap around
            }
        };
        Cpu.prototype.incrementByte = function () {
            var memLocation = this.readNextTwoMemValues();
            _MMU.increment(this.baseReg, memLocation);
        };
        Cpu.prototype.sysCall = function () {
            if (this.Xreg == 1) {
                _Console.putText("" + this.Yreg);
            }
            else if (this.Xreg == 2) {
                var address = this.Yreg;
                var char = this.readMemValue(address);
                var output = "";
                while (address < 256 && char != 0) {
                    output += String.fromCharCode(char);
                    address++;
                    char = this.readMemValue(address);
                }
                _StdOut.putText(output);
            }
            else {
                this.abort("Invalid Sys Call, Aborting.");
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
