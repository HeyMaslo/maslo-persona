import React, { Component } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import LottieView from "lottie-react-native";

export default class SigBeeAnimation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            opacity: new Animated.Value(1),
            activeAnimation: 1,
            animation: [],
            overlayAnimations: [],
            playing: false,
            nextAnimation: -1,
            currentOverlayAnimation: null,
            activeColor: "yellow",
            sources: [
                {
                    source: require("../assets/animations/sigbee-static.json"),
                    name: "Static"
                },
                {
                    source: require("../assets/animations/sigbee-introA.json"),
                    name: "Intro"
                },
                {
                    source: require("../assets/animations/sigbee-celebrate.json"),
                    name: "Celebrate"
                },
                {
                    source: require("../assets/animations/sigbee-thinking.json"),
                    name: "Thinking"
                },
                {
                    source: require("../assets/animations/sigbee-loading.json"),
                    name: "Loading"
                },
                {
                    source: require("../assets/animations/sigbee-sad.json"),
                    name: "Sad"
                },
                {
                    source: require("../assets/animations/sigbee-dance.json"),
                    name: "Dance"
                },
                {
                    source: require("../assets/animations/sigbee-pulse.json"),
                    name: "Pulse"
                },
                {
                    source: require("../assets/animations/sigbee-pulse.json"),
                    name: "Pulse Confetti"
                }
            ],
        }
    }

    componentDidMount() {
        this.playAnimation(1);
    }

    renderOverlayAnimations() {

        let overlayAnimations = [];

        overlayAnimations.push(
            <LottieView
                key={"overlayAnimationConfetti"}
                style={[lstyle.confettiAnimation, this.state.currentOverlayAnimation == "confetti" ? lstyle.activeOverlayAnimation : lstyle.inactiveOverlayAnimation]}
                source={require("../assets/animations/confetti_2.json")}
                loop={false}
                onAnimationFinish={() => {
                    this.overlayAnimationComplete("confetti");
                }}
                ref={animation => {
                    this.state.overlayAnimations["confetti"] = animation;
                }}
            />);

        overlayAnimations.push(
            <LottieView
                key={"overlayAnimationNodes"}
                style={[lstyle.nodesAnimation, this.state.currentOverlayAnimation == "circles" ? lstyle.activeOverlayAnimation : lstyle.inactiveOverlayAnimation]}
                source={require("../assets/animations/circles.json")}
                loop={false}
                onAnimationFinish={() => {
                    this.overlayAnimationComplete("circles");
                }}
                ref={animation => {
                    this.state.overlayAnimations["circles"] = animation;
                }}
            />);

        overlayAnimations.push(
            <LottieView
                key={"overlayAnimationRain"}
                style={[lstyle.nodesAnimation, this.state.currentOverlayAnimation == "rain" ? lstyle.activeOverlayAnimation : lstyle.inactiveOverlayAnimation]}
                source={require("../assets/animations/rain.json")}
                loop={false}
                onAnimationFinish={() => {
                    this.overlayAnimationComplete("rain");
                }}
                ref={animation => {
                    this.state.overlayAnimations["rain"] = animation;
                }}
            />);

        overlayAnimations.push(
            <LottieView
                key={"overlayAnimationCirclePulse"}
                style={[lstyle.nodesAnimation, this.state.currentOverlayAnimation == "circlePulse" ? lstyle.activeOverlayAnimation : lstyle.inactiveOverlayAnimation]}
                source={require("../assets/animations/circle-pulse.json")}
                loop={false}
                onAnimationFinish={() => {
                    this.overlayAnimationComplete("circlePulse");
                }}
                ref={animation => {
                    this.state.overlayAnimations["circlePulse"] = animation;
                }}
            />);

        return overlayAnimations;
    }

    playAnimation(value){
        if(this.state.playing && this.state.activeAnimation != 0){
            if(this.state.nextAnimation == -1){
                this.setState({nextAnimation:value});
            }
            return;
        }
        this.setState({activeAnimation:value});
        if(value != 0){
            this.state.animation[value].play();
        }
        switch(value){
            case 1:
                // setTimeout(() => {
                //     this.playOverlayAnimation("circles");
                // }, 600);
            break;
            case 2:
                setTimeout(() => {
                    this.playOverlayAnimation("confetti");
                }, 1700);
            break;
            case 5:
                setTimeout(() => {
                    this.playOverlayAnimation("rain");
                }, 10);
            break;
            case 7:
                setTimeout(() => {
                    this.playOverlayAnimation("circlePulse");
                }, 10);
            break;
            case 8:
                setTimeout(() => {
                    this.playOverlayAnimation("confetti");
                }, 10);
            break;
        }
        this.state.playing = true;
    }

    playOverlayAnimation(animation){
        this.state.overlayAnimations[animation].style = lstyle.activeOverlayAnimation;
        this.state.overlayAnimations[animation].play();
        this.setState({
            currentOverlayAnimation:animation
        })
    }

    renderAnimations() {

        let lottieViews = [];

        let s = 0;
        for (let source of this.state.sources) {
            let s2 = s;
            lottieViews.push(
                <LottieView
                    key={s}
                    style={this.state.activeAnimation == s2 ? lstyle.activeAnimation : lstyle.inactiveAnimation}
                    source={source.source}
                    loop={false}
                    onAnimationFinish={() => {
                        this.animationComplete(s2);
                    }}
                    ref={animation => {
                        this.state.animation[s2] = animation;
                    }}
                />
            );
            s++;
        }

        return lottieViews;
    }

    animationComplete(value){
        if(value == this.state.activeAnimation){
            this.state.playing = false;
            if(this.state.nextAnimation >= 0){
                this.playAnimation(this.state.nextAnimation);
                this.state.nextAnimation = -1;
            } else {
                this.playAnimation(0);
            }
        }
    }


    render() {

        let containerStyle = [lstyle.appWrapper, lstyle["appWrapper_" + this.state.activeColor]];

        return (
            <View style={[containerStyle, { opacity: this.state.opacity }]}>
                <View style={lstyle.overlayAnimationWrapper} pointerEvents="none">
                    {this.renderOverlayAnimations()}
                </View>
                <View style={lstyle.animationWrapper}>
                    {this.renderAnimations()}
                </View>
            </View>
        );
    }
}

