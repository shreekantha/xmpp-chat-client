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
        username:"shree",
        openfirePwd:"123"
      },
      {
        name:"Poornima",
        username:"poornima",
        openfirePwd:"123"
      },
      {
        name:"Vaishnavi",
        username:"vaishu",
        openfirePwd:"123"
      }
    ])
  }
      
}
