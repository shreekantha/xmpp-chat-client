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
  contacts = [];

  constructor(private cdRef: ChangeDetectorRef, private xmppService: XmppService) {
    this.openfireUser = JSON.parse(localStorage.getItem("openfireUser"));
    this.client = XMPP.createClient({
      jid: `${this.openfireUser.jid}`,
      password: this.openfireUser.ofp,
      resource: this.openfireUser.jid,

      transports: {
        // websocket: 'ws://localhost:5222/xmpp-websocket',
        bosh: environment.openfireDomain
      }
    });

    this.client.on('session:started', () => {
      this.getContacts();
      this.client.discoverICEServers();

      this.client.sendPresence({
        show: 'chat', // You are available for chat
        status: 'Online'
      });
      this.client.on('message', (msg) => {
        this.handleIncomingMessage(msg);
      });
      // Listen for presence updates
      this.client.on('presence', (presence) => {
        const from = presence.from.split("/")[0];
        this.contacts.find(c => c.jid === from).status = presence.status;
        this.cdRef.detectChanges();
      });
      // Listen for message receipts (read receipts)
      this.client.on('receipt', (receipt) => {
        if (receipt.type === 'read') {
          console.log(`Message with ID ${receipt.id} has been read by ${receipt.from}`);
        }
      });
    });

    this.client.jingle.on('sentFile', function (session, metadata) {
      console.log('sent', metadata);
  });
    this.client.jingle.on('receivedFile', function (session, file, metadata) {
      //saveAs(file, metadata.name); // -- https://github.com/eligrey/FileSaver.js
      console.log("metadata:",metadata,"==session:",session)
      var href = document.getElementById('received');
      href.setAttribute('href', URL.createObjectURL(file));
      href.setAttribute('download', metadata.name);
      var text =
          'Click to download ' + metadata.name + ' (' + metadata.size + ' bytes)';
      href.appendChild(document.createTextNode(text));
      href.style.display = 'block';
  });

  }

  ngOnInit() {
    // document.getElementById('files').addEventListener('change', this.handleFileSelect, false);
    this.client.connect();
  

  }
   handleFileSelect(evt) {
    this.client.getDiscoItems().then(resp=>{
      console.log("disco resp:",resp)
     })
     .catch(error=>{
      console.log("disco erorr:",error);
     })
    //  this.client.getDiscoItems("httpfileupload.localhost").then(resp=>{
    //   console.log("disco item resp:",resp)
    //  })
    //  .catch(error=>{
    //   console.log("disco item erorr:",error);
    //  })
     this.client.getDiscoInfo("httpfileupload.localhost").then(resp=>{
      console.log("disco info resp:",resp)
     })
     .catch(error=>{
      console.log("disco info erorr:",error);
     })

    console.log("evt:",evt);
    var file = evt.target.files[0]; // FileList object
    // let slot=this.client.getUploadSlot("",{type:"", name:"",size:"",mediaType:""})
    console.log("selected file",file)
    this.client.getUploadSlot("httpfileupload.localhost",{ name:file.name,size:file.size})
    .then(resp=>{
      console.log("resp:",resp)

      console.log("resp upload url:",resp.upload.url)
      this.xmppService.upload(resp.upload.url,file,file.size)
     })
     .catch(error=>{
      console.log("erorr:",error);
     })

    // console.log('file', file.name, file.size, file.type, file.lastModifiedDate);
    // var jid = document.getElementById('filepeer').value;
    // var sess = this.client.jingle.createFileTransferSession(this.selectedUser.jid);

    // sess.start(file);
}
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  getContacts() {
    this.client.getRoster().then(roster => {
      this.contacts = roster.items;
      this.cdRef.detectChanges();
    });
  }

  public search(event: any) {
    this.xmppService.searchUsers(event.target.value).subscribe(result => {
      console.log("users:", result);
      this.users = result;
    })
  }

  public selectUserFromSearch(user) {
    this.selectedUser = user;
    this.users = [];
    this.searchUser = '';
    this.messages = [];
    this.fetchChatHistory(user.jid);
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
    // });
  }

  public selectUserFromContacts(user) {
    this.selectedUser = user;
    this.users = [];
    this.searchUser = '';
    this.messages = [];
    this.fetchChatHistory(user.jid);
  }


  scrollToBottom(): void {
    const container = this.messageContainerRef.nativeElement;
    container.scrollTop = container.scrollHeight + 10;
  }

  fetchChatHistory = async (withJid) => {
    try {
      const { results: history } = await this.client.searchHistory(`${this.openfireUser.jid}`, { with: withJid });
      console.log("history:", history);
      this.messages = [];
      this.messages = history.map((item) => {
        const { message, delay } = item.item;
        const messageWithLinks = this.getMessageBody(message);
        console.log("jid:",this.openfireUser.jid,":from:",message.from);
        const msg = {
          type: message.from=== this.openfireUser.jid+"/"+this.openfireUser.jid ? 'sent' : 'received',
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
    const from = msg.from.split("/")[0];
    console.log("incoming message:", msg,":from:",from)
    if (this.selectedUser.jid === from) {
      this.messages.push({ type: 'received', message: messageWithLinks });
      this.groupByDate({ type: 'received', message: messageWithLinks, date: new Date() })
      this.cdRef.detectChanges();
      this.scrollToBottom()
    }
  }

  handleInputChange(event) {
    this.inputMessage = event.target.value;
  }

  handleSendMessage() {
    const formattedMessage = this.inputMessage;
    this.messages.push({ type: 'sent', message: formattedMessage });
    this.groupByDate({ type: 'sent', message: formattedMessage, date: new Date() })
    this.cdRef.detectChanges();
    // Send message using XMPP
    this.client.sendMessage({
      to: `${this.selectedUser.jid}`, // Replace with the appropriate recipient JID
      body: this.inputMessage,
      receipt: true
    });
    this.inputMessage = '';
    this.scrollToBottom();
  }
}
