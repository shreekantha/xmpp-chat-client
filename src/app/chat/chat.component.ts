import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { log } from 'console';
import * as XMPP from 'stanza';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  public messages = [];
  public inputMessage = '';
  client: any; // Type properly based on the XMPP library types

  constructor(private cdRef: ChangeDetectorRef) {
    this.client = XMPP.createClient({
      jid: 'vaishu@chat.emagna.in',
      password: '123',
      transports: {
        // websocket: 'ws://localhost:5222/xmpp-websocket',
        bosh: 'https://chat.emagna.in/http-bind'
      }
    });

    this.client.on('session:started', () => {
      this.client.getRoster();
      this.client.sendPresence();
      this.fetchChatHistory()
      this.client.on('message', (msg) => {
        // console.log('on chat:', msg);
      
        this.handleIncomingMessage(msg);
      });
    });
  }

  ngOnInit() {
    this.client.connect();
  }


  fetchChatHistory = async () => {
    try {
      const { results: history } = await this.client.searchHistory("vaishu@emagnavm1.cs29d9cloud.internal", { with: "shree@emagnavm1.cs29d9cloud.internal" });
      console.log("history:", history);
      this.messages = [];

      this.messages = history.map((item) => {
        const { message } = item.item;
        // console.log("Item:",message.body);
        const messageWithLinks=message.body?message.body.replace(
          /((http|https):\/\/[^\s]+)/g,
          '<a href="$1" target="_blank">$1</a>'
        ):message.body;
        const msg = {
          type: message.from.split('@')[0] === 'vaishu' ? 'sent' : 'received',
          message: messageWithLinks
        }
        return msg
      }
      );
      // console.log("prep messages:", this.messages);
      this.cdRef.detectChanges()

    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

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
    this.messages.push({ type: 'received', message: messageWithLinks });
    // console.log("from shree:incoming message:",msg)
    this.cdRef.detectChanges()

  }

  handleInputChange(event) {
    this.inputMessage = event.target.value;
  }

  handleSendMessage() {
    const formattedMessage = this.inputMessage.replace(
      /((http|https):\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );;
    this.messages.push({ type: 'sent', message: formattedMessage });
    // Send message using XMPP
    this.client.sendMessage({
      to: 'shree@emagnavm1.cs29d9cloud.internal', // Replace with the appropriate recipient JID
      body: this.inputMessage
    });
    this.inputMessage='';
    this.cdRef.detectChanges()

  }


}
