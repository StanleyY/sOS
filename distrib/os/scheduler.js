var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler() {
            this.quantum = 6;
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
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
