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
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
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

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Displays the user's current location.");
            this.commandList[this.commandList.length] = sc;

            // whoami
            sc = new ShellCommand(this.shellWhoAmI,
                                  "whoami",
                                  "- Displays the user's current identity.");
            this.commandList[this.commandList.length] = sc;

            // howami
            sc = new ShellCommand(this.shellHowAmI,
                                  "howami",
                                  "- Displays the user's current state and provides details about creation.");
            this.commandList[this.commandList.length] = sc;

            // whyami
            sc = new ShellCommand(this.shellWhyAmI,
                                  "whyami",
                                  "- Displays the user's current purpose.");
            this.commandList[this.commandList.length] = sc;

            // whenami
            sc = new ShellCommand(this.shellWhenAmI,
                                  "whenami",
                                  "- Displays the user's current era.");
            this.commandList[this.commandList.length] = sc;

            // whatami
            sc = new ShellCommand(this.shellWhatAmI,
                                  "whatami",
                                  "- Displays the user's current material construction.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Updates the current status to <string>.");
            this.commandList[this.commandList.length] = sc;

            // Sort the commandList for use in tab completion
            this.commandList = this.commandList.sort((command1, command2) => {
                if (command1.command > command2.command) {
                    return 1;
                } else if (command1.command < command2.command) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
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
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
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
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
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

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
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

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 3. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift().toLowerCase();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 3.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 3.2 Record it in the return value.
            retVal.command = cmd;

            // 4. If the command is not status or prompt, lower-case the args
            if (cmd != 'status' && cmd != 'prompt') {
                for (let arg in tempList) {
                    tempList[arg] = tempList[arg].toLowerCase();
                }
            }

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
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
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

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    case "ver":
                        _StdOut.putText("Ver displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown shuts down the virtual OS but leaves the underlying host / " +
                                             "hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("Now, that's an interesting idea...how would a manual define itself? " +
                                             "Perhaps recursively?");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns the OS trace on or off.");
                        break;
                    case "rot13":
                        _StdOut.putText("Imagine a dial with 26 values, each being a letter of the English " +
                                             "alphabet in sequence. Rot13 takes your string and replaces each letter " +
                                             "with the one 13 places away on said dial.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt replaces the shell prompt, which is originally set to '>'.");
                        break;
                    case "date":
                        _StdOut.putText("Date provides the current date and time.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami provides the user's current (probable) location.");
                        break;
                    case "whoami":
                        _StdOut.putText("Whoami provides the user's current (probable) identity.");
                        break;
                    case "howami":
                        _StdOut.putText("Howami provides the user's current state and details of his/her origin.");
                        break;
                    case "whyami":
                        _StdOut.putText("Whyami provides the user's current purpose.");
                        break;
                    case "whenami":
                        _StdOut.putText("Whenami provides the user's current era.");
                        break;
                    case "whatami":
                        _StdOut.putText("Whatami provides the user's current chemical composition.");
                        break;
                    case "status":
                        _StdOut.putText("Status updates the current status in the taskbar.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
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

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            let currentDate: Date = new Date();
            _StdOut.putText("Current date and time: " + currentDate);
        }

        public shellWhereAmI(args: string[]) {
            _StdOut.putText("Most likely, United States. Significantly likely, New York. Decent probability, Poughkeepsie.");
        }

        public shellWhoAmI(args: string[]) {
            _StdOut.putText("Most likely, a conscious mind inside a human. Significantly likely, Marcus or Alan.");
        }

        public shellHowAmI(args: string[]) {
            _StdOut.putText("User's emotional status: somewhere between disturbed and content.");
            _StdOut.advanceLine();
            _StdOut.putText("For details of the user's origin, please consult https://storks.com/legend-of-storks/");
        }

        public shellWhyAmI(args: string[]) {
            _StdOut.putText("Your mission: to serve and protect his Royal Majesty by working for the MI6, " +
                            "a part of the British Secret Servi-...wait, that can't be right.");
        }

        public shellWhenAmI(args: string[]) {
            _StdOut.putText("https://letmegooglethat.com/?q=current+era");
            _StdOut.advanceLine();
            _StdOut.putText("Sources suggest the current era is the Holocene era. The link above doesn't. " +
                            "But you deserve it for even thinking you might have time traveled.");
        }

        public shellWhatAmI(args: string[]) {
            _StdOut.putText("99% oxygen, hydrogen, nitrogen, carbon, calcium, and phosphorus. " +
                            "0.85% sulfur, potassium, sodium, chlorine, and magnesium. " +
                            // TODO: Make the below occur only during Sarcastic mode.
                            "Maybe the remaining 0.15% accounts for your humor and intelligence.");
        }

        public shellStatus(args: string[]) {
            if (args.length > 0) {
                _Status = args.join(" ");
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
    }
}
