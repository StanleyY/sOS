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
            sessionStorage.setItem("000", "1000" + this.getPaddedStr(this.convertStrToASCII("MBR")));
            this.isFormatted = true;
            this.updateDisplay();
            return true;
        };
        FileSystemDeviceDriver.prototype.generalFilenameChecks = function (name) {
            if (!this.isFormatted) {
                _StdOut.putText("Disk is not formatted. ");
                return false;
            }
            if (name.length > 120) {
                _StdOut.putText("Filename too long, filenames may only be 62 characters long. ");
                return false;
            }
            return true;
        };
        FileSystemDeviceDriver.prototype.createFile = function (name) {
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
        };
        FileSystemDeviceDriver.prototype.readFile = function (name) {
            name = this.convertStrToASCII(name);
            if (!this.generalFilenameChecks(name)) {
                return false;
            }
            var current_id = this.filenameLookup(name);
            if (current_id == "000") {
                _StdOut.putText("Filename does not exists.");
                return false;
            }
            current_id = sessionStorage.getItem(current_id).substring(1, 4);
            _StdOut.putText(this.convertASCIItoStr(this.readBlockChain(current_id)));
            return true;
        };
        FileSystemDeviceDriver.prototype.writeFile = function (name, data) {
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
            while (data.length > 0) {
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
            return true;
        };
        FileSystemDeviceDriver.prototype.deleteFile = function (name) {
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
        };
        FileSystemDeviceDriver.prototype.deleteBlockChain = function (id) {
            while (id != "000") {
                var next_id = sessionStorage.getItem(id).substring(1, 4);
                this.setBlockAvailable(id);
                id = next_id;
            }
        };
        FileSystemDeviceDriver.prototype.readBlockChain = function (id) {
            var output = "";
            while (id != "000") {
                var data = sessionStorage.getItem(id);
                var next_id = data.substring(1, 4);
                output += data.substring(4);
                id = next_id;
            }
            return output;
        };
        FileSystemDeviceDriver.prototype.filenameLookup = function (name) {
            var track = 0;
            for (var sector = 0; sector < 8; sector++) {
                for (var block = 0; block < 8; block++) {
                    if (track == 0 && block == 0 && block == 0)
                        block++; // Skip MBR
                    var id = "" + track + sector + block;
                    var data = sessionStorage.getItem(id);
                    if (data[0] == '1') {
                        data = data.substring(4);
                        if (data.indexOf('00') == -1) {
                            var data_name = data;
                        }
                        else {
                            var data_name = data.substring(0, data.indexOf('00'));
                        }
                        if (data_name == name) {
                            return id;
                        }
                    }
                }
            }
            return "000";
        };
        FileSystemDeviceDriver.prototype.findEmptyDirBlock = function () {
            var track = 0;
            for (var sector = 0; sector < 8; sector++) {
                for (var block = 0; block < 8; block++) {
                    if (track == 0 && block == 0 && block == 0)
                        block++; // Skip MBR
                    var id = "" + track + sector + block;
                    if (sessionStorage.getItem(id)[0] == "0") {
                        return id;
                    }
                }
            }
            return "000";
        };
        FileSystemDeviceDriver.prototype.findEmptyDataBlock = function () {
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
        };
        FileSystemDeviceDriver.prototype.writeBlock = function (id, next, data) {
            sessionStorage.setItem(id, '1' + next + data);
            this.updateDisplay();
        };
        FileSystemDeviceDriver.prototype.changeNextBlock = function (old_id, next_id) {
            sessionStorage.setItem(old_id, "1" + next_id + sessionStorage.getItem(old_id).substring(4));
        };
        FileSystemDeviceDriver.prototype.setBlockAvailable = function (id) {
            sessionStorage.setItem(id, "0" + sessionStorage.getItem(id).substring(1));
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
            return value.split('').map(function (c) {
                return TSOS.Utils.intToHex(c.charCodeAt(0));
            }).join('');
        };
        FileSystemDeviceDriver.prototype.convertASCIItoStr = function (value) {
            if (value.length < 1)
                return "";
            return value.match(/.{1,2}/g).map(function (char) {
                return String.fromCharCode(TSOS.Utils.parseHex(char));
            }).join('');
        };
        FileSystemDeviceDriver.prototype.getPaddedStr = function (str) {
            return str + Array(125 - str.length).join("0");
        };
        return FileSystemDeviceDriver;
    })(TSOS.DeviceDriver);
    TSOS.FileSystemDeviceDriver = FileSystemDeviceDriver;
})(TSOS || (TSOS = {}));
