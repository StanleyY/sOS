///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
  export class Shell {
    // Properties
    public promptStr = ">";
    public commandList = [];
    public commandListNames = []; // A sorted array of command names.
    public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    public apologies = "[sorry]";

    constructor() {
    }

    public init() {
      var sc;
      //
      // Load the command list.

      // ver
      sc = new ShellCommand(this.shellVer,
                            "ver",
                            "- Displays the current version data.");
      this.commandList[this.commandList.length] = sc;

      // help
      sc = new ShellCommand(this.shellHelp,
                            "help",
                            "- This is the help command. Seek help.");
      this.commandList[this.commandList.length] = sc;

      // shutdown
      sc = new ShellCommand(this.shellShutdown,
                            "shutdown",
                            "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
      this.commandList[this.commandList.length] = sc;

      // cls
      sc = new ShellCommand(this.shellCls,
                            "cls",
                            "- Clears the screen and resets the cursor position.");
      this.commandList[this.commandList.length] = sc;

      // man <topic>
      sc = new ShellCommand(this.shellMan,
                            "man",
                            "<topic> - Displays the MANual page for <topic>.");
      this.commandList[this.commandList.length] = sc;

      // trace <on | off>
      sc = new ShellCommand(this.shellTrace,
                            "trace",
                            "<on | off> - Turns the OS trace on or off.");
      this.commandList[this.commandList.length] = sc;

      // rot13 <string>
      sc = new ShellCommand(this.shellRot13,
                            "rot13",
                            "<string> - Does rot13 obfuscation on <string>.");
      this.commandList[this.commandList.length] = sc;

      // prompt <string>
      sc = new ShellCommand(this.shellPrompt,
                            "prompt",
                            "<string> - Sets the prompt.");
      this.commandList[this.commandList.length] = sc;

      //bsod
      sc = new ShellCommand(this.shellBSOD,
                            "bsod",
                            "- display the error page.");
      this.commandList[this.commandList.length] = sc;

      //date
      sc = new ShellCommand(this.shellDate,
                            "date",
                            "- display the date.");
      this.commandList[this.commandList.length] = sc;

      //coinflip
      sc = new ShellCommand(this.shellCoinflip,
                            "coinflip",
                            "- flips a coin.");
      this.commandList[this.commandList.length] = sc;


      //whereami
      sc = new ShellCommand(this.shellWhereAmI,
                            "whereami",
                            "- gets your location.");
      this.commandList[this.commandList.length] = sc;

      //status
      sc = new ShellCommand(this.shellStatus,
                            "status",
                            "- updates taskbar status.");
      this.commandList[this.commandList.length] = sc;

      //load
      sc = new ShellCommand(this.shellLoad,
                            "load",
                            "- loads the value in program input into memory.");
      this.commandList[this.commandList.length] = sc;

      //run
      sc = new ShellCommand(this.shellRun,
                            "run",
                            "- runs a given pid.");
      this.commandList[this.commandList.length] = sc;

      //clearmem
      sc = new ShellCommand(this.shellClearMem,
                            "clearmem",
                            "- clears the memory.");
      this.commandList[this.commandList.length] = sc;

      //runall
      sc = new ShellCommand(this.shellRunAll,
                            "runall",
                            "- runs all programs in the resident queue.");
      this.commandList[this.commandList.length] = sc;

      //quantum
      sc = new ShellCommand(this.shellQuantum,
                            "quantum",
                            "- sets the quantum for Round Robin scheduling.");
      this.commandList[this.commandList.length] = sc;

      // ps  - list the running processes and their IDs
      sc = new ShellCommand(this.shellPS,
                            "ps",
                            "- displays all active PIDs.");
      this.commandList[this.commandList.length] = sc;

      // kill <id> - kills the specified process id.
      sc = new ShellCommand(this.shellKill,
                            "kill",
                            "- kills a given pid.");
      this.commandList[this.commandList.length] = sc;

      // format - formats the hard disk
      sc = new ShellCommand(this.shellFormat,
                            "format",
                            "- formats the hard disk.");
      this.commandList[this.commandList.length] = sc;

      // create - creates a file
      sc = new ShellCommand(this.shellCreate,
                            "create",
                            "- formats the hard disk.");
      this.commandList[this.commandList.length] = sc;

      // read - read a given filename.
      sc = new ShellCommand(this.shellRead,
                            "read",
                            "- read a given filename.");
      this.commandList[this.commandList.length] = sc;

      // write - write to a file
      sc = new ShellCommand(this.shellWrite,
                            "write",
                            "- writes the data enclosed in quotes to a given filename.");
      this.commandList[this.commandList.length] = sc;

      // delete - delete a given filename.
      sc = new ShellCommand(this.shellDelete,
                            "delete",
                            "- delete a given filename.");
      this.commandList[this.commandList.length] = sc;

      // ls - displays available files.
      sc = new ShellCommand(this.shellListFiles,
                            "ls",
                            "- displays available files.");
      this.commandList[this.commandList.length] = sc;

      // getschedule - displays the current scheduling algorithm.
      sc = new ShellCommand(this.shellGetSchedule,
                            "getschedule",
                            "displays the current scheduling algorithm.");
      this.commandList[this.commandList.length] = sc;

      // setschedule - sets the scheduling algorithm out of [rr, fcfs, priority].
      sc = new ShellCommand(this.shellSetSchedule,
                            "setschedule",
                            "sets the scheduling algorithm out of [rr, fcfs, priority]");
      this.commandList[this.commandList.length] = sc;

      //
      // Display the initial prompt.
      this.putPrompt();
      // Generates the command names.
      this.commandListNames = this.commandList.map(function(obj){
        return obj.command;
      }).sort();
    }

    public putPrompt() {
      _StdOut.putText(this.promptStr);
    }

    public handleInput(buffer) {
      _Kernel.krnTrace("Shell Command~" + buffer);
      //
      // Parse the input...
      //
      var userCommand = this.parseInput(buffer);
      // ... and assign the command and args to local variables.
      var cmd = userCommand.command;
      var args = userCommand.args;
      //
      // Determine the command and execute it.
      //
      // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
      // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
      var index: number = 0;
      var found: boolean = false;
      var fn = undefined;
      while (!found && index < this.commandList.length) {
        if (this.commandList[index].command === cmd) {
          found = true;
          fn = this.commandList[index].func;
        } else {
          ++index;
        }
      }
      if (found) {
          this.execute(fn, args);
      } else {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
          this.execute(this.shellCurse);
        } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
          this.execute(this.shellApology);
        } else { // It's just a bad command. {
          this.execute(this.shellInvalidCommand);
        }
      }
    }

    // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
    public execute(fn, args?) {
      // We just got a command, so advance the line...
      _StdOut.advanceLine();
      // ... call the command function passing in the args with some über-cool functional programming ...
      fn(args);
      // Check to see if we need to advance the line again
      if (_StdOut.currentXPosition > 0) {
          _StdOut.advanceLine();
      }
      // ... and finally write the prompt again.
      this.putPrompt();
    }

    public parseInput(buffer): UserCommand {
      var retVal = new UserCommand();

      // 1. Remove leading and trailing spaces.
      buffer = Utils.trim(buffer);

      // 3. Separate on spaces so we can determine the command and command-line args, if any.
      var tempList = buffer.split(" ");

      // 4. Take the first (zeroth) element and use that as the command.
      var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
      // 4.1 Remove any left-over spaces.
      cmd = Utils.trim(cmd);
      // 4.2 Record it in the return value.
      retVal.command = cmd;

      // 5. Now create the args array from what's left.
      for (var i in tempList) {
        var arg = Utils.trim(tempList[i]);
        if (arg != "") {
            retVal.args[retVal.args.length] = tempList[i];
        }
      }
      return retVal;
    }

    //
    // Shell Command Functions.  Kinda not part of Shell() class exactly, but
    // called from here, so kept here to avoid violating the law of least astonishment.
    //
    public shellInvalidCommand() {
      _StdOut.putText("Invalid Command. ");
      if (_SarcasticMode) {
          _StdOut.putText("Unbelievable. You, [subject name here],");
          _StdOut.advanceLine();
          _StdOut.putText("must be the pride of [subject hometown here].");
      } else {
          _StdOut.putText("Type 'help' for, well... help.");
      }
    }

    public shellCurse() {
      _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
      _StdOut.advanceLine();
      _StdOut.putText("Bitch.");
      _SarcasticMode = true;
    }

    public shellApology() {
      if (_SarcasticMode) {
        _StdOut.putText("I think we can put our differences behind us.");
        _StdOut.advanceLine();
        _StdOut.putText("For science . . . You monster.");
        _SarcasticMode = false;
      } else {
        _StdOut.putText("For what?");
      }
    }

    public shellVer(args) {
      _StdOut.putText(APP_NAME + " version " + APP_VERSION);
    }

    public shellHelp(args) {
      _StdOut.putText("Commands:");
      for (var i in _OsShell.commandList) {
          _StdOut.advanceLine();
          _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
      }
    }

    public shellShutdown(args) {
       _StdOut.putText("Shutting down...");
       // Call Kernel shutdown routine.
      _Kernel.krnShutdown();
      // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
    }

    public shellCls(args) {
      _Canvas.height = 500;
      _StdOut.clearScreen();
      _StdOut.resetXY();
    }

    public shellMan(args) {
      if (args.length > 0) {
        var topic = args[0];
        switch (topic) {
          case "help":
            _StdOut.putText("Help displays a list of (hopefully) valid commands.");
            break;
          // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
          default:
            _StdOut.putText("No manual entry for " + args[0] + ".");
        }
      } else {
        _StdOut.putText("Usage: man <topic>  Please supply a topic.");
      }
    }

    public shellTrace(args) {
      if (args.length > 0) {
        var setting = args[0];
        switch (setting) {
            case "on":
                if (_Trace && _SarcasticMode) {
                    _StdOut.putText("Trace is already on, doofus.");
                } else {
                    _Trace = true;
                    _StdOut.putText("Trace ON");
                }
                break;
            case "off":
                _Trace = false;
                _StdOut.putText("Trace OFF");
                break;
            default:
                _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
        }
      } else {
        _StdOut.putText("Usage: trace <on | off>");
      }
    }

    public shellRot13(args) {
      if (args.length > 0) {
        // Requires Utils.ts for rot13() function.
        _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
      } else {
        _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
      }
    }

    public shellPrompt(args) {
      if (args.length > 0) {
        _OsShell.promptStr = args[0];
      } else {
        _StdOut.putText("Usage: prompt <string>  Please supply a string.");
      }
    }

    public shellBSOD(args) {
      Utils.bsod();
    }

    public shellDate(args) {
      var d = new Date();
      _StdOut.putText(d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear());
    }

    public shellCoinflip(args) {
      if (Math.random() > 0.5) {
        _StdOut.putText("HEADS!");
      } else {
        _StdOut.putText("TAILS!");
      }
    }

    public shellWhereAmI(args) {
      _StdOut.putText("good question.");
    }

    public shellStatus(args) {
      if (args.length > 0) {
        _TaskBarStatus = args.join(" ");
      } else {
        _StdOut.putText("Usage: status <string>  Please supply a string.");
      }
    }

    public shellLoad(args) {
      if (args.length == 0 || args.length == 1) {
        var regex = /^[0-9A-F ]+$/g;
        var input = _ProgramInput.value;
        input = input.replace(/\n+/g, '');
        if (input.match(regex) && input.replace(/\s+/g, '').length % 2 == 0) {
          var pcb = _Kernel.createProcess(input.replace(/\s+/g, ''));
          if (pcb) {
            if (args.length == 1) {
              pcb.setPriority(parseInt(args[0]));
            }
            _Scheduler.loadJob(pcb);
            _StdOut.putText("Loaded to PID: " + pcb.pid);
          } else {
            _StdOut.putText("No available memory partition or hard drive space.");
          }
        } else {
          _StdOut.putText("Input is invalid.");
        }
      } else {
        _StdOut.putText("load <optional priority number, 0 is the highest>");
      }
    }

    public shellRun(args) {
      if (args.length == 1) {
        if (!_Scheduler.runJob(parseInt(args[0]))) {
          _StdOut.putText("PID does not exists.");
        }
      } else {
        _StdOut.putText("Usage: run <pid>");
      }
    }

    public shellClearMem(args) {
      if (args.length == 0) {
        _MMU.clearMemory();
      } else {
        _StdOut.putText("clearmem takes no arguments");
      }
    }

    public shellRunAll(args) {
      if (args.length == 0) {
        _Scheduler.runAll();
      } else {
        _StdOut.putText("runall takes no arguments");
      }
    }

    public shellQuantum(args) {
      if (args.length == 1 && !isNaN(args[0])) {
        _Scheduler.quantum = parseInt(args[0]);
      } else {
        _StdOut.putText("quantum <int>");
      }
    }

    public shellPS(args) {
      if (args.length == 0) {
        _Scheduler.ps();
      } else {
        _StdOut.putText("ps takes no arguments");
      }
    }

    public shellKill(args) {
      if (args.length == 1 && !isNaN(args[0])) {
        if (_Scheduler.kill(parseInt(args[0])) == -1) {
          _StdOut.putText("No such PID.");
        }
      } else {
        _StdOut.putText("kill <pid>");
      }
    }

    public shellFormat(args) {
      if (args.length == 0) {
        if(_krnFileSystemDriver.formatDisk()) {
          _StdOut.putText("Format Successful.");
        } else {
          _StdOut.putText("Format Failed.");
        }
      } else {
        _StdOut.putText("ps takes no arguments");
      }
    }

    public shellCreate(args) {
      if (args.length == 1) {
        if(_krnFileSystemDriver.createFile(args[0])) {
          _StdOut.putText("File created.");
        } else {
          _StdOut.putText("Failed to create file.");
        }
      } else {
        _StdOut.putText("create <filename>");
      }
    }

    public shellRead(args) {
      if (args.length == 1) {
        var output = _krnFileSystemDriver.readFile(args[0]);
        if (output) {
          _StdOut.putText(output);
        }
      } else {
        _StdOut.putText("read <filename>");
      }
    }

    public shellWrite(args) {
      if (args.length == 2) {
        if (args[1].match(/\".*\"/g)) {
          if (_krnFileSystemDriver.writeFileASCII(args[0], args[1].substring(1, args[1].length - 1))) {
            _StdOut.putText("Successfully Written.");
          }
        } else {
          _StdOut.putText("Data must be enclosed in quotes.");
        }
      } else {
        _StdOut.putText('write <filename> "data"');
      }
    }

    public shellDelete(args) {
      if (args.length == 1) {
        if(_krnFileSystemDriver.deleteFile(args[0])) {
          _StdOut.putText("File deleted.");
        } else {
          _StdOut.putText("Failed to delete file.");
        }
      } else {
        _StdOut.putText("delete <filename>");
      }
    }

    public shellListFiles(args) {
      if (args.length == 0) {
        _krnFileSystemDriver.listFiles();
      } else {
        _StdOut.putText("ls takes no arguments");
      }
    }

    public shellGetSchedule(args) {
      if (args.length == 0) {
        _StdOut.putText("Current Scheduling Algorithm: " + _Scheduler.mode);
      } else {
        _StdOut.putText("getschedule takes no arguments");
      }
    }

    public shellSetSchedule(args) {
      if (args.length == 1 && (args[0] == 'rr' || args[0] == 'fcfs' || args[0] == 'priority')) {
        _Scheduler.mode = args[0];
      } else {
        _StdOut.putText("Usage: setschedule [rr, fcfs, priority]");
      }
    }
  }
}
