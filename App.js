import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
function randomAlphabet() {
  return String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65)
}

function Game(props) {
  const [current, setCurrent] = useState(randomAlphabet());
  const [typedString, setTypedString] = useState("");
  const [timer, setTimer] = useState(null);
  const [isTiming, setIsTiming] = useState(null);
  const [success, setSuccess] = useState(false);
  const [time, setTime] = useState(0);
  const [penalty, setPenalty] = useState(0);
  return (
    <View style={styles.container} keyboardShouldPersistTaps='always'>
      <View style={styles.viewBar}>
        <Text style={styles.heading}>Type the Alphabet</Text>
        <Text style={styles.text}>Typing game to see how fast you type. Timer starts when you do {":)"}</Text>
      </View>
      <View style={styles.charView}><Text style={styles.char}>{isTiming === null ? "Welcome!" : !isTiming ? success ? "Success!" : "Try again!" : current}</Text></View>
      <View style={styles.viewBar}>
        {time ? <Text style={styles.caption}>Time: {time.toFixed(2)}s + {penalty.toFixed(2)}s</Text> : null}
        {props.maxScore < Infinity ? <Text style={styles.text}>My best time: {props.maxScore.toFixed(2)}s</Text> : null}
      </View>
      <View style={styles.typeBar}>
        <TextInput
          style={styles.textInput}
          value={typedString}
          secureTextEntry={Platform.OS === 'ios' ? false : true}
          keyboardType={Platform.OS === 'ios' ? null : 'visible-password'}
          autoCapitalize="characters"
          onChangeText={(text) => {
            if (!isTiming) {
              setTime(0);
              setPenalty(0);
              setTimer(setInterval(() => {
                setTime((time) => time + 0.1)
              }, 100));
              setIsTiming(true);
              setSuccess(false);
            }
            else {
              //text = text.toUpperCase()
              if (text.length >= 20) {
                clearInterval(timer);
                setIsTiming(false);
                setTypedString("");
                if (props.maxScore > (time + penalty)) {
                  setSuccess(true);
                  props.setMaxScore((time + penalty));
                }
              }
              else {
                let lastText = text.charAt(text.length - 1);
                if (lastText === current) {
                  setTypedString(text);
                  setCurrent(randomAlphabet());
                } else {
                  setPenalty(penalty => penalty + 0.5);
                }
              }
            }
          }
          }
          autoFocus={true}
          blurOnSubmit={false}
          placeholder="Type here"
        />
        <Button onPress={() => {
          setCurrent(randomAlphabet());
          if (isTiming) {
            clearInterval(timer);
            setIsTiming(null);
            setTypedString("");
          }
          setSuccess(false);
        }} title="Reset" color="#f44" />
      </View>
      <StatusBar style='light' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005'
  },
  viewBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    margin: 5,
    fontWeight: "bold"
  },
  caption: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    margin: 5
  },
  text: {
    color: "#fff",
    textAlign: "center",
    margin: 5
  },
  textInput: {
    color: "#000",
    backgroundColor: "#ffc",
    flex: 1,
    textAlign: "center"
  },
  typeBar: {
    flexDirection: "row",
  },
  charView: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 48,
    borderRadius: 8,
    justifyContent: "center",
    flexDirection: "row",
    fontWeight: "bold"
  },
  char: {
    fontSize: 56,
    color: "#0a0",
    flex: 1,
    textAlign: "center"
  }
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxScore: Infinity
    }
  }
  async componentDidMount() {
    let score = parseFloat(await AsyncStorage.getItem("maxScore"));
    if (score) this.setState({ maxScore: score });
  }
  async setMaxScore(score) {
    this.setState({ maxScore: score });
    await AsyncStorage.setItem("maxScore", score + "");
  }
  render() {
    return <Game {...this.state} setMaxScore={score => this.setMaxScore(score)} />;
  }
}
