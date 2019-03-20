/**
 * @callback LoggerFunction
 * @param {...any[]} args
 */

/** @typedef {Object} LoggerInterface
 * @property {LoggerFunction} log
 * @property {LoggerFunction} warn
 * @property {LoggerFunction} error
 */

const CONSOLE = console;

function addArg(func, value) {
    return (...args) => func(value, ...args);
}

/** @implements {LoggerInterface} */
export class ConsoleLogger {
    /** @param {string} name */
    constructor(name, enabled = true) {
        this._name = name;

        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable(overrideName = null) {
        this._name = overrideName || this._name;

        this.log = this._name
            ? addArg(CONSOLE.log, this._name)
            : CONSOLE.log;
        this.warn = this._name
            ? addArg(CONSOLE.warn, this._name)
            : CONSOLE.warn;
        this.error = this._name
            ? addArg(CONSOLE.error, this._name)
            : CONSOLE.error;
    }

    disable() {
        this.log = () => {};
        this.warn = () => {};
        this.error = () => {};
    }

    flush() { }
}

export const Enabled = process.env.NODE_ENV !== 'production';

/** @returns {LoggerInterface} */
export function createLogger(name = '', forceDisable = false) {
    return new ConsoleLogger(name, forceDisable ? false : Enabled);
}

/** @type {LoggerInterface} */
const theLogger = createLogger();

export default theLogger;
