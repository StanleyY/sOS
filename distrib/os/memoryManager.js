///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            // Fill memory with 256 locations.
            this.memory = [];
            for (var i = 0; i < 256; i++) {
                this.memory.push("00");
            }
            this.updateDisplay();
        }
        // bytes are the bytes to write. Index is in hex
        MemoryManager.prototype.write = function (bytes, index) {
            index = parseInt(index, 16); // Convert hex to decimal.
            for (var i = 0; i < bytes.length; i = i + 2) {
                this.memory[index] = bytes.substring(i, i + 2);
                index++;
            }
            this.updateDisplay();
        };
        MemoryManager.prototype.updateDisplay = function () {
            _MemoryDisplay.value = this.memory.join(" ");
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
