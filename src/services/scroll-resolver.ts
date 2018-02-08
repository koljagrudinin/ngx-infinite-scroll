import { IPositionStats, IScrollState, IScrollerDistance } from '../models';

export class ScrollResolverService {

    getScrollStats(
        lastScrollPosition: number,
        container: IPositionStats,
        distance: IScrollerDistance
    ) {
        const scrollDown = this.isScrollingDownwards(lastScrollPosition, container);
        return {
            fire: this.shouldFireScrollEvent(container, distance, scrollDown),
            scrollDown
        };
    }

    updateTriggeredFlag(scroll, scrollState: IScrollState, triggered: boolean, isScrollingDown: boolean) {
        if (isScrollingDown) {
            scrollState.triggered.down = scroll;
        } else {
            scrollState.triggered.up = scroll;
        }
    }

    isTriggeredScroll(totalToScroll, scrollState: IScrollState, isScrollingDown: boolean) {
        return isScrollingDown
            ? scrollState.triggered.down === totalToScroll
            : scrollState.triggered.up === totalToScroll;
    }

    updateScrollState(
        scrollState: IScrollState, scrolledUntilNow: number, totalToScroll: number) {
        this.updateScrollPosition(scrolledUntilNow, scrollState);
        this.updateTotalToScroll(totalToScroll, scrollState);
    }

    updateTotalToScroll(totalToScroll: number, scrollState: IScrollState) {
        if (scrollState.lastTotalToScroll !== totalToScroll) {
            scrollState.lastTotalToScroll = scrollState.totalToScroll;
            scrollState.totalToScroll = totalToScroll;
        }
    }

    isSameTotalToScroll(scrollState: IScrollState) {
        return scrollState.totalToScroll === scrollState.lastTotalToScroll;
    }

    private updateScrollPosition(position: number, scrollState: IScrollState) {
        return (scrollState.lastScrollPosition = position);
    }

    private shouldFireScrollEvent(
        container: IPositionStats,
        distance: IScrollerDistance,
        scrollingDown: boolean
    ) {
        let remaining: number;
        let containerBreakpoint: number;
        const scrolledUntilNow = container.height + container.scrolled;
        if (scrollingDown) {
            remaining = (container.totalToScroll - scrolledUntilNow) / container.totalToScroll;
            containerBreakpoint = distance.down / 10;
        } else {
            remaining = scrolledUntilNow / container.totalToScroll;
            containerBreakpoint = distance.up / 10;
        }

        const shouldFireEvent: boolean = remaining <= containerBreakpoint;
        return shouldFireEvent;
    }

    private isScrollingDownwards(
        lastScrollPosition: number,
        container: IPositionStats
    ) {
        return lastScrollPosition < container.scrolled;
    }
};