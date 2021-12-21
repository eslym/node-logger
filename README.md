# @eslym/logger
Just my fancy logger, nothing special

```shell
npm install eslym-logger
```

## Basic usage
```ts
import {logger} from '@eslym/logger';
logger.log('This is log');
logger.logWith('DATABASE', 'This is log for database');
```

## Advance usage?
```ts
import {Logger, TextLogging, InspectorLogging, createAppendStream} from '@eslym/logger';

const logger = new Logger();

let errorLog = createAppendStream('error.log');
let normalLog = createAppendStream('normal.log');

logger.on('record', TextLogging({
    name: "WORKER-1",
    color: false,
    error: errorLog,
    warn: errorLog,
    info: normalLog,
    log: normalLog,
}));
logger.on('record', TextLogging({
    name: "WORKER-1",
}));

logger.on('record', InspectorLogging);
logger.log('This is log from worker.');
logger.error('This is error log from worker.');
logger.warn('This is warning log from worker.');
```