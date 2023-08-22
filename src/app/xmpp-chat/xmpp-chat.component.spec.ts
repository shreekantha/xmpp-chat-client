import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XmppChatComponent } from './xmpp-chat.component';

describe('XmppChatComponent', () => {
  let component: XmppChatComponent;
  let fixture: ComponentFixture<XmppChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XmppChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XmppChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
