var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            // Fill memory with 256 locations.
            this.memory = [];
            for (var i = 0; i < 256; i++) {
                this.memory.push("00");
            }
        }
        MemoryManager.prototype.write = function (bytes, index) {
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
