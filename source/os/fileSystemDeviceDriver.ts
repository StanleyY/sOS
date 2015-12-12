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
      sessionStorage.setItem("000", "1000" + this.getPaddedStr(this.convertStrToASCII("MBR")));
      this.isFormatted = true;
      this.updateDisplay();
      return true;
    }

    public listFiles() {
      var filenames = [];
      var track = 0;
      for (var sector = 0; sector < 8; sector++) {
        for (var block = 0; block < 8; block++) {
          if (track == 0 && block == 0 && block == 0) block++; // Skip MBR
          var data = sessionStorage.getItem("" + track + sector + block);
          if (data[0] == '1') {
            filenames.push(this.convertASCIItoStr(data.substring(4)));
          }
        }
      }
      _StdOut.putText(filenames.join(" "));
    }

    private generalFilenameChecks(name) {
      if (!this.isFormatted) {
        _StdOut.putText("Disk is not formatted. ");
        return false;
      }
      if (name.length > 120) {
        _StdOut.putText("Filename too long, filenames may only be 62 characters long. ");
        return false;
      }
      return true;
    }

    public createFile(name) {
      name = this.convertStrToASCII(name);
      if (!this.generalFilenameChecks(name)) {
        return false;
      }
      if (this.filenameLookup(name) != "000") {
        _StdOut.putText("Filename already exists. ");
        return false;
      }

      var id = this.findEmptyDirBlock();
      if (id == "000") {
        _StdOut.putText("No Available Directory Space. ");
        return false;
      }

      name = this.getPaddedStr(name);
      this.writeBlock(id, '000', name);
      return true;
    }

    public readFile(name) {
      var data = this.readFileData(name);
      if (data) {
        return this.convertASCIItoStr(data);
      }
      return "";
    }

    public readFileData(name) {
      name = this.convertStrToASCII(name);
      if (!this.generalFilenameChecks(name)) {
        return null;
      }
      var current_id = this.filenameLookup(name);
      if (current_id == "000") {
        _StdOut.putText("Filename does not exists.");
        return null;
      }
      current_id = sessionStorage.getItem(current_id).substring(1, 4);

      return this.readBlockChain(current_id);
    }

    public writeFile(name, data) {
      name = this.convertStrToASCII(name);
      if (!this.generalFilenameChecks(name)) {
        return false;
      }
      var current_id = this.filenameLookup(name);
      if (current_id == "000") {
        _StdOut.putText("Filename does not exists.");
        return false;
      }

      // Delete the old file.
      this.deleteBlockChain(sessionStorage.getItem(current_id).substring(1, 4));

      data = this.convertStrToASCII(data);
      while(data.length > 0) {
        var next_id = this.findEmptyDataBlock();
        if (next_id == "000") {
          _StdOut.putText("Not enough disk space for this file.");
          return false;
        }
        this.writeBlock(next_id, "000", this.getPaddedStr(data.substring(0, 124)));
        data = data.substring(124);
        this.changeNextBlock(current_id, next_id);
        current_id = next_id;
      }
      this.updateDisplay();
      return true;
    }

    public deleteFile(name) {
      name = this.convertStrToASCII(name);
      if (!this.generalFilenameChecks(name)) {
        return false;
      }
      var current_id = this.filenameLookup(name);
      if (current_id == "000") {
        _StdOut.putText("Filename does not exists.");
        return false;
      }
      this.deleteBlockChain(current_id);
      this.updateDisplay();
      return true;
    }

    public deleteBlockChain(id) {
      while(id != "000") {
        var next_id = sessionStorage.getItem(id).substring(1, 4);
        this.setBlockAvailable(id);
        id = next_id;
      }
    }

    public readBlockChain(id) {
      var output = "";
      while(id != "000") {
        var data = sessionStorage.getItem(id);
        var next_id = data.substring(1, 4);
        output += data.substring(4);
        id = next_id;
      }
      return output;
    }

    private filenameLookup(name) {
      var track = 0;
      for (var sector = 0; sector < 8; sector++) {
        for (var block = 0; block < 8; block++) {
          if (track == 0 && block == 0 && block == 0) block++; // Skip MBR
          var id = "" + track + sector + block;
          var data = sessionStorage.getItem(id);
          if (data[0] == '1') {
            data = data.substring(4);
            if (data.indexOf('00') == -1) {
              var data_name = data;
            } else {
              var data_name = data.substring(0, data.indexOf('00'));
            }
            if (data_name == name) {
              return id;
            }
          }
        }
      }
      return "000";
    }

    private findEmptyDirBlock() {
      var track = 0;
      for (var sector = 0; sector < 8; sector++) {
        for (var block = 0; block < 8; block++) {
          if (track == 0 && block == 0 && block == 0) block++; // Skip MBR
          var id = "" + track + sector + block;
          if(sessionStorage.getItem(id)[0] == "0"){
            return id;
          }
        }
      }
      return "000";
    }

    private findEmptyDataBlock() {
      for (var track = 1; track < 4; track++) {
        for (var sector = 0; sector < 8; sector++) {
          for (var block = 0; block < 8; block++) {
            var id = "" + track + sector + block;
            if (sessionStorage.getItem(id)[0] == "0") {
              return id;
            }
          }
        }
      }
      return "000";
    }

    private writeBlock(id, next, data) {
      sessionStorage.setItem(id, '1' + next + data);
      this.updateDisplay();
    }

    private changeNextBlock(old_id, next_id) {
      sessionStorage.setItem(old_id, "1" + next_id + sessionStorage.getItem(old_id).substring(4));
    }

    private setBlockAvailable(id) {
      sessionStorage.setItem(id, "0" + sessionStorage.getItem(id).substring(1));
    }

    public updateDisplay() {
      _HardDriveDisplay.innerHTML = "<tr><td>T:S:B</td><td>Active</td><td>Next Block</td><td>Data</td></tr>"; // Clear the table
      for (var track = 0; track < 4; track++) {
        for (var sector = 0; sector < 8; sector++) {
          for (var block = 0; block < 8; block++) {
            var id = "" + track + sector + block;
            var data = sessionStorage.getItem(id);
            var row = <HTMLTableRowElement> _HardDriveDisplay.insertRow();
            if (track == 0 && sector == 7 && block == 7) row.className = 'endOfFileNames';
            var cell = row.insertCell();
            cell.innerHTML = id.split('').join(':');
            cell = row.insertCell();
            cell.innerHTML = data[0];
            cell = row.insertCell();
            cell.innerHTML = data.substring(1, 4);
            cell = row.insertCell();
            cell.innerHTML = data.substring(4);
          }
        }
      }
    }

    public convertStrToASCII(value) {
      return value.split('').map(function(c){
        return Utils.intToHex(c.charCodeAt(0));
      }).join('');
    }

    public convertASCIItoStr(value) {
      if (!value || value.length < 1) return "";
      return value.match(/.{1,2}/g).map(function(char){
        return String.fromCharCode(Utils.parseHex(char));
      }).join('');
    }

    public getPaddedStr(str) {
      return str + Array(125 - str.length).join("0");
    }
  }
}
