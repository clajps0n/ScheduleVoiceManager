import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

declare var gapi : any;

@Injectable({
  providedIn: 'root'
})
export class CalendarService 
{
  user$ : Observable<firebase.User>;
  calendarItems : any[];

  constructor(public afAuth : AngularFireAuth)
  {
    this.initClient();
    this.user$ = afAuth.authState;
  }

  //Initialize the google api client with desired scopes.
  initClient(){
    gapi.load
    (
      'client',
      ()=>
      {
        console.log('Loaded client...');

        //It's ok to expose this credentials... they are client safe
        gapi.client.init
        (
          {
            apiKey: 'AIzaSyAY7he8AlXPJYFiU8jynxzhIlr1Hu5mvhY',                       
            clientId: '512132556012-04tkpj2pgrr0jtq32n4i2i4stho1ernn.apps.googleusercontent.com',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          }
        );

        gapi.client.load('calendar', 'v3', ()=> console.log('Loaded calendar!'));
      }
    );
  }

  async login() 
  {
    const googleAuth = gapi.auth2.getAuthInstance();

   
        console.log('googleAuth: '+googleAuth);


    const googleUser = await googleAuth.signIn();
  
    console.log('googleUser: '+googleUser);

    const token = googleUser.getAuthResponse().id_token;
  
    console.log('token: '+token);
  
    const credential = auth.GoogleAuthProvider.credential(token);
  
    console.log('credential: '+credential);

    await this.afAuth.auth.signInAndRetrieveDataWithCredential(credential);
  
  
    // Alternative approach, use the Firebase login with scopes and make RESTful API calls
    // const provider = new auth.GoogleAuthProvider()
    // provider.addScope('https://www.googleapis.com/auth/calendar');
    // this.afAuth.auth.signInWithPopup(provider)
    
  }
  
  logout() {
    this.afAuth.auth.signOut();
  }

  async getCalendar() {
    const events = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
    })
  
    console.log(events)
  
    this.calendarItems = events.result.items;
  
  }

  async insertEvent() 
  {
    const insert = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      start: {
        dateTime: this.hoursFromNow(2),
        timeZone: 'America/Los_Angeles'
      }, 
      end: {
        dateTime: this.hoursFromNow(3),
        timeZone: 'America/Los_Angeles'
      }, 
      summary: 'Have Fun!!!',
      description: 'Do some cool stuff and have a fun time doing it'
    })
  
    await this.getCalendar();
  }
    
  hoursFromNow = (n) => new Date(Date.now() + n * 1000 * 60 * 60 ).toISOString();
}
