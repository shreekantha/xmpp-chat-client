import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as XMPP from 'stanza';

@Injectable({
  providedIn: 'root'
})
export class XmppService {
 
  constructor(private http:HttpClient){
  }

  upload(url:any,data:any,length?:any){
    console.log("length content:",length);
// let header=new HttpHeaders().set("Content-Length",length);
// console.log("headers:",header);
this.http.put(url,data).subscribe(resp=>{
    console.log("upload resp:",resp);
},error=>{
    console.log("error:",error)
});



  }

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
