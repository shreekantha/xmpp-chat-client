import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as XMPP from 'stanza';
import { XmppService } from './xmpp.service';

@Component({
  selector: 'app-xmpp-chat',
  templateUrl: './xmpp-chat.component.html',
  styleUrls: ['./xmpp-chat.component.css']
})
export class XmppChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatWindow') private messageContainerRef: ElementRef;
  messages = [];
  inputMessage = '';
  client: any; // Type properly based on the XMPP library types
  users = [];
  selectedUser:any;
  openfireUser:any;
  searchUser:any;
  constructor(private cdRef: ChangeDetectorRef, private xmppService: XmppService) {
     this.openfireUser=JSON.parse(localStorage.getItem("openfireUser"));
    this.client = XMPP.createClient({
      // jid: `shree@${environment.openfireFQDN}`,
      jid: `${this.openfireUser.username}@${environment.openfireFQDN}`,
      password: this.openfireUser.ofp,
      resource:this.openfireUser.username,
      transports: {
        // websocket: 'ws://localhost:5222/xmpp-websocket',
        bosh: environment.openfireDomain
      }
    });

    this.client.on('session:started', () => {
      this.client.getRoster();
      this.client.sendPresence();
      // this.fetchChatHistory();
      this.client.on('chat', (msg) => {
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

  public search(event:any) {
    this.xmppService.searchUsers(event.target.value).subscribe(result => {
      console.log("contacts:", result);
      this.users = result;
    })
  }

  public selectUser(user){
    this.selectedUser=user;
    this.users=[];
    this.searchUser='';
    this.messages=[];
    this.fetchChatHistory();

  }

  scrollToBottom(): void {
    const container = this.messageContainerRef.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  fetchChatHistory = async () => {
    try {
      const { results: history } = await this.client.searchHistory(`${this.openfireUser.username}@${environment.openfireFQDN}`, { with: `${this.selectedUser.username}@${environment.openfireFQDN}` });
      console.log("history:", history);
      this.messages = [];

      this.messages = history.map((item) => {
        const { message,delay } = item.item;
        console.log("Item:",delay);
        const messageWithLinks = message.body ? message.body.replace(
          /((http|https):\/\/[^\s]+)/g,
          '<a href="$1" target="_blank">$1</a>'
        ) : message.body;
        
        const msg = {
          type: message.from.split('@')[0] === 'shree' ? 'sent' : 'received',
          message: messageWithLinks,
          date:delay.timestamp
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
    console.log("msg:",msg)
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
      to: `${this.selectedUser.username}@${environment.openfireFQDN}`, // Replace with the appropriate recipient JID
      body: this.inputMessage
    });
    this.inputMessage = '';
    this.scrollToBottom()

  }


}
