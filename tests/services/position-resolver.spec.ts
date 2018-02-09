import { ElementRef } from '@angular/core';

import { ContainerRef } from '../../src/models';
import { AxisResolver } from '../../src/services/axis-resolver';
import { PositionResolverService } from '../../src/services/position-resolver';

const positionResolverService = new PositionResolverService();

describe('Position Resolver', () => {
    let mockedElement: ElementRef;
    let mockedContainer: ElementRef;
    let axis: AxisResolver;
    let mockDom: ContainerRef;

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

    beforeEach(() => {
        axis = new AxisResolver(false);
        mockDom = createMockDom();
    });

    describe('Resolver Maker', () => {
        it('should create an instance of position resolver', () => {
            const actual = positionResolverService.createResolver({
                axis,
                windowElement: mockDom.element,
            });
            expect(actual).toBeDefined();
        });

        it('should return the native element if container is not window', () => {
            mockDom.element.nativeElement = { mocked: true };
            const resolver = positionResolverService.createResolverWithContainer(
                {
                    axis,
                    isWindow: false
                },
                mockDom.element
            );
            const actual = resolver.container;
            const expected = mockDom.element.nativeElement;
            expect(actual).toEqual(expected);
        });
    });
});
