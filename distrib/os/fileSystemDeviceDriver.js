///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var FileSystemDeviceDriver = (function (_super) {
        __extends(FileSystemDeviceDriver, _super);
        function FileSystemDeviceDriver() {
            // Override the base method pointers.
            _super.call(this, this.krnFileSystemDriverEntry, null);
            this.isFormatted = false;
        }
        FileSystemDeviceDriver.prototype.krnFileSystemDriverEntry = function () {
            this.status = "loaded";
        };
        FileSystemDeviceDriver.prototype.formatDisk = function () {
            var empty = Array(129).join("0");
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                        sessionStorage.setItem("" + track + sector + block, empty);
                    }
                }
            }
            sessionStorage.setItem("000", this.getPaddedStr("1000" + this.convertStrToASCII("MBR")));
            this.isFormatted = true;
            this.updateDisplay();
            return true;
        };
        FileSystemDeviceDriver.prototype.createFile = function (name) {
            console.log(name);
            if (!this.isFormatted) {
                _StdOut.putText("Disk is not formatted. ");
                return false;
            }
            name = this.convertStrToASCII(name);
            if (name.length > 120) {
                _StdOut.putText("Filename too long, filenames may only be 62 characters long. ");
                return false;
            }
            if (this.filenameLookup(name) != "000") {
                _StdOut.putText("Filename already exists. ");
                return false;
            }
            var id = this.findDirBlock();
            if (id == "000") {
                _StdOut.putText("No Available Directory Space. ");
                return false;
            }
            name = this.getPaddedStr(name);
            this.writeBlock(id, '000', name);
            return true;
        };
        FileSystemDeviceDriver.prototype.filenameLookup = function (name) {
            var track = 0;
            for (var sector = 0; sector < 8; sector++) {
                for (var block = 0; block < 8; block++) {
                    var id = "" + track + sector + block;
                    var data = sessionStorage.getItem(id);
                    if (data[0] == '1' && data.substring(4).indexOf(name) == 0) {
                        return id;
                    }
                }
            }
            return "000";
        };
        FileSystemDeviceDriver.prototype.findDirBlock = function () {
            var track = 0;
            for (var sector = 0; sector < 8; sector++) {
                for (var block = 0; block < 8; block++) {
                    var id = "" + track + sector + block;
                    if (sessionStorage.getItem(id)[0] == "0") {
                        return id;
                    }
                }
            }
            return "000";
        };
        FileSystemDeviceDriver.prototype.writeBlock = function (id, next, data) {
            sessionStorage.setItem(id, '1' + next + data);
            this.updateDisplay();
        };
        FileSystemDeviceDriver.prototype.updateDisplay = function () {
            _HardDriveDisplay.innerHTML = "<tr><td>T:S:B</td><td>Active</td><td>Next Block</td><td>Data</td></tr>"; // Clear the table
            for (var track = 0; track < 4; track++) {
                for (var sector = 0; sector < 8; sector++) {
                    for (var block = 0; block < 8; block++) {
                        var id = "" + track + sector + block;
                        var data = sessionStorage.getItem(id);
                        var row = _HardDriveDisplay.insertRow();
                        if (track == 0 && sector == 7 && block == 7)
                            row.className = 'endOfFileNames';
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
        };
        FileSystemDeviceDriver.prototype.convertStrToASCII = function (value) {
            return value.split('').map(function (c) { return c.charCodeAt(0); }).join('');
        };
        FileSystemDeviceDriver.prototype.getPaddedStr = function (str) {
            return str + Array(124 - str.length).join("0");
        };
        return FileSystemDeviceDriver;
    })(TSOS.DeviceDriver);
    TSOS.FileSystemDeviceDriver = FileSystemDeviceDriver;
})(TSOS || (TSOS = {}));
