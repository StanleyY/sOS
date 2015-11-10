module TSOS {

  export class Scheduler {
    quantum: number = 6;
    currentQuantum: number = 1;
    readyQueue: PCB[] = [];
    residentQueue: PCB[] = [];

    constructor() {
    }

    public loadJob(pcb): void {
      this.residentQueue.push(pcb);
    }

    public runJob(pid): boolean {
      var pids = this.residentQueue.map(function(pcb){return pcb.pid;});
      if (pids.indexOf(pid) > -1) {
        var pcb = this.residentQueue.splice(pids.indexOf(pid), 1)[0];
        pcb.setStatus("Waiting");
        this.readyQueue.push(pcb);
        return true;
      } else {
        return false;
      }
    }

    public runAll(): void {
      this.readyQueue = this.readyQueue.concat(this.residentQueue);
      this.readyQueue.forEach(function(pcb){pcb.setStatus("Waiting")});
      this.residentQueue = [];
    }

    public kill(pid): number {
      var pids = this.residentQueue.map(function(pcb){return pcb.pid;});
      var pcb = null;
      if (pids.indexOf(pid) > -1) {
        pcb = this.residentQueue.splice(pids.indexOf(pid), 1)[0];
      } else {
        pids = this.readyQueue.map(function(pcb){return pcb.pid;});
        if (pids.indexOf(pid) > -1) {
          if (pids.indexOf(pid) == 0) {
            _CPU.isExecuting = false;
          }
          pcb = this.readyQueue.splice(pids.indexOf(pid), 1)[0];
        } else {
          // PID not found.
          return -1;
        }
      }
      // Let the MMU know that this partition is now available.
      _MMU.availableParitions.push(pcb.baseReg / 256);
      Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
      return pcb.pid;
    }

    public schedule(): void {
      if (this.readyQueue.length > 0) {
        if (this.currentQuantum >= this.quantum) {
          this.currentQuantum = 0;
          // Only bother rotating the queue if there is more than one program
          if (this.readyQueue.length > 1) {
            this.readyQueue[0].setStatus("Waiting");
            var pcb = this.readyQueue.shift();
            this.readyQueue.push(pcb);
            _CPU.isExecuting = false;
            Control.hostLog("Quantum Exceeded, rotated programs", "scheduler");
          }
        }
        if (!_CPU.isExecuting) {
          Control.hostLog("Loaded PID: " + this.readyQueue[0].pid, "scheduler");
          this.readyQueue[0].setStatus("Running");
          _CPU.loadPCB(this.readyQueue[0]);
          _CPU.isExecuting = true;
        }
        _CPU.cycle();
        this.updatePCBTime();
        if (_CPU.IR == "00") {  // The CPU just finished a process
          var pcb = this.readyQueue.shift(); // Remove the PCB that was just used.
          _MMU.availableParitions.push(pcb.baseReg / 256); // Let the MMU know that this partition is now available.
          Control.hostLog("PID: " + pcb.pid + " turnaround time: " + pcb.time + ", waiting time: " + pcb.waitingTime, "scheduler");
          Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
          this.currentQuantum = -1;
        } else {
          // Load PCB with the new commands
          this.readyQueue[0].PC =_CPU.PC;
          this.readyQueue[0].Acc =_CPU.Acc;
          this.readyQueue[0].Xreg =_CPU.Xreg;
          this.readyQueue[0].Yreg =_CPU.Yreg;
          this.readyQueue[0].Zflag =_CPU.Zflag;
        }
        this.currentQuantum++;
      } else {
        this.currentQuantum = 0;
        // isExecuting should be false already.
        _CPU.isExecuting = false;
      }
    }

    public updatePCBTime() {
      this.readyQueue[0].time++;
      for(var i = 1; i < this.readyQueue.length; i++) {
        this.readyQueue[i].time++;
        this.readyQueue[i].waitingTime++;
      }
    }

    public updateDisplay() {
      // Resident Queue
      var table = <HTMLTableElement> document.getElementById('residentQueueTable');
      table.innerHTML = "<tr><td>PID</td><td>PC</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Base</td></tr>";
      for (var i = 0; i < this.residentQueue.length; i++) {
        var row = <HTMLTableRowElement> table.insertRow();  // insert a new row at 0
        row.insertCell().innerHTML = "" + this.residentQueue[i].pid;
        row.insertCell().innerHTML = "" + this.residentQueue[i].PC;
        row.insertCell().innerHTML = "" + this.residentQueue[i].Acc;
        row.insertCell().innerHTML = "" + this.residentQueue[i].Xreg;
        row.insertCell().innerHTML = "" + this.residentQueue[i].Yreg;
        row.insertCell().innerHTML = "" + this.residentQueue[i].Zflag;
        row.insertCell().innerHTML = "0x" + Utils.intToHex(this.residentQueue[i].baseReg);
      }
      // Ready Queue
      table = <HTMLTableElement> document.getElementById('readyQueueTable');
      table.innerHTML = "<tr><td class='statusCell'>Status</td><td>PID</td><td>PC</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Base</td></tr>";
      for (var i = 0; i < this.readyQueue.length; i++) {
        var row = <HTMLTableRowElement> table.insertRow();  // insert a new row at 0
        var statusCell = row.insertCell();
        statusCell.innerHTML = this.readyQueue[i].status;
        statusCell.className = "statusCell";
        row.insertCell().innerHTML = "" + this.readyQueue[i].pid;
        row.insertCell().innerHTML = "" + this.readyQueue[i].PC;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Acc;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Xreg;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Yreg;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Zflag;
        row.insertCell().innerHTML = "0x" + Utils.intToHex(this.readyQueue[i].baseReg);
      }
    }

    public ps() {
      var pids = this.residentQueue.concat(this.readyQueue).map(function(pcb){return pcb.pid;});
      if (pids.length > 0) {
        _Console.putText("Active PIDs: " + pids.join(","));
      } else {
        _Console.putText("No active processes.");
      }
    }
  }
}
