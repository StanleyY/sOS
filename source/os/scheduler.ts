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
        }
      } else {
        // isExecuting should be false already.
        _CPU.isExecuting = false;
      }
    }
  }
}
