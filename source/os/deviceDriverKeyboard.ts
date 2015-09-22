///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

  // Extends DeviceDriver
  export class DeviceDriverKeyboard extends DeviceDriver {

    constructor() {
      // Override the base method pointers.
      super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
    }

    public krnKbdDriverEntry() {
      // Initialization routine for this, the kernel-mode Keyboard Device Driver.
      this.status = "loaded";
      // More?
    }

    public krnKbdDispatchKeyPress(event) {
      // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
      var chr = "";
      if (event.charCode > 0) {
         _Kernel.krnTrace("Added Char to queue, code:" + event.charCode);
        _KernelInputQueue.enqueue(String.fromCharCode(event.charCode));
      } else if (_EscapedKeys.indexOf(event.which) > -1) {
        _Kernel.krnTrace("Added Escape Char to queue, code:" + event.which);
        _KernelInputQueue.enqueue(String.fromCharCode(event.which));
      } else {
        _Kernel.krnTrace("Ignored key, code:" + event.which);
      }
    }
  }
}
