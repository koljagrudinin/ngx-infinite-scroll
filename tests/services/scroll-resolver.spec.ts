import { ScrollResolverService } from '../../src/services/scroll-resolver';
import { IScrollState } from 'src/models';

const scrollResolverService = new ScrollResolverService()

describe('Manage Scroll State', () => {
    it('should backup old Total and update the new one', () => {
        const state = {
            totalToScroll: 10,
            lastTotalToScroll: 0
        } as any;
        const newTotal = 20;
        scrollResolverService.updateTotalToScroll(newTotal, state);
        const actual = state.totalToScroll;
        const expected = newTotal;
        expect(actual).toEqual(expected);
    });

    it('should return false when total != lastTotal', () => {
        const state = {
            totalToScroll: 10,
            lastTotalToScroll: 0
        } as any;
        const actual = scrollResolverService.isSameTotalToScroll(state);
        expect(actual).toBeFalsy();
    });

    it('should return true total = lastTotal', () => {
        const state = {
            totalToScroll: 10,
            lastTotalToScroll: 10
        } as any;
        const actual = scrollResolverService.isSameTotalToScroll(state);
        expect(actual).toBeTruthy();
    });

    [
        {
            it: 'should set the triggered to down',
            down: true,
            state: {
                triggered: { down: 0 }
            } as IScrollState,
            prop: 'down'
        },
        {
            it: 'should set the triggered to up',
            down: false,
            state: {
                triggered: { up: 0 }
            } as IScrollState,
            prop: 'up'
        }
    ].forEach((spec) => {
        it(spec.it, () => {
            const total = 1000;
            scrollResolverService.updateTriggeredFlag(total, spec.state, true, spec.down);
            const actual = spec.state.triggered[spec.prop];
            expect(actual).toBe(total);
        });
    });
});
