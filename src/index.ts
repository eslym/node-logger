import EventEmitter = require("events");
import * as util from "util";
import * as os from "os";
import * as inspector from "inspector";
import {PathLike, createWriteStream} from "fs";
import {Writable} from "stream";

const ansi = {
    reset: '\x1B[0m',
    red: '\x1B[31m',
    yellow: '\x1B[33m',
    white: '\x1B[37m',
    gray: '\x1B[90m',
}

export interface TextLoggingOptions {
    color?: boolean,
    indent?: number,
    name?: string,
    log?: NodeJS.WritableStream | false,
    info?: NodeJS.WritableStream | false,
    warn?: NodeJS.WritableStream | false,
    error?: NodeJS.WritableStream | false,
}

function pad(n: number, digit: number) {
    let str = n.toString();
    return "0".repeat(digit - str.length) + str;
}

function formatDate(time: Date) {
    return `[${time.getFullYear()}-${pad(time.getMonth() + 1, 2)}-${pad(time.getDate(), 2)} ` +
        `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}]`;
}

type LogFn = (this: Logger, ...data: any) => void;
type LogFnWithName = (this: Logger, scope: string, ...data: any) => void;

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

export class Logger extends EventEmitter {
    readonly log: LogFn;
    readonly info: LogFn;
    readonly warn: LogFn;
    readonly error: LogFn;

    readonly logWith: LogFnWithName;
    readonly infoWith: LogFnWithName;
    readonly warnWith: LogFnWithName;
    readonly errorWith: LogFnWithName;

    constructor() {
        super();
    }
}

export declare interface Logger {
    on(event: 'record', listener: (time: Date, level: LogLevel, data: any, scope?: string) => any): this;

    once(event: 'record', listener: (time: Date, level: LogLevel, data: any, scope?: string) => any): this;

    emit(event: 'record', time: Date, level: LogLevel, data: any, scope?: string): boolean;
}

for (let level of ['log', 'info', 'warn', 'error']) {
    Logger.prototype[level] = function (...data: any) {
        let now = new Date();
        for (let record of data) {
            this.emit('record', now, level, record);
        }
    }
    Logger.prototype[level + 'With'] = function (scope: string, ...data: any) {
        let now = new Date();
        for (let record of data) {
            this.emit('record', now, level, record, scope);
        }
    }
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
}

class AppendStream extends Writable{
    readonly #path: PathLike;

    constructor(path: PathLike) {
        super();
        this.#path = path;
    }

    _write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
        let stream = createWriteStream(this.#path, {flags: 'a'});
        let res = stream.write(chunk, encoding, callback);
        stream.close();
        return res;
    }
}

export function createAppendStream(path: PathLike){
    return new AppendStream(path);
}

export function TextLogging(options: TextLoggingOptions = {}) {
    return (time: Date, level: LogLevel, data: any, scope?: string) => {
        if(options[level] === false) return;
        let log = (options.color === undefined || options.color) ? config[level].color : '';
        log += formatDate(time);
        if (options.name) log += `[${options.name}]`;
        log += `[${level.toUpperCase()}]`;
        if (scope) log += `[${scope}]`;
        log += typeof data === 'string' ? data : util.inspect(data, false, 2, false);
        let indent = " ".repeat(options.indent ?? 4) + os.EOL;
        let io = (options[level] as NodeJS.WritableStream ?? config[level].io);
        io.write(log.replace(/\r?\n|\n?\r/g, indent));
        io.write(os.EOL);
        if(options.color === undefined || options.color) io.write(ansi.reset);
    }
}

export function InspectorLogging(time: Date, level: LogLevel, data: any) {
    ((inspector as any).console as Console)[level](data);
}

export const logger = new Logger();

logger.on('record', TextLogging());
logger.on('record', InspectorLogging);
