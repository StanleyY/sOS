///<reference path="../globals.ts" />

/* ------------
   Devices.ts

   Requires global.ts.

   Routines for the hardware simulation, NOT for our client OS itself.
   These are static because we are never going to instantiate them, because they represent the hardware.
   In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
   is the "bare metal" (so to speak) for which we write code that hosts our client OS.
   But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
   in both the host and client environments.

   This (and simulation scripts) is the only place that we should see "web" code, like
   DOM manipulation and TypeScript/JavaScript event handling, and so on.  (Index.html is the only place for markup.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

module TSOS {

  export class Devices {

    constructor() {
      _hardwareClockID = -1;
    }

    //
    // Hardware/Host Clock Pulse
    //
    public static hostClockPulse(): void {
      // Call the kernel clock pulse event handler.
      _Kernel.krnOnCPUClockPulse();
      Utils.updateTaskbar();
      PCB.updatePcbDisplay();
    }

    //
    // Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in our text book.)
    //
    public static hostEnableKeyboardInterrupt(): void {
      // Listen for key press (keydown, actually) events in the Document
      // and call the simulation processor, which will in turn call the
      // OS interrupt handler.
      document.addEventListener("keydown", Devices.hostOnKey, false);
      document.addEventListener("keypress", Devices.hostOnKey, false);
    }

    public static hostDisableKeyboardInterrupt(): void {
      document.removeEventListener("keydown", Devices.hostOnKey, false);
      document.removeEventListener("keypress", Devices.hostOnKey, false);
    }

    public static hostOnKey(event): void {
      // The canvas element CAN receive focus if you give it a tab index, which we have.
      // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
      if (event.target.id === "display") {
        if (_EscapedKeys.indexOf(event.which) > -1) {
          event.preventDefault();
        }
        // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
        _KernelInterruptQueue.enqueue(new Interrupt(KEYBOARD_IRQ, event));
      }
    }
  }
}
