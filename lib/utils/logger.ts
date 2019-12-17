
export type LoggerFunction = (...args: any[]) => void;
export type LogLevels = 'log' | 'warn' | 'error';

export interface ILogger {
    log: LoggerFunction;
    warn: LoggerFunction;
    error: LoggerFunction;
}

export interface IGenericLogger {
    print(level: LogLevels, ...args: any[]): void;
}

const CONSOLE = console;
const EMPTY_FUNCTION = () => { /* no-op */};

function addArg(func: (...args: any[]) => any, value: string) {
    return (...args: any[]) => func(value, ...args);
}

export class ConsoleLogger implements ILogger, IGenericLogger {

    private _log: LoggerFunction;
    private _warn: LoggerFunction;
    private _error: LoggerFunction;

    private _name: string;

    get log() { return this._log; }
    get warn() { return this._warn; }
    get error() { return this._error; }

    constructor(
        name: string,
        enabled = true,
        private readonly defaultLogger: { log: LoggerFunction, warn: LoggerFunction, error: LoggerFunction } = CONSOLE,
    ) {
        this._name = name;

        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable(overrideName: string = null) {
        this._name = overrideName || this._name;

        this._log = this._name
            ? addArg(this.defaultLogger.log, this._name)
            : this.defaultLogger.log;
        this._warn = this._name
            ? addArg(this.defaultLogger.warn, this._name)
            : this.defaultLogger.warn;
        this._error = this._name
            ? addArg(this.defaultLogger.error, this._name)
            : this.defaultLogger.error;
    }

    print(level: LogLevels, ...args: any[]): void {
        switch (level) {
            case 'warn': {
                return this.warn(...args);
            }

            case 'error': {
                return this.error(...args);
            }

            case 'log':
            default: {
                return this.log(...args);
            }
        }
    }

    disable() {
        this._log = EMPTY_FUNCTION;
        this._warn = EMPTY_FUNCTION;
        this._error = EMPTY_FUNCTION;
    }

    flush() { /** no-op */ }
}

export class BufferedConsoleLogger implements ILogger {
    private _name: string;
    private _logs: string[];
    private _level = 1;

    private _log = CONSOLE.log;

    constructor(name: string) {
        this._name = name || '';
    }

    log(...args: any[]) {
        this._logs.push('\t--->', ...args);
    }

    warn(...args: any[]) {
        this._logs.push('\t---> [WARN]', ...args);
        this._raiseLevel(2);
    }

    error(...args: any[]) {
        this._logs.push('\t---> [ERROR]', ...args);
        this._raiseLevel(3);
    }

    flush() {
        if (this._logs.length > 0) {
            this._log(this._name, ...this._logs);
            this._logs.length = 0;
        }
    }

    private _raiseLevel(l: number) {
        if (l > this._level) {
            this._level = l;
            if (l >= 3) {
                this._log = CONSOLE.error;
            } else if (l >= 2) {
                this._log = CONSOLE.warn;
            }
        }
    }
}

export const Enabled = process.env.NODE_ENV !== 'production';

export function createLogger(name = '', forceDisable = false): ILogger {
  return new ConsoleLogger(name, forceDisable ? false : Enabled);
}

const theLogger = createLogger();

export default theLogger;
