///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            // Memory is currently 768 bytes.
            this.memory = [];
            for (var i = 0; i < 768; i++) {
                this.memory.push("00");
            }
        }
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
