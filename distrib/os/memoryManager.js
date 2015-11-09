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
        MemoryManager.prototype.loadProgram = function (bytes) {
            if (this.availableParitions.length < 1) {
                return -1;
            }
            this.write(bytes, this.availableParitions.shift() * 256);
            console.log(this.availableParitions.length);
            _PID++;
            return _PID - 1;
        };
        // bytes are the bytes to write. Index is in dec
        MemoryManager.prototype.write = function (bytes, index) {
            if (index < 768 && index > -1) {
                for (var i = 0; i < bytes.length; i = i + 2) {
                    _Memory.memory[index] = bytes.substring(i, i + 2);
                    index++;
                }
                this.updateDisplay();
            }
            else {
                _CPU.illegalMemAccess();
            }
        };
        MemoryManager.prototype.fetchByHex = function (hexIndex) {
            return this.fetch(parseInt(hexIndex, 16));
        };
        MemoryManager.prototype.fetch = function (index) {
            if (index < 768 && index > -1) {
                return _Memory.memory[index];
            }
            else {
                _CPU.illegalMemAccess();
            }
        };
        MemoryManager.prototype.increment = function (index) {
            if (index < 768 && index > -1) {
                var temp = TSOS.Utils.intToHex((TSOS.Utils.parseHex(_Memory.memory[index]) + 1));
                _Memory.memory[index] = temp;
            }
            else {
                _CPU.illegalMemAccess();
            }
            this.updateDisplay();
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
