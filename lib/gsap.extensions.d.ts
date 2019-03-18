
import * as gsap from 'gsap';

export declare module 'gsap' {
    export interface TimelineMax {
        to<T>(
            target: T,
            duration: number,
            vars: Partial<T> & { ease?: gsap.Ease, delay?: number },
            position?: number | string
        ): TimelineMax;
    }
}