/* --------
 Utils.ts

 Utility functions.
 -------- */

module TSOS {

  export class Utils {

    public static trim(str): string {
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
    }

    public static rot13(str: string): string {
      /*
         This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
         You can do this in three lines with a complex regular expression, but I'd have
         trouble explaining it in the future.  There's a lot to be said for obvious code.
      */
      var retVal: string = "";
      for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
        var ch: string = str[i];
        var code: number = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
          code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
          retVal = retVal + String.fromCharCode(code);
        } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
          code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
          retVal = retVal + String.fromCharCode(code);
        } else {
          retVal = retVal + ch;
        }
      }
      return retVal;
    }

    public static bsod(): void {
      // Reset to default canvas size.
      _Canvas.height = 500;
      _DrawingContext.rect(0, 0, 500, 500);
      _DrawingContext.fillStyle = "#1976D2";
      _DrawingContext.fill();
      _DrawingContext.font="30px Verdana";
      _DrawingContext.fillStyle = "red";
      _DrawingContext.fillText("Illegal Operation!", 50, 50);
      Control.hostBtnHaltOS_click('void');
      throw "BSOD!";
    }

    public static updateTaskbar(): void {
      var t = new Date();
      _TaskBar.value = "Status: " + _TaskBarStatus +"\nTime: " +
          t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() +
          "\nDate: " + t.getMonth() + "/" + t.getDate() + "/" + t.getFullYear();
    }

    public static parseHex(hex): number {
      return parseInt(hex, 16);
    }
  }
}
