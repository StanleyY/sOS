///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.updateDisplay();
        }
        // bytes are the bytes to write. Index is in dec
        MemoryManager.prototype.write = function (bytes, index) {
            for (var i = 0; i < bytes.length; i = i + 2) {
                _Memory.memory[index] = bytes.substring(i, i + 2);
                index++;
            }
            this.updateDisplay();
        };
        MemoryManager.prototype.fetchByHex = function (hexIndex) {
            return this.fetch(parseInt(hexIndex, 16));
        };
        MemoryManager.prototype.fetch = function (index) {
            return _Memory.memory[index];
        };
        MemoryManager.prototype.updateDisplay = function () {
            _MemoryDisplay.value = _Memory.memory.join(" ");
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
