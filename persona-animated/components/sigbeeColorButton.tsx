import React, { Component } from 'react';
import {StyleSheet, Text, Pressable } from 'react-native';

export default class SigBeeColorButton extends React.Component {

    constructor(props){
      super(props);
    }

    render() {
      return (
      <Pressable style={this.props.buttonStyle} onPress={this.props.onPress}/>
      );
    }
  }

    