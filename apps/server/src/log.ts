import { TypedEmitter } from "tiny-typed-emitter";

type Events = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  log: (...args: any[]) => void;
};

class Logger extends TypedEmitter<Events> {
  info(...args: any[]) {
    this.emit("info", ...args);
  }

  warn(...args: any[]) {
    this.emit("warn", ...args);
  }

  error(...args: any[]) {
    this.emit("error", ...args);
  }

  log(...args: any[]) {
    this.emit("log", ...args);
  }
}

export default new Logger();
