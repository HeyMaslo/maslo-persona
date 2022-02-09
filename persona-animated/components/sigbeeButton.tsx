import React, { Component } from 'react';
import {StyleSheet, Text, Pressable } from 'react-native';
import LottieView from "lottie-react-native";

export default class SigBeeButton extends React.Component {

    constructor(props){
      super(props);
      this.timerSource = require("../assets/animations/timer.json");
    }

    componentDidMount(){
      this.animation.play();
    }

    render() {
      return (
      <Pressable style={this.props.buttonStyle} onPress={this.props.onPress}>
        <Text style={this.props.textStyle}>{this.props.text}</Text>
        <LottieView
            ref={animation => {
              this.animation = animation;
            }}
            style={this.props.queued == true ? styles.timerActive : styles.timerInactive}
            source={this.timerSource}
            loop={true}
            autoPlay
            />
      </Pressable>
      );
    }
  }

  const styles = StyleSheet.create({
    buttonStyle: {

    },
    timerActive: {
      position:"absolute",
      opacity:0.6,
      left:5,
      marginTop:0,
      width:30,
      height:30
    },
    timerInactive: {
      opacity:0,
      position:"absolute",
      right:0
    }
  });
    