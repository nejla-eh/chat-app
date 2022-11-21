import React, { Component } from "react";
import { View, Text, KeyboardAvoidingView } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
// import firebase from "firebase";
// import firestore from "firebase";

const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyCFUHmc8vTMbgoocmN8iF-0uXcl3bK7sz4",
        authDomain: "chatapp-d780a.firebaseapp.com",
        projectId: "chatapp-d780a",
        storageBucket: "chatapp-d780a.appspot.com",
        messagingSenderId: "598256853064",
        appId: "1:598256853064:web:8c8ddce4eff8397b06b87d",
      });
    }

    this.referenceChatMessages = firebase.firestore().collection("messages");
  }

  componentDidMount() {
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    this.referenceChatMessages = firebase.firestore().collection("messages");
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user?.uid,
        messages: [],
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        const message = messages[0];
        this.addMessage(message);
      }
    );
  }

  //Get the data
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      console.log(doc);
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({ messages });
  };

  addMessage(message) {
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: message.user,
      uid: this.state.uid,
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  //Bubble customization
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#fff",
          },
          right: {
            backgroundColor: "#894c9c",
          },
        }}
      />
    );
  }

  render() {
    const { color } = this.props.route.params;
    return (
      <View style={{ flex: 1, backgroundColor: color }}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
