export function shouldTriggerEvents(
    alwaysCallback: boolean,
    shouldFireScrollEvent: boolean,
    isTriggeredCurrentTotal: boolean) {
    return (alwaysCallback || shouldFireScrollEvent) && !isTriggeredCurrentTotal;
}
