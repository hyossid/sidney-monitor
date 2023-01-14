import safeJsonStringify from 'safe-json-stringify';

export type SEVERITY = 'INFO' | 'WARNING' | 'ERROR' | 'NOTICE';

const gcpLog = (severity: SEVERITY, message: string, error?: any): void => {
  console.log(
    safeJsonStringify({
      severity,
      message,
      'logging.googleapis.com/trace': (error as any)?.stack,
    }),
  );
};

const consoleSeverityLogMethods: { [K in SEVERITY]: typeof console.log } = {
  INFO: console.info,
  WARNING: console.warn,
  ERROR: console.error,
  NOTICE: console.log,
};

const consoleLog: typeof gcpLog = (severity, message, error) => {
  const _log = consoleSeverityLogMethods[severity] || console.log;
  const args: any[] = [message];
  if (error) args.push(error.stack ?? String(error));
  _log(...args);
};
export const log = process.env.K_SERVICE === undefined ? consoleLog : gcpLog;

export const info = log.bind(null, 'INFO');
export const error = log.bind(null, 'ERROR');
export const warn = log.bind(null, 'WARNING');
export const notice = log.bind(null, 'NOTICE');
export default Object.freeze({ log, info, error, warn, notice });
