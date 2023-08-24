import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as XMPP from 'stanza';

@Injectable({
  providedIn: 'root'
})
export class XmppService {
 
  searchUsers(search:any){
    return of(
    [
      {
        name:"Shreekanth",
        jid:"shree@localhost",
        openfirePwd:"123",
        email:"shree@mail.com"
      },
      {
        name:"Poornima",
        jid:"poornima@localhost",
        openfirePwd:"123",
        email:"poornima@mail.com"
      },
      {
        name:"Vaishnavi",
        jid:"vaishu@localhost",
        openfirePwd:"123",
        email:"vaishu@mail.com"
      }
    ])
  }
      
}
