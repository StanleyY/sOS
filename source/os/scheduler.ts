module TSOS {

  export class Scheduler {
    quantum: number;
    readyQueue: PCB[];
    residentQueue: PCB[];

    constructor() {
      this.quantum = 6;
      this.readyQueue = [];
      this.residentQueue = [];
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
        //_CPU.isExecuting = true;
        //console.log("scheduling");
      }
    }
  }
}
