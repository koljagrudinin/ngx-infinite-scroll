import { Observable } from 'rxjs/Observable';
import {
    async,
    inject
} from '@angular/core/testing';
import { ScrollRegisterService, InfiniteScrollActions } from '../../src/services/scroll-register';
import { ScrollResolverService } from '../../src/services/scroll-resolver';
import { ElementRef } from '@angular/core';
import { PositionResolverService } from '../../src/services/position-resolver';
import { UtilsService } from '../../src/services/ngx-ins-utils';
import { IScrollRegisterConfig, IScrollerDistance, IPositionStats, IScrollParams } from '../../src/models';


const scrollResolverService = new ScrollResolverService();
const positionResolverService = new PositionResolverService();
const utilsService = new UtilsService();

const scrollRegisterService = new ScrollRegisterService(scrollResolverService, 
    positionResolverService, utilsService);

describe('Scroll Regsiter', () => {
    let mockedElement: ElementRef;
    let mockedContainer: ElementRef;

    const createMockDom = () => {
        const container = document.createElement('section');
        container.setAttribute('style', 'height: 500px; overflow-y: scroll');
        const el = document.createElement('div');
        el.setAttribute('style', 'height: 1000px;');
        container.appendChild(el);
        mockedElement = new ElementRef(el);
        mockedContainer = new ElementRef(container);
        return { element: mockedElement, container: mockedContainer };
    };

    // beforeEach(() => {

    // });

    it('should create a Observable of scroll observable', () => {
        const mockDom = createMockDom();
        const scrollConfig: IScrollRegisterConfig = {
            container: mockDom.container.nativeElement,
            throttle: 300,

        };
        const scroller$: Observable<{}> = scrollRegisterService.attachScrollEvent(scrollConfig);
        const actual = scroller$;
        expect(actual).toBeDefined();
    });

    it('should create a scroll params object', () => {
        const lastScrollPosition = 0;
        const positionStats = {} as IPositionStats;
        const distance = {
            down: 2,
            up: 3,
        } as IScrollerDistance;
        const scrollStats = {
            isScrollingDown: true,
            shouldFireScrollEvent: true
        };
        spyOn(scrollResolverService, 'getScrollStats').and.returnValue(scrollStats);
        const actual = scrollRegisterService.toInfiniteScrollParams(lastScrollPosition, positionStats, distance);
        const expected = 3;
        expect(Object.keys(actual).length).toEqual(expected);
    });

    describe('toInfiniteScrollAction', () => {
        let response;

        beforeEach(() => {
            response = {
                stats: {
                    scrolled: 100
                }
            } as IScrollParams;
        });

        [
            {
                it: 'should trigger down event when scrolling down',
                params: {
                    scrollDown: true
                },
                expected: InfiniteScrollActions.DOWN
            },
            {
                it: 'should trigger up event when scrolling up',
                params: {
                    scrollDown: false
                },
                expected: InfiniteScrollActions.UP
            }
        ].forEach((spec) => {
            it(spec.it, () => {
                const params = { ...response, ...spec.params };
                const actual = scrollRegisterService.toInfiniteScrollAction(params);
                expect(actual.type).toBe(spec.expected);
            });
        });
    });
});
