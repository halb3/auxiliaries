
/* spellchecker: disable */

import { expect } from 'chai';
import { stub, fake } from 'sinon';

import * as auxiliaries from '../source/auxiliaries';

/* spellchecker: enable */


describe('auxiliaries assert', () => {

    it('should not throw on true expression', () => {
        const message = 'never throw';
        expect(() => auxiliaries.assert(true, message)).to.not.throw;
    });

    it('should throw on false expression', () => {
        const message = 'always throw';
        expect(() => auxiliaries.assert(false, message)).to.throw;
    });

    it('should be allowed to be disabled', () => {
        expect(auxiliaries.assertions()).to.be.true;
        auxiliaries.assertions(false);
        expect(auxiliaries.assertions()).to.be.false;
        expect(() => auxiliaries.assert(false, 'ignore')).to.not.throw;
        auxiliaries.assertions(true);
        expect(() => auxiliaries.assert(false, 'ignore')).to.throw;
    });

});


describe('auxiliaries log and logIf', () => {

    it('should not log on false expression', () => {
        const consoleLogStub = stub(console, 'error');
        auxiliaries.logIf(false, auxiliaries.LogLevel.Error, 'never log');
        expect(consoleLogStub.notCalled).to.be.true;
        consoleLogStub.restore();
    });

    it('should log on true expression', () => {
        const consoleLogStub = stub(console, 'error');
        auxiliaries.logIf(true, auxiliaries.LogLevel.Error, 'always log');
        expect(consoleLogStub.calledOnce).to.be.true;
        consoleLogStub.restore();
    });

    it('should use the correct log level', () => {
        const [ferror, fwarn, finfo, fdebug, flog] = [fake(), fake(), fake(), fake(), fake()];

        const consoleErrorStub = stub(console, 'error').callsFake(ferror);
        const consoleWarnStub = stub(console, 'warn').callsFake(fwarn);
        const consoleInfoStub = stub(console, 'info').callsFake(finfo);
        const consoleDebugStub = stub(console, 'debug').callsFake(fdebug);
        const consoleLogStub = stub(console, 'log').callsFake(flog);

        auxiliaries.log(auxiliaries.LogLevel.Error, 'log level 0');
        expect(ferror.lastCall.args).to.deep.equal(['log level 0']);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1');
        expect(fwarn.lastCall.args).to.deep.equal(['log level 1']);

        auxiliaries.log(auxiliaries.LogLevel.Info, 'log level 2');
        expect(finfo.lastCall.args).to.deep.equal(['log level 2']);

        auxiliaries.log(auxiliaries.LogLevel.Debug, 'log level 3');
        expect(fdebug.lastCall.args).to.deep.equal(['log level 3']);

        expect(flog.callCount).to.equal(0);

        consoleErrorStub.restore();
        consoleWarnStub.restore();
        consoleInfoStub.restore();
        consoleDebugStub.restore();
        consoleLogStub.restore();
    });

    it('should respect verbosity level', () => {
        const [ferror, fwarn, flog, finfo, fdebug] = [fake(), fake(), fake(), fake(), fake()];

        const consoleErrorStub = stub(console, 'error').callsFake(ferror);
        const consoleWarnStub = stub(console, 'warn').callsFake(fwarn);
        const consoleLogStub = stub(console, 'log').callsFake(flog);
        const consoleInfoStub = stub(console, 'info').callsFake(finfo);
        const consoleDebugStub = stub(console, 'debug').callsFake(fdebug);

        auxiliaries.log(auxiliaries.LogLevel.Error, 'log level 0');
        expect(ferror.lastCall.args).to.deep.equal(['log level 0']);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1');
        expect(fwarn.lastCall.args).to.deep.equal(['log level 1']);

        auxiliaries.log(auxiliaries.LogLevel.Log, 'log level 2');
        expect(flog.lastCall.args).to.deep.equal(['log level 2']);

        auxiliaries.log(auxiliaries.LogLevel.Info, 'log level 3');
        expect(finfo.lastCall.args).to.deep.equal(['log level 3']);

        auxiliaries.log(auxiliaries.LogLevel.Debug, 'log level 4');
        expect(fdebug.lastCall.args).to.deep.equal(['log level 4']);

        auxiliaries.log(5, 'log level 5');
        expect(flog.callCount).to.equal(1);
        expect(fdebug.lastCall.args).to.deep.equal(['log level 4']); // uses previous output (nothing changed)

        const thresholdRestore = auxiliaries.logVerbosity();
        auxiliaries.logVerbosity(5);
        auxiliaries.log(5, 'log level 5');
        expect(flog.lastCall.args).to.deep.equal(['log level 5']);

        auxiliaries.logVerbosity(-1);
        auxiliaries.log(0, 'log level 0');
        expect(flog.lastCall.args).to.deep.equal(['log level 5']);

        auxiliaries.logVerbosity(thresholdRestore);

        consoleErrorStub.restore();
        consoleWarnStub.restore();
        consoleInfoStub.restore();
        consoleDebugStub.restore();
        consoleLogStub.restore();
    });

    it('can be called with more parameters', () => {
        const f = fake();
        const consoleWarnStub = stub(console, 'warn').callsFake(f);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1', { error: 'broke', code: 42 });
        expect(f.lastCall.args).to.deep.equal(['log level 1', { error: 'broke', code: 42 }]);

        consoleWarnStub.restore();
    });
});


