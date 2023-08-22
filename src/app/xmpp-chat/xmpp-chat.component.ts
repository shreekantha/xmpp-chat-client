import { Component, OnInit } from '@angular/core';
import * as XMPP from 'stanza';

@Component({
  selector: 'app-xmpp-chat',
  templateUrl: './xmpp-chat.component.html',
  styleUrls: ['./xmpp-chat.component.css']
})
export class XmppChatComponent implements OnInit {

  messages = [];
  inputMessage = '';
  client: any; // Type properly based on the XMPP library types

  constructor() {
    this.client = XMPP.createClient({
      jid: 'shree@chat.emagna.in',
      password: '123',
      transports: {
        // websocket: 'ws://localhost:5222/xmpp-websocket',
        bosh: 'https://chat.emagna.in/http-bind'
      }
    });

    this.client.on('session:started', () => {
      this.client.getRoster();
      this.client.sendPresence();
      this.client.on('message', (msg) => {
        console.log('on chat:', msg);
        const senderName = this.getSenderNameFromJID(msg.from);
        const messageWithLinks = msg.body.replace(
          /((http|https):\/\/[^\s]+)/g,
          '<a href="$1" target="_blank">$1</a>'
        );
        this.messages.push({ type: 'received', text: messageWithLinks });
        console.log("from vaishu:incoming message:",msg)
        // this.handleIncomingMessage(msg);
      });
    });
  }

  ngOnInit() {
    this.client.connect();
  }

  getSenderNameFromJID(jid) {
    const name = jid.split('@')[0];
    return name;
  }

  handleIncomingMessage(msg) {
    const senderName = this.getSenderNameFromJID(msg.from);
    const messageWithLinks = msg.body.replace(
      /((http|https):\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );
    this.messages.push({ type: 'received', text: messageWithLinks });
    console.log("from vaishu:incoming message:",msg)

  }

  handleInputChange(event) {
    this.inputMessage = event.target.value;
  }

  handleSendMessage() {
    const formattedMessage = this.inputMessage;

    this.messages.push({ type: 'sent', text: formattedMessage });

    // Send message using XMPP
    this.client.sendMessage({
      to: 'vaishu@emagnavm1.cs29d9cloud.internal', // Replace with the appropriate recipient JID
      body: this.inputMessage
    });
  }


}
