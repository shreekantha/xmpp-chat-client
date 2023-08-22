import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as XMPP from 'stanza';

@Component({
  selector: 'app-xmpp-chat',
  templateUrl: './xmpp-chat.component.html',
  styleUrls: ['./xmpp-chat.component.css']
})
export class XmppChatComponent implements OnInit,AfterViewChecked {
  @ViewChild('chatWindow') private messageContainerRef: ElementRef;
  messages = [];
  inputMessage = '';
  client: any; // Type properly based on the XMPP library types

  constructor(private cdRef: ChangeDetectorRef) {
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
      this.fetchChatHistory();
      this.client.on('message', (msg) => {
        // console.log('on chat:', msg);

        this.handleIncomingMessage(msg);
      });
    });
  }

  ngOnInit() {
    this.client.connect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    const container = this.messageContainerRef.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  fetchChatHistory = async () => {
    try {
      const { results: history } = await this.client.searchHistory("shree@emagnavm1.cs29d9cloud.internal", { with: "vaishu@emagnavm1.cs29d9cloud.internal" });
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
          type: message.from.split('@')[0] === 'shree' ? 'sent' : 'received',
          message: messageWithLinks
        }
        return msg
      }
      );
      // console.log("prep messages:", this.messages);
      this.cdRef.detectChanges()
      this.scrollToBottom();
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
    console.log("from vaishu:incoming message:", msg)
    this.cdRef.detectChanges()


  }

  handleInputChange(event) {
    this.inputMessage = event.target.value;
  }

  handleSendMessage() {
    const formattedMessage = this.inputMessage;

    this.messages.push({ type: 'sent', message: formattedMessage });
    this.cdRef.detectChanges()

    // Send message using XMPP
    this.client.sendMessage({
      to: 'vaishu@emagnavm1.cs29d9cloud.internal', // Replace with the appropriate recipient JID
      body: this.inputMessage
    });
    this.inputMessage = '';
    this.scrollToBottom()

  }


}
