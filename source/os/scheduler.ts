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
        this.readyQueue.push(pcb);
        return true;
      } else {
        return false;
      }
    }

    public runAll(): void {
      this.readyQueue = this.readyQueue.concat(this.residentQueue);
      this.residentQueue = [];
    }

    public schedule() {
      if (this.readyQueue.length > 0) {
        if (!_CPU.isExecuting) {
          console.log("loaded program");
          _CPU.loadPCB(this.readyQueue[0]);
          _CPU.isExecuting = true;
        }
        _CPU.cycle();
        if (_CPU.IR == "00") {  // The CPU just finished a process
          var pcb = this.readyQueue.shift(); // Remove the PCB that was just used.
          _MMU.availableParitions.push(pcb.baseReg / 256); // Let the MMU know that this partition is now available.
          Control.hostLog("Freed Memory Partition: " + pcb.baseReg / 256, "scheduler");
        } else {
          // Load PCB with the new commands
          this.readyQueue[0].PC =_CPU.PC;
          this.readyQueue[0].Acc =_CPU.Acc;
          this.readyQueue[0].Xreg =_CPU.Xreg;
          this.readyQueue[0].Yreg =_CPU.Yreg;
          this.readyQueue[0].Zflag =_CPU.Zflag;
        }
      } else {
        // isExecuting should be false already.
        _CPU.isExecuting = false;
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
      table.innerHTML = "<tr><td>PID</td><td>PC</td><td>ACC</td><td>X</td><td>Y</td><td>Z</td><td>Base</td></tr>";
      for (var i = 0; i < this.readyQueue.length; i++) {
        var row = <HTMLTableRowElement> table.insertRow();  // insert a new row at 0
        row.insertCell().innerHTML = "" + this.readyQueue[i].pid;
        row.insertCell().innerHTML = "" + this.readyQueue[i].PC;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Acc;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Xreg;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Yreg;
        row.insertCell().innerHTML = "" + this.readyQueue[i].Zflag;
        row.insertCell().innerHTML = "0x" + Utils.intToHex(this.readyQueue[i].baseReg);
      }
    }
  }
}
