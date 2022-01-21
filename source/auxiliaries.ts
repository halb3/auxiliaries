
/* spellchecker: disable */

/* spellchecker: enable */


/**
 * If true, assertions immediately return on invocation (variable can be set via webpack define plugin).
 */
declare let __DISABLE_ASSERTIONS__: boolean;

/**
 * If defined, logs of equal or higher verbosity level are skipped (variable can be set via webpack define plugin).
 */
declare let __LOG_VERBOSITY_THRESHOLD__: number; // -1 disables all logs


/* istanbul ignore next line - __LOG_VERBOSITY_THRESHOLD__ has to be defined by the build environment*/
let logVerbosityThreshold = typeof __LOG_VERBOSITY_THRESHOLD__ !== 'undefined' ? __LOG_VERBOSITY_THRESHOLD__ : 4;

/**
 * Allows to specify the log verbosity. The default verbosity depends on the bundle type, e.g., a production bundle
 * might use a verbosity of 1, a local development bundle might favor a verbosity of 2. Even though verbosity levels
 * can be used arbitrarily, a verbosity of 0 is intended for user info only, 1 for developers, and 2 for developers
 * of this module. However, this semantic breaks when reusing this logging mechanism in other modules as well...
 * @param verbosity - Log level threshold, -1:disabled, 0:user, 1:developer, and 2:module developer.
 * @returns - The current log verbosity.
 */
export function logVerbosity(verbosity?: number): number {
    if (verbosity !== undefined) {
        logVerbosityThreshold = Math.max(-1, verbosity);
    }
    return logVerbosityThreshold;
}

/**
 * Log verbosity levels.
 */
export enum LogLevel { Debug = 4, Info = 3, Log = 2, Warning = 1, Error = 0 }

/**
 * Evaluates the provided statement and throws an evaluation error if false.
 * ```
 * assert(foo <= threshold, `value of foo ${foo} exceeds threshold of ${threshold}`);
 * ```
 * @param statement - Result of an statement expected to be true.
 * @param message - Message to be passed to the error (if thrown).
 */
