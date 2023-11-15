import { describe, expect, test } from '@jest/globals';
import OnePageNav from '../src/OnePageNav';

describe('OnePageNavTests', () => {
    test('should return object without undefined options', () => {
        let onePageNav = new OnePageNav({ changeOffset: 33, debugLine: true });
        expect(onePageNav.options.changeOffset).toBe(33);
        expect(onePageNav.options.debugLine).toBe(true);
    });

    test('set should refresh the value correctly', () => {
        let onePageNav = new OnePageNav();
        onePageNav.set('debugLine', true);
        onePageNav.set('debugLine', false);
        onePageNav.set('debugLine', true);
        onePageNav.set('debugLine', false);
        onePageNav.set('debugLine', true);
        expect(onePageNav.options.debugLine).toBe(true);
    });
});
