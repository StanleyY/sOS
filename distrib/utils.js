/* --------
 Utils.ts

 Utility functions.
 -------- */
var TSOS;
(function (TSOS) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        };
        Utils.rot13 = function (str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };
        Utils.bsod = function () {
            // Reset to default canvas size.
            _Canvas.height = 500;
            _DrawingContext.rect(0, 0, 500, 500);
            _DrawingContext.fillStyle = "#1976D2";
            _DrawingContext.fill();
            _DrawingContext.font = "30px Verdana";
            _DrawingContext.fillStyle = "red";
            _DrawingContext.fillText("Illegal Operation!", 50, 50);
            TSOS.Control.hostBtnHaltOS_click('void');
            throw "BSOD!";
        };
        Utils.updateTaskbar = function () {
            var t = new Date();
            _TaskBar.value = "Status: " + _TaskBarStatus + "\nTime: " +
                t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() +
                "\nDate: " + t.getMonth() + "/" + t.getDate() + "/" + t.getFullYear();
        };
        Utils.parseHex = function (hex) {
            return parseInt(hex, 16);
        };
        Utils.intToHex = function (int) {
            var temp = int.toString(16).toUpperCase();
            if (temp.length == 1)
                temp = "0" + temp;
            return temp;
        };
        Utils.cleanInput = function () {
            var programInput = document.getElementById('taProgramInput');
            programInput.value = programInput.value.toUpperCase();
            programInput.value = programInput.value.replace(/[\s\t\n]/g, '');
            programInput.value = programInput.value.replace(/(\S\S)/g, '$1 ');
        };
        return Utils;
    })();
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