const assertImpl = (statement: boolean, message: string): void => {
    if (statement) {
        return;
    }
    /* The parameters are intentionally not forwarded to console.assert since it does not interrupt execution. */
    throw new EvalError(message);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
const assertEmpty = (statement: boolean, message: string): void => { };

export let assert = assertImpl;
/* istanbul ignore next line - __DISABLE_ASSERTIONS__ has to be defined by the build environment*/
if (typeof __DISABLE_ASSERTIONS__ !== 'undefined' && __DISABLE_ASSERTIONS__) {
    assert = assertEmpty;
}

/**
 * Allows to specify whether or not assertions should be enabled or disabled/ignored.
 * @param enable - If true, assertions will be evaluated and might throw errors.
 * @returns whether assertions are enabled
 */
export function assertions(enable?: boolean): boolean {
    if (enable !== undefined) {
        assert = enable ? assertImpl : assertEmpty;
    }
    return assert !== assertEmpty;
}

/**
 * Writes a warning to the console when the evaluated statement is false.
 * ```
 * log(,`scale changed to ${scale}, given ${this._scale}`);
 * ```
 * @param statement - Result of an statement expected to be true.
 * @param verbosity - Verbosity of log level: user, developer, or module developer.
 * @param message - Message to be passed to the log (if verbosity high enough).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(verbosity: LogLevel, ...message: Array<any>): void {
    if (verbosity > logVerbosityThreshold) {
        return;
    }
    switch (verbosity) {
        case LogLevel.Error:
            // console.error(`[${verbosity}]`, ...message);
            console.error(...message);
            break;
        case LogLevel.Warning:
            console.warn(...message);
            break;
        case LogLevel.Info:
            console.info(...message);
            break;
        case LogLevel.Debug:
            console.debug(...message);
            break;
        default:
            console.log(...message);
            break;
    }
}

/**
 * Writes a lo message to the console when the evaluated statement is false.
 * ```
 * logIf(!vec2.equals(this._scale, scale), LogLevel.Info, `scale changed to ${scale}, given ${this._scale}`);
 * ```
 * @param statement - Result of an statement expected to be true.
 * @param verbosity - Verbosity of log level: debug, info, warning, or error.
 * @param message - Message to be passed to the log (if thrown and verbosity high enough).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logIf(statement: boolean, verbosity: LogLevel, ...message: Array<any>): void {
    if (!statement) {
        return;
    }
    log(verbosity, ...message);
}

/**
 * Starts performance measure using the performance API. This call initiates a performance mark and should be
 * followed by a `logPerformanceStop` call later on. Furthermore, the measurement can be tracked using, e.g., the
 * Chrome built-in performance profiler. Example:
 * ```
 * auxiliaries.logPerformanceStart('initialization');
 * ...
 * auxiliaries.logPerformanceStop('initialization');
 * ```
 * The example above should output something like: `[3] initialization | 5.635s`.
 * @param mark - Name for the performance measure and base name for the start mark (`<mark>-start`).
 */
export function logPerformanceStart(mark: string): void {
    const start = `${mark}-start`;
    assert(performance.getEntriesByName(mark).length === 0,
        `expected mark identifier to not already exists, given ${mark}`);
    assert(performance.getEntriesByName(start).length === 0,
        `expected mark identifier to not already exists, given ${start}`);

    performance.mark(start);
}

/**
 * Invokes `logPerformanceStart` iff the statement resolves successfully.
 * @param statement - Result of an statement expected to be true in order to invoke logPerformanceStart.
 * @param mark - Name for the performance measure mark ... @see {@link logPerformanceStart}.
 */
export function logPerformanceStartIf(statement: boolean, mark: string): void {
    if (!statement) {
        return;
    }
    logPerformanceStart(mark);
}

/**
 * This creates a second, end mark for the given mark name, then creates a performance measure between the start
 * and end mark (`<mark>-start` and `<mark>-end`), resolves the duration for logging and, finally, removes/cleans
 * both marks and the measure. The duration is pretty printed ranging from nanoseconds to seconds. Example:
 * ```
 * auxiliaries.logPerformanceStart('initialization');
 * ...
 * auxiliaries.logPerformanceStop('initialization', '#items processed: ' + items.length , 48);
 * ```
 * The example above should output something like: `[3] initialization           #items processed: 4096 | 7.172ms`.
 * @param mark - Name for the performance measure and base name for the end mark (`<mark>-end`).
 * @param message - Optional message to provide to the debug-log output.
 * @param measureIndent - Optional indentation of the measure (useful if multiple measurements shall be aligned).
 */
export function logPerformanceStop(mark: string, message: string | undefined, measureIndent: number = 0): void {
    const start = `${mark}-start`;
    const end = `${mark}-end`;
    assert(performance.getEntriesByName(mark).length === 0,
        `expected mark identifier to not already exists, given ${mark}`);
    assert(performance.getEntriesByName(end).length === 0,
        `expected mark identifier to not already exists, given ${end}`);

    performance.mark(end);
    performance.measure(mark, start, end);

    const measures = performance.getEntriesByName(mark);
    const measure = measures[0];

    performance.clearMarks(start);
    performance.clearMarks(end);
    performance.clearMeasures(mark);

    const minIndent = message === undefined || message.length === 0 ? 0 : 2;
    const indent = Math.max(minIndent, measureIndent - mark.length - (message ? message.length : 0) - 1);

    const prettyMeasure = prettyPrintMilliseconds(measure.duration);
    log(LogLevel.Debug, `${mark}${' '.repeat(indent)}${message ? message : ''} | ${prettyMeasure}`);
}

/**
 * Invokes `logPerformanceStop` under the condition that the statement is true.
 * @param statement - Result of an expression expected to be true in order to invoke logPerformanceStop.
 * @param mark - Name for the performance measure mark ... @see {@link logPerformanceStart}.
 * @param message - Optional message to provide to the debug-log output ... @see {@link logPerformanceStart}.
 * @param measureIndent - Optional indentation of the measure ... @see {@link logPerformanceStart}.
 */
export function logPerformanceStopIf(statement: boolean,
    mark: string, message: string | undefined, measureIndent: number = 0): void {
    if (!statement) {
        return;
    }
    logPerformanceStop(mark, message, measureIndent);
}


/**
 * Byte suffixes based on ISO/IEC 80000 used for pretty printing of bytes.
 */
const byteSuffixes: Array<string> = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];