describe('auxiliaries prettyPrintBytes', () => {

    it('should print bytes for bytes < 1024', () => {
        expect(auxiliaries.prettyPrintBytes(0)).to.equal('0B');
        expect(auxiliaries.prettyPrintBytes(1023)).to.equal('1023B');
    });

    it('should print kibi bytes for bytes between 1024, 1048575', () => {
        expect(auxiliaries.prettyPrintBytes(1024)).to.equal('1.000KiB');
        expect(auxiliaries.prettyPrintBytes(1048575)).to.equal('1023.999KiB');
    });

});


describe('auxiliaries prettyPrintMilliseconds', () => {

    it('should convert and use correct suffixes', () => {
        expect(auxiliaries.prettyPrintMilliseconds(0.00)).to.equal('0.000ms');
        expect(auxiliaries.prettyPrintMilliseconds(1e+0)).to.equal('1.000ms');

        expect(auxiliaries.prettyPrintMilliseconds(1e+1)).to.equal('10.000ms');
        expect(auxiliaries.prettyPrintMilliseconds(1e+2)).to.equal('0.100s');
        expect(auxiliaries.prettyPrintMilliseconds(1e+3)).to.equal('1.000s');
        expect(auxiliaries.prettyPrintMilliseconds(1e+4)).to.equal('10.000s');
        expect(auxiliaries.prettyPrintMilliseconds(1e+5)).to.equal('100.000s');

        expect(auxiliaries.prettyPrintMilliseconds(1e-1)).to.equal('0.100ms');
        expect(auxiliaries.prettyPrintMilliseconds(1e-2)).to.equal('10.000μs');
        expect(auxiliaries.prettyPrintMilliseconds(1e-3)).to.equal('1.000μs');
        expect(auxiliaries.prettyPrintMilliseconds(1e-4)).to.equal('0.100μs');
        expect(auxiliaries.prettyPrintMilliseconds(1e-5)).to.equal('10.000ns');
        expect(auxiliaries.prettyPrintMilliseconds(1e-6)).to.equal('1.000ns');
        expect(auxiliaries.prettyPrintMilliseconds(1e-7)).to.equal('0.100ns');
        expect(auxiliaries.prettyPrintMilliseconds(1e-8)).to.equal('0.010ns');
        expect(auxiliaries.prettyPrintMilliseconds(1e-9)).to.equal('0.001ns');
    });

});


describe('auxiliaries GETsearch, GETparameter', () => {

    it('should return value of present parameters', () => {
        (global.window as any) = { location: { search: '?test=true' } };
        expect(auxiliaries.GETsearch()).to.equal('?test=true');
        expect(auxiliaries.GETparameter('test')).to.equal('true');
    });

    it('should return the value of the top frame if the current frame does not have any', () => {
        (global.window as any) = {
            location: {
                search: ''
            },
            top: {
                location: {
                    search: '?test=true'
                }
            }
        };
        expect(auxiliaries.GETsearch()).to.equal('?test=true');
        expect(auxiliaries.GETparameter('test')).to.equal('true');
    });

    it('should return the value of the current frame, if it has one -- independent of its top frame', () => {
        (global.window as any) = {
            location: {
                search: '?currentFrame=1'
            },
            top: {
                location: {
                    search: '?test=true'
                }
            }
        };
        expect(auxiliaries.GETsearch()).to.equal('?currentFrame=1');
        expect(auxiliaries.GETparameter('currentFrame')).to.equal('1');
    });

});


describe('auxiliaries path', () => {

    it('should return the directory name of a file path', () => {
        expect(auxiliaries.dirname('https://localhost/file.ext')).to.equal('https://localhost');
        expect(auxiliaries.dirname('file.ext')).to.equal('');

        expect(auxiliaries.dirname('localhost/file')).to.equal('localhost');
        expect(auxiliaries.dirname('localhost/dir/')).to.equal('localhost/dir');
    });

    it('should return the base name of a file path', () => {
        expect(auxiliaries.basename('https://localhost/file.ext')).to.equal('file.ext');
        expect(auxiliaries.basename('file.ext')).to.equal('file.ext');

        expect(auxiliaries.basename('localhost/file')).to.equal('file');
        expect(auxiliaries.basename('localhost/dir/')).to.equal('');
    });

});
