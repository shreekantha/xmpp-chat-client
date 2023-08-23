import { Component, OnInit } from '@angular/core';
import * as XMPP from 'stanza';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'xmpp-chat';

  messages = [];
  inputMessage = '';
  client: any; // Type properly based on the XMPP library types

  constructor() {
    // const user={
    //   username:"shree",
    //   ofp:"123"
    // }
    // localStorage.setItem("openfireUser",JSON.stringify(user))
  }

  ngOnInit() {
    // this.client.connect();
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
  }

  // handleInputChange(event) {
  //   this.inputMessage = event.target.value;
  // }

  // handleSendMessage() {
  //   const formattedMessage = this.inputMessage;

  //   this.messages.push({ type: 'sent', text: formattedMessage });

  //   // Send message using XMPP
  //   this.client.sendMessage({
  //     to: 'vaishu@emagnavm1.cs29d9cloud.internal', // Replace with the appropriate recipient JID
  //     body: this.inputMessage
  //   });
  // }

}