/**
 * Prints bytes using ISO/IEC 80000 postfixes for bytes and fixed number of decimal places (3 decimal places if
 * bytes >= KiB).
 * ```
 * prettyPrintBytes(27738900); // returns '26.454MiB'
 * ```
 * @param bytes - Number of bytes in plain bytes.
 */
export function prettyPrintBytes(bytes: number): string {
    const prefix: number = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
    const value = bytes / Math.pow(1024, prefix);
    return `${prefix > 0 ? value.toFixed(3) : value}${byteSuffixes[prefix]}B`;
}


/**
 * Suffixes used for pretty printing of time values in milliseconds.
 */
const msSuffixes: Array<string> = ['ms', 'ns', 'μs', 'ms', 's'];
/**
 * Scales used for pretty printing of time values in milliseconds.
 */
const msScales: Array<number> = [0, 1e+6, 1e+3, 1e+0, 1e-3];

/**
 * Prints given milliseconds in an appropriate seconds-based time unit and fixed number of decimal places.
 * ```
 * prettyPrintMilliseconds(0.03277); // returns '32.770μs'
 * ```
 * @param milliseconds - Number of milliseconds as floating point number.
 */
export function prettyPrintMilliseconds(milliseconds: number): string {
    let prefix: number = milliseconds > 0 ?
        Math.max(1, Math.floor(Math.log(milliseconds * 10) / Math.log(1e+3)) + 3) : 0;
    prefix = Math.max(0, Math.min(4, prefix));

    const value = milliseconds * msScales[prefix];
    return `${value.toFixed(3)}${msSuffixes[prefix]}`;
}

/**
 * Queries window.location.search, or, if not present, window.location.search of the window's top frame.
 */
export function GETsearch(): string {
    let search = window.location.search;
    if (!search && window.top) {
        search = window.top.location.search;
    }
    return search;
}

/**
 * Queries the value of a GET parameter.
 * @param parameter - Name/identifier of the parameter to query for.
 */
export function GETparameter(parameter: string): string | undefined {
    const re = new RegExp(`${parameter}=([^&]+)`);
    let match = window.location.search.match(re);
    if (!match && window.top) {
        // For iframe contents (i.e., the embedded /examples/ files), look within the top frame's search params
        match = window.top.location.search.match(re);
    }
    if (!match) {
        return undefined;
    }
    return match[1];
}

/**
 * Path separator used for path related functions such as dirname and basename.
 */
export const PATH_SEPARATOR = '/';

/**
 * Returns the directory name of a given (file) path. If no path separator is found, an empty dir name is returned.
 * @param path - Path string the directory name should be returned of.
 */
export function dirname(path: string): string {
    if (path.includes(PATH_SEPARATOR) === false) {
        return '';
    }
    return path.substring(0, path.lastIndexOf(PATH_SEPARATOR)).trimStart();
}

/**
 * Returns the base name of a given file path. If no path separator is found, the input path is returned.
 * @param path - Path string the file/base name should be returned of.
 */
export function basename(path: string): string {
    if (path.includes(PATH_SEPARATOR) === false) {
        return path;
    }
    return path.substring(path.lastIndexOf(PATH_SEPARATOR) + 1).trimEnd();
}
