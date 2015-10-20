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
        MemoryManager.prototype.write = function (bytes, index) {
            console.log(this.memory);
        };
        MemoryManager.prototype.updateDisplay = function () {
            _MemoryDisplay.value = this.memory.join(" ");
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
