import { Injectable } from '@angular/core';
import * as XMPP from 'stanza';

@Injectable({
  providedIn: 'root'
})
export class XmppService {
  private client: any;
  public messages = [];
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
            this.handleIncomingMessage(msg);
          });
        });

        this.client.connect();

      }
      handleIncomingMessage(msg) {
        const senderName = this.getSenderNameFromJID(msg.from);
        const messageWithLinks = msg.body.replace(
          /((http|https):\/\/[^\s]+)/g,
          '<a href="$1" target="_blank">$1</a>'
        );
      this.messages.push({ type: 'received', text: messageWithLinks });
      }

      getSenderNameFromJID(jid) {
        const name = jid.split('@')[0];
        return name;
      }


    sendMessage(msg) {
        // const formattedMessage = this.inputMessage;
    
         this.messages.push({ type: 'sent', text: msg });
    
        // Send message using XMPP
        this.client.sendMessage({
          to: 'vaishu@emagnavm1.cs29d9cloud.internal', // Replace with the appropriate recipient JID
          body: msg
        });
      }
}