const lstyle = StyleSheet.create({
    overlayAnimationWrapper: {
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        padding: 0,
        margin: 0,
        position: "absolute",
        backgroundColor: "rgba(255,0,0,0)",
        elevation: 0,
        zIndex: 10,
        transform: [{ scale: 1 }, { translateY: -85 }, { translateX: 0 }],
    },
    activeOverlayAnimation: {
        opacity: 1
    },
    inactiveOverlayAnimation: {
        opacity: 0
    },
    confettiAnimation: {
        transform: [{ scale: 1.4 }, { translateY: -16 }, { translateX: 0 }],
    },
    nodesAnimation: {
        transform: [{ scale: 1.25 }],

    },
    timer: {
        width: 100,
        height: 100,
        position: "absolute",
        backgroundColor: "red"
    },
    appWrapper: {
        flex: 1,
        backgroundColor: "#fdc300",
        width: "100%",
        height: "100%",
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: 30
    },
    appWrapper_yellow: {
        backgroundColor: "#fdc300",
    },
    appWrapper_gray: {
        backgroundColor: "#909CAD",
    },
    appWrapper_darkgray: {
        backgroundColor: "#353c47",
    },
    animationWrapper: {
        flex: 8
    },
    colorSelectorWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 0,
        justifyContent: "center",
        borderRadius: 30,
        padding: 15
    },
    animationButtonWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 0,
        borderRadius: 30,
        padding: 15
    },
    activeColorButton: {
        maxHeight: 30,
        minWidth: 30,
        maxWidth: 30,
        borderRadius: 100,
        borderWidth: 5,
        borderColor: "white",
        minHeight: 50,
        marginRight: 10
    },
    inactiveColorButton: {
        maxHeight: 30,
        minWidth: 30,
        maxWidth: 30,
        borderRadius: 100,
        borderWidth: 5,
        borderColor: "rgba(0,0,0,0)",
        minHeight: 50,
        marginRight: 10
    },
    colorButton_yellow: {
        backgroundColor: "#fdc300"
    },
    colorButton_gray: {
        backgroundColor: "#909CAD"
    },
    colorButton_darkgray: {
        backgroundColor: "#353c47"
    },
    activeButton: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 25,
        elevation: 0,
        maxHeight: 50,
        minWidth: "33%",
        backgroundColor: 'rgba(255,255,255,1)',
        borderWidth: 5,
        borderColor: "rgba(0,0,0,0)"
    },
    inactiveButton: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        elevation: 0,
        minWidth: "33%",
        maxHeight: 50,
        backgroundColor: 'transparent',
        borderWidth: 5,
        borderColor: "rgba(0,0,0,0)"
    },
    activeButtonText: {
        fontSize: 12,
        lineHeight: 15,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: '#333333'
    },
    inactiveButtonText: {
        fontSize: 12,
        lineHeight: 15,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: '#000000',
        opacity: 0.5
    },
    activeAnimation: {
        position: "absolute",
        opacity: 1
    },
    inactiveAnimation: {
        position: "absolute",
        opacity: 0
    },
});
