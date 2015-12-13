var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler() {
            this.mode = 'rr';
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
                pcb.setStatus("Waiting");
                this.readyQueue.push(pcb);
                return true;
            }
            else {
                return false;
            }
        };
        Scheduler.prototype.runAll = function () {
            this.readyQueue = this.readyQueue.concat(this.residentQueue);
            this.readyQueue.forEach(function (pcb) { pcb.setStatus("Waiting"); });
            this.residentQueue = [];
        };
        Scheduler.prototype.kill = function (pid) {
            var pids = this.residentQueue.map(function (pcb) { return pcb.pid; });
            var pcb = null;
            if (pids.indexOf(pid) > -1) {
                pcb = this.residentQueue.splice(pids.indexOf(pid), 1)[0];
            }
            else {
                pids = this.readyQueue.map(function (pcb) { return pcb.pid; });
                if (pids.indexOf(pid) > -1) {
                    if (pids.indexOf(pid) == 0) {
                        _CPU.isExecuting = false;
                    }
                    pcb = this.readyQueue.splice(pids.indexOf(pid), 1)[0];
                }
                else {
                    // PID not found.
                    return -1;
                }
            }
            if (pcb.location == "Memory") {
                // Let the MMU know that this partition is now available.
                _MMU.availableParitions.push(pcb.baseReg / 256);
                TSOS.Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
            }
            else {
                _krnFileSystemDriver.deleteFile(pcb.filename);
            }
            return pcb.pid;
        };
        Scheduler.prototype.schedule = function () {
            if (this.mode == 'rr') {
                this.roundRobin();
            }
            else if (this.mode == 'fcfs') {
                this.firstComeFirstServe();
            }
            else {
            }
        };
        Scheduler.prototype.roundRobin = function () {
            if (this.readyQueue.length > 0) {
                if (this.currentQuantum >= this.quantum) {
                    this.currentQuantum = 0;
                    // Only bother rotating the queue if there is more than one program
                    if (this.readyQueue.length > 1) {
                        this.readyQueue[0].setStatus("Waiting");
                        var pcb = this.readyQueue.shift();
                        this.readyQueue.push(pcb);
                        _CPU.isExecuting = false;
                        TSOS.Control.hostLog("Quantum Exceeded, rotated programs", "scheduler");
                    }
                }
                this.runCPU();
                if (_CPU.IR == "00") {
                    this.freePCB();
                    this.currentQuantum = -1;
                }
                else {
                    this.updatePCB();
                }
                this.currentQuantum++;
            }
            else {
                this.currentQuantum = 0;
                // isExecuting should be false already.
                _CPU.isExecuting = false;
            }
        };
        Scheduler.prototype.firstComeFirstServe = function () {
            if (this.readyQueue.length > 0) {
                this.runCPU();
                if (_CPU.IR == "00") {
                    this.freePCB();
                    this.currentQuantum = -1;
                }
                else {
                    this.updatePCB();
                }
            }
            else {
                // isExecuting should be false already.
                _CPU.isExecuting = false;
            }
        };
        Scheduler.prototype.runCPU = function () {
            if (!_CPU.isExecuting) {
                TSOS.Control.hostLog("Loaded PID: " + this.readyQueue[0].pid, "scheduler");
                var pcb = this.readyQueue[0];
                pcb.setStatus("Running");
                if (pcb.location != 'Memory') {
                    this.runSwapper();
                }
                _CPU.loadPCB(this.readyQueue[0]);
                _CPU.isExecuting = true;
            }
            _CPU.cycle();
            this.updatePCBTime();
        };
        Scheduler.prototype.runSwapper = function () {
            var pcb = this.readyQueue[0];
            var bytes = _krnFileSystemDriver.readFileData(pcb.filename);
            _krnFileSystemDriver.deleteFile(pcb.filename);
            var base = _MMU.loadProgram(bytes);
            if (base != -1) {
                pcb.updateBaseReg(base);
            }
            else {
                var i = this.readyQueue.length - 1;
                while (this.readyQueue[i].location != 'Memory') {
                    // Search for most recently used process that is in memory.
                    // This step shouldn't really be necessary except for when step
                    // mode is enabled.
                    i--;
                }
                var swappingPCB = this.readyQueue[i];
                _Kernel.swapOut(swappingPCB);
                swappingPCB.location = 'Hard Drive';
                base = _MMU.loadProgram(bytes);
                pcb.updateBaseReg(base);
            }
            pcb.location = 'Memory';
        };
        Scheduler.prototype.updatePCB = function () {
            // Load PCB with the new commands
            this.readyQueue[0].PC = _CPU.PC;
            this.readyQueue[0].Acc = _CPU.Acc;
            this.readyQueue[0].Xreg = _CPU.Xreg;
            this.readyQueue[0].Yreg = _CPU.Yreg;
            this.readyQueue[0].Zflag = _CPU.Zflag;
        };
        Scheduler.prototype.freePCB = function () {
            var pcb = this.readyQueue.shift(); // Remove the PCB that was just used.
            _MMU.availableParitions.push(pcb.baseReg / 256); // Let the MMU know that this partition is now available.
            TSOS.Control.hostLog("PID: " + pcb.pid + " turnaround time: " + pcb.time + ", waiting time: " + pcb.waitingTime, "scheduler");
            TSOS.Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
        };
        Scheduler.prototype.updatePCBTime = function () {
            this.readyQueue[0].time++;
            for (var i = 1; i < this.readyQueue.length; i++) {
                this.readyQueue[i].time++;
                this.readyQueue[i].waitingTime++;
            }
        };
        Scheduler.prototype.updateDisplay = function () {
            // Resident Queue
            var table = document.getElementById('residentQueueTable');
            table.innerHTML = "<tr><td>PID</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Base</td><td>Location</td></tr>";
            for (var i = 0; i < this.residentQueue.length; i++) {
                var row = table.insertRow(); // insert a new row at 0
                row.insertCell().innerHTML = "" + this.residentQueue[i].pid;
                row.insertCell().innerHTML = "" + this.residentQueue[i].Acc;
                row.insertCell().innerHTML = "" + this.residentQueue[i].Xreg;
                row.insertCell().innerHTML = "" + this.residentQueue[i].Yreg;
                row.insertCell().innerHTML = "" + this.residentQueue[i].Zflag;
                row.insertCell().innerHTML = "0x" + TSOS.Utils.intToHex(this.residentQueue[i].baseReg);
                row.insertCell().innerHTML = this.residentQueue[i].location;
            }
            // Ready Queue
            table = document.getElementById('readyQueueTable');
            table.innerHTML = "<tr><td class='statusCell'>Status</td><td>PID</td><td>PC</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Base</td><td>Location</td></tr>";
            for (var i = 0; i < this.readyQueue.length; i++) {
                var row = table.insertRow(); // insert a new row at 0
                var statusCell = row.insertCell();
                statusCell.innerHTML = this.readyQueue[i].status;
                statusCell.className = "statusCell";
                row.insertCell().innerHTML = "" + this.readyQueue[i].pid;
                row.insertCell().innerHTML = "" + this.readyQueue[i].PC;
                row.insertCell().innerHTML = "" + this.readyQueue[i].Acc;
                row.insertCell().innerHTML = "" + this.readyQueue[i].Xreg;
                row.insertCell().innerHTML = "" + this.readyQueue[i].Yreg;
                row.insertCell().innerHTML = "" + this.readyQueue[i].Zflag;
                row.insertCell().innerHTML = "0x" + TSOS.Utils.intToHex(this.readyQueue[i].baseReg);
                row.insertCell().innerHTML = this.readyQueue[i].location;
            }
        };
        Scheduler.prototype.ps = function () {
            var pids = this.residentQueue.concat(this.readyQueue).map(function (pcb) { return pcb.pid; });
            if (pids.length > 0) {
                _Console.putText("Active PIDs: " + pids.join(","));
            }
            else {
                _Console.putText("No active processes.");
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
