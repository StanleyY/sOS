///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.updateDisplay();
        }
        // bytes are the bytes to write. Index is in dec
        MemoryManager.prototype.write = function (bytes, index) {
            if (index < 256 && index > -1) {
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
            if (index < 256 && index > -1) {
                return _Memory.memory[index];
            }
            else {
                _CPU.illegalMemAccess();
            }
        };
        MemoryManager.prototype.increment = function (index) {
            if (index < 256 && index > -1) {
                var temp = TSOS.Utils.intToHex((TSOS.Utils.parseHex(_Memory.memory[index]) + 1));
                _Memory.memory[index] = temp;
            }
            else {
                _CPU.illegalMemAccess();
            }
            this.updateDisplay();
        };
        MemoryManager.prototype.updateDisplay = function () {
            _MemoryDisplay.value = _Memory.memory.join(" ");
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
