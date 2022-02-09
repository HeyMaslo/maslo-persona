import { PersonaViewState } from '@persona-core';
import React, { Children, ReactNode, useRef, useState } from 'react';
import { Animated, Dimensions, PixelRatio, View } from 'react-native';
import { isContext } from 'vm';
import { AnimationType, BeeAnimation } from './BeeAnimation';
import { IPersonaContext } from './context';
import GSAP from 'gsap';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

const DEBUG_SHOW_BOUNDARIES = false;

export interface Props {
    nextPosition?: {x: number, y: number},
    children: JSX.Element
}

const BeeAnimationPositioner = observer(function(props: Props) {
    const x = 0;
    const y = 0;

    const prevX = useRef(props.nextPosition.x);
    const prevY = useRef(-props.nextPosition.y);
    const anim = useRef(new Animated.Value(0)).current;

    const { width: screenWidth, height: screenHeight } = computeWindowDimens();

    console.log("BEE SHOULD MOVE!");

    anim.setValue(0);

    const timing = Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      });

      setTimeout(() => {
        timing.reset();
        timing.start();            
    }, 250);

    const xVal = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [PixelRatio.roundToNearestPixel(prevX.current) - screenWidth / 4, PixelRatio.roundToNearestPixel(props.nextPosition.x) - screenWidth / 4]
    })

    const yVal = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [PixelRatio.roundToNearestPixel(prevY.current / 4) - screenWidth / 1.75, -PixelRatio.roundToNearestPixel(props.nextPosition.y / 4) - screenWidth / 1.75]
    })

    const animStyle = {
        transform: [
            {
                translateX: xVal
            },
            {
                translateY: yVal
            }
        ]
    }

    prevX.current = props.nextPosition.x;
    prevY.current = -props.nextPosition.y;
    
    return (
        <Animated.View         
            style={[{
            position: "absolute", 
            left: screenWidth / 2,
            top: screenHeight / 2,
            width: screenWidth / 2, 
            height: screenWidth / 2,
            backgroundColor: DEBUG_SHOW_BOUNDARIES ? "black" : "transparent"
            }, animStyle]}>
            {props.children}
        </Animated.View>
    );
})

export { BeeAnimationPositioner };

/**
 * 
 * @returns the dimensions of displayable window (the entire app), in pixels.
 */
function computeWindowDimens() {
    let { width, height } = Dimensions.get("window");
    width = PixelRatio.roundToNearestPixel(width);
    height = PixelRatio.roundToNearestPixel(height);

    return { width, height };
}

/**
 * 
 * @param value the value, either as a float (0.5) or percentage "50%"
 * @return A raw float (0.5)
 */
function computeRawPercent(value: number | string): number {
    if (typeof value === "number") {
        return value;
    } else {
        return parseFloat(value) / 100.0;
    }
}
