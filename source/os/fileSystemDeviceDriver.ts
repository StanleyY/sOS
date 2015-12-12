///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

module TSOS {

  // Extends DeviceDriver
  export class FileSystemDeviceDriver extends DeviceDriver {

    constructor() {
      // Override the base method pointers.
      super(this.krnFileSystemDriverEntry, null);
    }

    public krnFileSystemDriverEntry() {
      this.status = "loaded";
    }
  }
}
