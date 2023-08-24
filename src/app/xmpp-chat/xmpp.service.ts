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
        jid:"shree",
        openfirePwd:"123"
      },
      {
        name:"Poornima",
        jid:"poornima",
        openfirePwd:"123"
      },
      {
        name:"Vaishnavi",
        jid:"vaishu",
        openfirePwd:"123"
      }
    ])
  }
      
}
