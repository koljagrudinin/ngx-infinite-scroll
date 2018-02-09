import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AxisResolver } from './axis-resolver';
import { shouldTriggerEvents } from './event-trigger';
import { UtilsService } from './ngx-ins-utils';
import { PositionResolverService } from './position-resolver';
import { ScrollResolverService } from './scroll-resolver';
import {
    IScrollRegisterConfig,
    IPositionStats,
    IScrollerDistance,
    IScrollParams,
    IInfiniteScrollAction,
    IScroller,
    IScrollState
} from 'src/models';

export const INFINITE_SCROLL_ACTIONS = {
    DOWN: '[NGX_ISE] DOWN',
    UP: '[NGX_ISE] UP'
};

export class ScrollRegisterService {

    constructor(private scrollResolver: ScrollResolverService,
        private positionResolverService: PositionResolverService,
        private utilsService: UtilsService) {

    }


    attachScrollEvent(options: IScrollRegisterConfig): Observable<{}> {
        return Observable
            .fromEvent(options.container, 'scroll')
            .sampleTime(options.throttle);
    }

    toInfiniteScrollParams(
        lastScrollPosition: number,
        stats: IPositionStats,
        distance: IScrollerDistance
    ): IScrollParams {
        const { scrollDown, fire } = this.scrollResolver.getScrollStats(
            lastScrollPosition,
            stats,
            distance
        );
        return {
            scrollDown,
            fire,
            stats
        };
    }

    toInfiniteScrollAction(response: IScrollParams): IInfiniteScrollAction {
        const { scrollDown, stats: { scrolled: currentScrollPosition } } = response;
        return {
            type: scrollDown ? INFINITE_SCROLL_ACTIONS.DOWN : INFINITE_SCROLL_ACTIONS.UP,
            payload: {
                currentScrollPosition
            }
        };
    }

    createScroller(config: IScroller) {
        const { scrollContainer, scrollWindow, element, fromRoot } = config;
        const resolver = this.positionResolverService.createResolver({
            axis: new AxisResolver(!config.horizontal),
            windowElement: this.utilsService.resolveContainerElement(scrollContainer, scrollWindow, element, fromRoot)
        });
        const { totalToScroll: startWithTotal } = this.positionResolverService.calculatePoints(
            element, resolver);
        const scrollState: IScrollState = {
            lastScrollPosition: 0,
            lastTotalToScroll: 0,
            totalToScroll: startWithTotal,
            triggered: {
                down: 0,
                up: 0
            }
        };
        const options: IScrollRegisterConfig = {
            container: resolver.container,
            throttle: config.throttle
        };
        const distance = {
            up: config.upDistance,
            down: config.downDistance
        };
        return this.attachScrollEvent(options)
            .mergeMap((ev: any) => Observable.of(this.positionResolverService.calculatePoints(element, resolver)))
            .map((positionStats: IPositionStats) =>
                this.toInfiniteScrollParams(scrollState.lastScrollPosition, positionStats, distance))
            .do(({ stats, scrollDown }: IScrollParams) =>
                this.scrollResolver.updateScrollState(
                    scrollState,
                    stats.scrolled,
                    stats.totalToScroll,
                ))
            .filter(({ fire, scrollDown, stats: { totalToScroll } }: IScrollParams) =>
                shouldTriggerEvents(
                    fire,
                    config.alwaysCallback,
                    this.scrollResolver.isTriggeredScroll(
                        totalToScroll, scrollState, scrollDown))
            )
            .do(({ scrollDown, stats: { totalToScroll } }: IScrollParams) => {
                this.scrollResolver.updateTriggeredFlag(totalToScroll, scrollState, true, scrollDown);
            })
            .map(this.toInfiniteScrollAction);
    }
}