///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

module TSOS {

  // Extends DeviceDriver
  export class FileSystemDeviceDriver extends DeviceDriver {
    isFormatted: boolean;
    constructor() {
      // Override the base method pointers.
      super(this.krnFileSystemDriverEntry, null);
      this.isFormatted = false;
    }

    public krnFileSystemDriverEntry() {
      this.status = "loaded";
    }

    public formatDisk() {
      var empty = Array(129).join("0");
      for (var track = 0; track < 4; track++) {
        for (var sector = 0; sector < 8; sector++) {
          for (var block = 0; block < 8; block++) {
            sessionStorage.setItem("" + track + sector + block, empty);
          }
        }
      }
      sessionStorage.setItem("000", "1000" + this.convertStrToASCII("MBR") + Array(119).join("0"));
      this.isFormatted = true;
      this.updateDisplay();
      return true;
    }

    public updateDisplay() {
      _HardDriveDisplay.innerHTML = "<tr><td>T:S:B</td><td>Active</td><td>Next Block</td><td>Data</td></tr>"; // Clear the table
      for (var track = 0; track < 4; track++) {
        for (var sector = 0; sector < 8; sector++) {
          for (var block = 0; block < 8; block++) {
            var id = "" + track + sector + block;
            var data = sessionStorage.getItem(id);
            var row = <HTMLTableRowElement> _HardDriveDisplay.insertRow();
            var cell = row.insertCell();
            cell.innerHTML = id.split('').join(':');
            cell = row.insertCell();
            cell.innerHTML = data[0];
            cell = row.insertCell();
            cell.innerHTML = data.slice(1, 4);
            cell = row.insertCell();
            cell.innerHTML = data.slice(4);
          }
        }
      }
    }

    public convertStrToASCII(value) {
      return value.split('').map(function(c){return c.charCodeAt(0);}).join('');
    }
  }
}
