const {logger, Logger, TextLogging, InspectorLogging, createAppendStream} = require('.');

logger.log('This is log');
logger.logWith('DATABASE', 'This is log for database');

let log = new Logger();

let errorLog = createAppendStream('error.log');
let normalLog = createAppendStream('normal.log');

log.on('record', TextLogging({
    name: "WORKER-1",
    color: false,
    error: errorLog,
    warn: errorLog,
    info: normalLog,
    log: normalLog,
}));
log.on('record', TextLogging({
    name: "WORKER-1",
}));
log.on('record', InspectorLogging);
log.log('This is log from worker.');
log.error('This is error log from worker.');
log.warn('This is warning log from worker.');
