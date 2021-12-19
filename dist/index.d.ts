/// <reference types="node" />
import EventEmitter = require("events");
export interface TextLoggingOptions {
    color?: boolean;
    indent?: number;
    name?: string;
    log?: NodeJS.WritableStream;
    info?: NodeJS.WritableStream;
    warn?: NodeJS.WritableStream;
    error?: NodeJS.WritableStream;
}
declare type LogFn = (this: Logger, ...data: any) => void;
declare type LogFnWithName = (this: Logger, scope: string, ...data: any) => void;
export declare type LogLevel = 'log' | 'info' | 'warn' | 'error';
export declare interface Logger {
    on(event: 'record', listener: (time: Date, level: LogLevel, data: any, scope?: string) => any): this;
    once(event: 'record', listener: (time: Date, level: LogLevel, data: any, scope?: string) => any): this;
    emit(event: 'record', time: Date, level: LogLevel, data: any, scope?: string): boolean;
}
export declare class Logger extends EventEmitter {
    readonly log: LogFn;
    readonly info: LogFn;
    readonly warn: LogFn;
    readonly error: LogFn;
    readonly logWith: LogFnWithName;
    readonly infoWith: LogFnWithName;
    readonly warnWith: LogFnWithName;
    readonly errorWith: LogFnWithName;
    constructor();
}
export declare function TextLogging(options?: TextLoggingOptions): (time: Date, level: LogLevel, data: any, scope?: string) => void;
export declare function InspectorLogging(time: Date, level: LogLevel, data: any): void;
export declare const logger: Logger;
export {};
