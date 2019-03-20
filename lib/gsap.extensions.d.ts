
import * as gsap from 'gsap';

export declare module 'gsap' {

    export interface TweenConfig<T = any> extends Partial<T> { }

    export interface TimelineMax {
        to<T = any>(
            target: T,
            duration: number,
            vars: TweenConfig<T>,
            position?: number | string
        ): TimelineMax;

        fromTo<T = any>(
            target: T,
            duration: number,
            fromVars: TweenConfig<T>,
            toVars: {},
            position?: any
        ): TimelineMax;
    }

    namespace gsap.TweenMax {
        static function to<T = any>(target: T, duration: number, vars: TweenConfig<T>): TweenMax;
    }
}
