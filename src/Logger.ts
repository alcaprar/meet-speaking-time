import { type } from "os";

export default class Logger {

  logPrefix : string;

  constructor (logPrefix = "") {
    this.logPrefix = logPrefix;
  }

  callerName() {
    try {
      throw new Error();
    }
    catch (e) {
      try {
        return e.stack.split('at ')[3].split(' ')[0];
      } catch (e) {
        return '';
      }
    }
  
  }

  log (...args) {
    // 1. Convert args to a normal array
    const newArgs = Array.from(args);

    const callerName = this.callerName();
    if (callerName) newArgs.unshift(`[${callerName}]`)
        
    if (this.logPrefix) newArgs.unshift(`[${this.logPrefix}]`);
        
    // 3. Pass along arguments to console.log
    const debugVar = "debugTalkTimeExt";
    if (typeof window[debugVar] === "undefined" || (typeof window[debugVar] !== "undefined" && typeof window[debugVar])) {
      console.log.apply(console, newArgs);
    }
  }
}