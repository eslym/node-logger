"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AppendStream_path;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.InspectorLogging = exports.TextLogging = exports.createAppendStream = exports.Logger = void 0;
const EventEmitter = require("events");
const util = require("util");
const os = require("os");
const inspector = require("inspector");
const fs_1 = require("fs");
const stream_1 = require("stream");
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
    return `[${time.getFullYear()}-${pad(time.getMonth() + 1, 2)}-${pad(time.getDate(), 2)} ` +
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
class AppendStream extends stream_1.Writable {
    constructor(path) {
        super();
        _AppendStream_path.set(this, void 0);
        __classPrivateFieldSet(this, _AppendStream_path, path, "f");
    }
    _write(chunk, encoding, callback) {
        let stream = (0, fs_1.createWriteStream)(__classPrivateFieldGet(this, _AppendStream_path, "f"), { flags: 'a' });
        let res = stream.write(chunk, encoding, callback);
        stream.close();
        return res;
    }
}
_AppendStream_path = new WeakMap();
function createAppendStream(path) {
    return new AppendStream(path);
}
exports.createAppendStream = createAppendStream;
function TextLogging(options = {}) {
    return (time, level, data, scope) => {
        var _a, _b;
        if (options[level] === false)
            return;
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
        io.write(os.EOL);
        if (options.color === undefined || options.color)
            io.write(ansi.reset);
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
