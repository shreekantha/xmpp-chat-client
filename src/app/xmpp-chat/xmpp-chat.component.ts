import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as XMPP from 'stanza';
import { XmppService } from './xmpp.service';
import { log } from 'console';
import { RosterSubscription } from 'stanza/Constants';

@Component({
  selector: 'app-xmpp-chat',
  templateUrl: './xmpp-chat.component.html',
  styleUrls: ['./xmpp-chat.component.css']
})
export class XmppChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatWindow') private messageContainerRef: ElementRef;
  messages = [];
  groupedData = {}
  inputMessage = '';
  client: any; // Type properly based on the XMPP library types
  users = [];
  selectedUser: any;
  openfireUser: any;
  searchUser: any;
  contacts=[];
  constructor(private cdRef: ChangeDetectorRef, private xmppService: XmppService) {
    this.openfireUser = JSON.parse(localStorage.getItem("openfireUser"));
    this.client = XMPP.createClient({
      // jid: `shree@${environment.openfireFQDN}`,
      jid: `${this.openfireUser.jid}@${environment.openfireFQDN}`,
      password: this.openfireUser.ofp,
      resource: this.openfireUser.jid,
      transports: {
        // websocket: 'ws://localhost:5222/xmpp-websocket',
        bosh: environment.openfireDomain
      }
    });
    console.log("client:", this.client);
    this.client.on('session:started', () => {
      this.getContacts();
      this.client.sendPresence();
      // this.fetchChatHistory();
      this.client.on('message', (msg) => {
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

  getContacts(){
    this.client.getRoster().then(roster => {
      console.log("roster results:", roster.items)
      this.contacts=roster.items;
      this.cdRef.detectChanges();
    });

    // Listen for roster updates
this.client.on('roster', (roster) => {
  const contactJIDs = roster.map((item) => item.jid);
console.log("roster:",roster)
  // Subscribe to presence updates for all contacts
  // contactJIDs.forEach((contactJID) => {
  //   console.log("")
  //   this.client.sendPresence({ to: contactJID });  // Request presence updates
  // });
});

// Listen for presence updates
this.client.on('presence', (presence) => {
  console.log("presence:",presence)
  // console.log(`Contact ${presence.from} Presence: ${presence.show}`);
});
  }

  
  public search(event: any) {
    this.xmppService.searchUsers(event.target.value).subscribe(result => {
      console.log("users:", result);
      this.users = result;
    })
  }

  public selectUser(user) {
    this.selectedUser = user;
    this.users = [];
    this.searchUser = '';
    this.messages = [];
    this.fetchChatHistory();
    // this.client.updateRosterItem({
    //   jid:user.jid,
    //   subscription: RosterSubscription.To,
    //   name: user.name
    // },(error) => {
    //   if (!error) {
    //     console.log(`Roster item updated successfully: ${user.jid}`);
    //   } else {
    //     console.error(`Error updating roster item: ${error}`);
    //   }
    // })
    
  }



  scrollToBottom(): void {
    const container = this.messageContainerRef.nativeElement;
    container.scrollTop = container.scrollHeight+10;
  }

  fetchChatHistory = async () => {
    try {
      const { results: history } = await this.client.searchHistory(`${this.openfireUser.jid}@${environment.openfireFQDN}`, { with: `${this.selectedUser.jid}@${environment.openfireFQDN}` });
      console.log("history:", history);
      this.messages = [];

      this.messages = history.map((item) => {
        const { message, delay } = item.item;
        const messageWithLinks = this.getMessageBody(message);
        const msg = {
          type: message.from.split('@')[0] === this.openfireUser.jid ? 'sent' : 'received',
          message: messageWithLinks,
          date: delay.timestamp
        }
        return msg
      });
      this.groupedData = {};
      this.messages.forEach(item => {
        this.groupByDate(item);
      });
      console.log("prep messages:", this.groupedData);
      this.cdRef.detectChanges()
      this.scrollToBottom();
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  getMessageBody(message) {
    return message.body ? message.body.replace(
      /((http|https):\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    ) : message.body;
  }

  groupByDate(item) {
    const dateString = item.date.toISOString().substr(0, 10);
    if (!this.groupedData[dateString]) {
      this.groupedData[dateString] = [];
    }
    this.groupedData[dateString].push(item);
  }

  getSenderNameFromJID(jid) {
    const name = jid.split('@')[0];
    return name;
  }

  handleIncomingMessage(msg) {
    const senderName = this.getSenderNameFromJID(msg.from);
    const messageWithLinks = this.getMessageBody(msg);
    this.messages.push({ type: 'received', message: messageWithLinks });
    this.groupByDate({ type: 'received', message: messageWithLinks, date: new Date() })
    this.cdRef.detectChanges();
    this.scrollToBottom()
  }

  handleInputChange(event) {
    this.inputMessage = event.target.value;
  }

  handleSendMessage() {
    const formattedMessage = this.inputMessage;
    this.messages.push({ type: 'sent', message: formattedMessage });
    this.groupByDate({ type: 'sent', message: formattedMessage, date: new Date() })
    this.cdRef.detectChanges()

    // Send message using XMPP
    this.client.sendMessage({
      to: `${this.selectedUser.jid}@${environment.openfireFQDN}`, // Replace with the appropriate recipient JID
      body: this.inputMessage
    });
    this.inputMessage = '';
    this.scrollToBottom()

  }


}
