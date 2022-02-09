import React, { useRef, useState } from 'react';
import LottieView from "lottie-react-native";
import AnimatedLottieView from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Types of animations that the bee can perform.
 */
export enum AnimationType {
    Intro = 0,
    Pulse,
    Thinking,
    Celebrate,
    Static
};

const root = "../../persona-animated/assets/animations";
const cachedAnimations = { 
    [AnimationType.Intro]: require(`${root}/sigbee-intro-yellow-lj.json`),
    [AnimationType.Pulse]: require(`${root}/sigbee-pulse-yellow-lj.json`),
    [AnimationType.Thinking]: require(`${root}/sigbee-thinking-yellow-lj.json`),
    [AnimationType.Celebrate]: require(`${root}/sigbee-celebrate-yellow-lj.json`),
    [AnimationType.Static]: require(`${root}/sigbee-static-yellow-lj.json`),
};

const loopingAnimations = [AnimationType.Pulse];

export interface Props {
    animation: AnimationType,
    style?: StyleProp<ViewStyle>,
    disabled?: boolean
};

export function BeeAnimation(props: Props) {
    const [source, setSource] = useState(props.animation);
    const [shouldLoop, setShouldLoop] = useState(false);

    const ref = useRef<AnimatedLottieView>();

    const advanceState = function() {
        if (loopingAnimations.indexOf(source) == -1) {
            // TODO: There's a bug in the Lottie framework that causes a brief
            // flash of white whenever 'source' is changed.  To minimize the 
            // odds of a flash, instead of transitioning to 'Static', we simply
            // let an animation end (in all cases so far, all animations end on
            // the keyframe that 'Static' shows anyway).

            // setSource(AnimationType.Static);
            return;
        }

        setShouldLoop(true);
        ref.current?.play();
    }

    return (        
        !props.disabled && 
        <LottieView
            ref={ref}
            enableMergePathsAndroidForKitKatAndAbove={true}
            source={cachedAnimations[props.animation]}            
            onAnimationFinish={advanceState}
            autoPlay
            loop={shouldLoop}
            style={props.style}
            />        
    );
}