"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.InspectorLogging = exports.TextLogging = exports.Logger = void 0;
const EventEmitter = require("events");
const util = require("util");
const os = require("os");
const inspector = require("inspector");
const ansi = {
    reset: '\x1B[0m',
    red: '\x1B[31m',
    yellow: '\x1B[33m',
    white: '\x1B[37m',
    gray: '\x1B[90m',
};
function pad(n, digit) {
    let str = n.toString();
    return "0".repeat(digit - str.length) + str;
}
function formatDate(time) {
    return `[${time.getFullYear()}-${pad(time.getMonth() + 1, 2)}-${pad(time.getDay(), 2)} ` +
        `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}]`;
}
class Logger extends EventEmitter {
    constructor() {
        super();
    }
}
exports.Logger = Logger;
for (let level of ['log', 'info', 'warn', 'error']) {
    Logger.prototype[level] = function (...data) {
        let now = new Date();
        for (let record of data) {
            this.emit('record', now, level, record);
        }
    };
    Logger.prototype[level + 'With'] = function (scope, ...data) {
        let now = new Date();
        for (let record of data) {
            this.emit('record', now, level, record, scope);
        }
    };
}
const config = {
    log: {
        color: ansi.gray,
        io: process.stdout,
    },
    info: {
        color: ansi.white,
        io: process.stdout,
    },
    warn: {
        color: ansi.yellow,
        io: process.stderr,
    },
    error: {
        color: ansi.red,
        io: process.stderr,
    },
};
function TextLogging(options = {}) {
    return (time, level, data, scope) => {
        var _a, _b;
        let log = (options.color === undefined || options.color) ? config[level].color : '';
        log += formatDate(time);
        if (options.name)
            log += `[${options.name}]`;
        log += `[${level.toUpperCase()}]`;
        if (scope)
            log += `[${scope}]`;
        log += typeof data === 'string' ? data : util.inspect(data, false, 2, false);
        let indent = " ".repeat((_a = options.indent) !== null && _a !== void 0 ? _a : 4) + os.EOL;
        let io = ((_b = options[level]) !== null && _b !== void 0 ? _b : config[level].io);
        io.write(log.replace(/\r?\n|\n?\r/g, indent));
        io.write(os.EOL + ansi.reset);
    };
}
exports.TextLogging = TextLogging;
function InspectorLogging(time, level, data) {
    inspector.console[level](data);
}
exports.InspectorLogging = InspectorLogging;
exports.logger = new Logger();
exports.logger.on('record', TextLogging());
exports.logger.on('record', InspectorLogging);
