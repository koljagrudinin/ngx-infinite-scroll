import { ElementRef } from '@angular/core';

import { ContainerRef, IPositionElements, IPositionStats, IResolver } from '../models';
import { AxisResolver } from './axis-resolver';

export class PositionResolverService {
    createResolver({
  windowElement,
        axis
}: IPositionElements): IResolver {
        return this.createResolverWithContainer(
            { axis, isWindow: this.isElementWindow(windowElement) },
            windowElement
        );
    }

    calculatePoints(element: ElementRef, resolver: IResolver) {
        const height = this.extractHeightForElement(resolver);
        return resolver.isWindow
            ? this.calculatePointsForWindow(height, element, resolver)
            : this.calculatePointsForElement(height, element, resolver);
    }

    createResolverWithContainer(
        resolver,
        windowElement: ContainerRef
    ) {
        const container =
            resolver.isWindow || (windowElement && !windowElement.nativeElement)
                ? windowElement
                : windowElement.nativeElement;
        return { ...resolver, container };
    }

    private isElementWindow(windowElement: ContainerRef): boolean {
        const isWindow = ['Window', 'global'].some((obj: string) =>
            Object.prototype.toString.call(windowElement).includes(obj)
        );
        return isWindow;
    }

    private getDocumentElement(isContainerWindow: boolean, windowElement) {
        return isContainerWindow ? windowElement.document.documentElement : null;
    }

    private calculatePointsForWindow(
        height: number,
        element: ElementRef,
        resolver: IResolver
    ): IPositionStats {
        const { axis, container, isWindow } = resolver;
        const { offsetHeightKey, clientHeightKey } = this.extractHeightPropKeys(axis);
        // scrolled until now / current y point
        const scrolled =
            height +
            this.getElementPageYOffset(
                this.getDocumentElement(isWindow, container),
                axis,
                isWindow
            );
        // total height / most bottom y point
        const nativeElementHeight = this.getElementHeight(
            element.nativeElement,
            isWindow,
            offsetHeightKey,
            clientHeightKey
        );
        const totalToScroll =
            this.getElementOffsetTop(element.nativeElement, axis, isWindow) +
            nativeElementHeight;
        return { height, scrolled, totalToScroll };
    }

    private calculatePointsForElement(
        height: number,
        element: ElementRef,
        resolver: IResolver
    ): IPositionStats {
        const { axis, container } = resolver;
        // perhaps use container.offsetTop instead of 'scrollTop'
        const scrolled = container[axis.scrollTopKey()];
        const totalToScroll = container[axis.scrollHeightKey()];
        return { height, scrolled, totalToScroll };
    }

    private extractHeightPropKeys(axis: AxisResolver) {
        return {
            offsetHeightKey: axis.offsetHeightKey(),
            clientHeightKey: axis.clientHeightKey()
        };
    }

    private extractHeightForElement({
        container,
        isWindow,
        axis
}: IResolver) {
        const { offsetHeightKey, clientHeightKey } = this.extractHeightPropKeys(axis);
        return this.getElementHeight(
            container,
            isWindow,
            offsetHeightKey,
            clientHeightKey
        );
    }
    private getElementHeight(
        elem: any,
        isWindow: boolean,
        offsetHeightKey: string,
        clientHeightKey: string
    ) {
        if (isNaN(elem[offsetHeightKey])) {
            return this.getDocumentElement(isWindow, elem)[clientHeightKey];
        } else {
            return elem[offsetHeightKey];
        }
    }

    private getElementOffsetTop(
        elem: ContainerRef,
        axis: AxisResolver,
        isWindow: boolean
    ) {
        const topKey = axis.topKey();
        // elem = elem.nativeElement;
        if (!elem.getBoundingClientRect) {
            // || elem.css('none')) {
            return;
        }
        return (
            elem.getBoundingClientRect()[topKey] +
            this.getElementPageYOffset(elem, axis, isWindow)
        );
    }

    private getElementPageYOffset(
        elem: ContainerRef,
        axis: AxisResolver,
        isWindow: boolean
    ) {
        const pageYOffset = axis.pageYOffsetKey();
        const scrollTop = axis.scrollTopKey();
        const offsetTop = axis.offsetTopKey();

        if (isNaN(window[pageYOffset])) {
            return this.getDocumentElement(isWindow, elem)[scrollTop];
        } else if (elem.ownerDocument) {
            return elem.ownerDocument.defaultView[pageYOffset];
        } else {
            return elem[offsetTop];
        }
    }
}