
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
        const consoleLogStub = stub(console, 'log');
        auxiliaries.logIf(false, auxiliaries.LogLevel.Error, 'never log');
        expect(consoleLogStub.notCalled).to.be.true;
        consoleLogStub.restore();
    });

    it('should log on true expression', () => {
        const consoleLogStub = stub(console, 'log');
        auxiliaries.logIf(true, auxiliaries.LogLevel.Error, 'always log');
        expect(consoleLogStub.calledOnce).to.be.true;
        consoleLogStub.restore();
    });

    it('should use the correct log level', () => {
        const f = fake();
        const consoleLogStub = stub(console, 'log').callsFake(f);

        auxiliaries.log(auxiliaries.LogLevel.Error, 'log level 0');
        expect(f.lastCall.args).to.deep.equal(['[0]', 'log level 0']);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1');
        expect(f.lastCall.args).to.deep.equal(['[1]', 'log level 1']);

        auxiliaries.log(auxiliaries.LogLevel.Info, 'log level 2');
        expect(f.lastCall.args).to.deep.equal(['[2]', 'log level 2']);

        auxiliaries.log(auxiliaries.LogLevel.Debug, 'log level 3');
        expect(f.lastCall.args).to.deep.equal(['[3]', 'log level 3']);

        consoleLogStub.restore();
    });

    it('should respect verbosity level', () => {
        const f = fake();
        const consoleLogStub = stub(console, 'log').callsFake(f);

        auxiliaries.log(auxiliaries.LogLevel.Error, 'log level 0');
        expect(f.lastCall.args).to.deep.equal(['[0]', 'log level 0']);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1');
        expect(f.lastCall.args).to.deep.equal(['[1]', 'log level 1']);

        auxiliaries.log(auxiliaries.LogLevel.Info, 'log level 2');
        expect(f.lastCall.args).to.deep.equal(['[2]', 'log level 2']);

        auxiliaries.log(auxiliaries.LogLevel.Debug, 'log level 3');
        expect(f.lastCall.args).to.deep.equal(['[3]', 'log level 3']);

        auxiliaries.log(4, 'log level 4');
        expect(f.lastCall.args).to.deep.equal(['[3]', 'log level 3']); // uses previous output (nothing changed)

        const thresholdRestore = auxiliaries.logVerbosity();
        auxiliaries.logVerbosity(4);
        auxiliaries.log(4, 'log level 4');
        expect(f.lastCall.args).to.deep.equal(['[4]', 'log level 4']);

        auxiliaries.logVerbosity(-1);
        auxiliaries.log(0, 'log level 0');
        expect(f.lastCall.args).to.deep.equal(['[4]', 'log level 4']);

        auxiliaries.logVerbosity(thresholdRestore);
        consoleLogStub.restore();
    });

    it('can be called with more parameters', () => {
        const f = fake();
        const consoleLogStub = stub(console, 'log').callsFake(f);

        auxiliaries.log(auxiliaries.LogLevel.Warning, 'log level 1', { error: 'broke', code: 42 });
        expect(f.lastCall.args).to.deep.equal(['[1]', 'log level 1', { error: 'broke', code: 42 }]);

        consoleLogStub.restore();
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
