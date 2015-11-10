///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.availableParitions = [0, 1, 2];
            this.updateDisplay();
        }
        MemoryManager.prototype.clearMemory = function () {
            this.availableParitions = [0, 1, 2];
            _Memory.memory = [];
            for (var i = 0; i < 768; i++) {
                _Memory.memory.push("00");
            }
        };
        MemoryManager.prototype.getMemoryAddress = function (base, index) {
            if (index < 256 && index > -1) {
                return base + index;
            }
            else {
                _CPU.illegalMemAccess();
                return -1;
            }
        };
        // Loads the program into memory and creates a pcb.
        // Returns the PCB or null if no partitions available.
        MemoryManager.prototype.loadProgram = function (bytes) {
            if (this.availableParitions.length < 1) {
                return null;
            }
            var base = this.availableParitions.shift() * 256;
            this.write(bytes, base, 0);
            var pcb = new TSOS.PCB(_PID, base);
            _PID++;
            TSOS.Control.hostLog("Allocated Memory Partition: " + base / 256, "Memory Manager");
            return pcb;
        };
        // bytes are the bytes to write. Index is in decimal
        MemoryManager.prototype.write = function (bytes, base, index) {
            index = this.getMemoryAddress(base, index);
            if (index > -1) {
                for (var i = 0; i < bytes.length; i = i + 2) {
                    _Memory.memory[index] = bytes.substring(i, i + 2);
                    index++;
                }
            }
        };
        MemoryManager.prototype.fetchByHex = function (base, hexIndex) {
            return this.fetch(base, parseInt(hexIndex, 16));
        };
        MemoryManager.prototype.fetch = function (base, index) {
            index = this.getMemoryAddress(base, index);
            if (index > -1) {
                return _Memory.memory[index];
            }
        };
        MemoryManager.prototype.increment = function (base, index) {
            index = this.getMemoryAddress(base, index);
            if (index > -1) {
                var temp = TSOS.Utils.intToHex((TSOS.Utils.parseHex(_Memory.memory[index]) + 1));
                _Memory.memory[index] = temp;
            }
        };
        MemoryManager.prototype.updateDisplay = function () {
            _MemoryDisplay.innerHTML = ""; // Clear the table
            for (var i = 0; i < _Memory.memory.length; i += 8) {
                var row = _MemoryDisplay.insertRow(); // insert a new row at 0
                var cell = row.insertCell();
                cell.className = "titleCell";
                cell.innerHTML = "0x" + TSOS.Utils.intToHex(i);
                for (var j = i; j < i + 8; j++) {
                    cell = row.insertCell();
                    cell.innerHTML = _Memory.memory[j];
                }
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
