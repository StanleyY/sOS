var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler() {
            this.quantum = 6;
            this.currentQuantum = 1;
            this.readyQueue = [];
            this.residentQueue = [];
        }
        Scheduler.prototype.loadJob = function (pcb) {
            this.residentQueue.push(pcb);
        };
        Scheduler.prototype.runJob = function (pid) {
            var pids = this.residentQueue.map(function (pcb) { return pcb.pid; });
            if (pids.indexOf(pid) > -1) {
                var pcb = this.residentQueue.splice(pids.indexOf(pid), 1)[0];
                this.readyQueue.push(pcb);
                return true;
            }
            else {
                return false;
            }
        };
        Scheduler.prototype.schedule = function () {
            if (this.readyQueue.length > 0) {
                if (!_CPU.isExecuting) {
                    console.log("loaded program");
                    _CPU.loadPCB(this.readyQueue[0]);
                    _CPU.isExecuting = true;
                }
                _CPU.cycle();
                if (_CPU.IR == "00") {
                    var pcb = this.readyQueue.shift(); // Remove the PCB that was just used.
                    _MMU.availableParitions.push(pcb.baseReg / 256); // Let the MMU know that this partition is now available.
                    TSOS.Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
                }
            }
            else {
                // isExecuting should be false already.
                _CPU.isExecuting = false;
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
