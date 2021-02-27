import { jsControllerCodes } from './constants'

export class ParticipantNode {
  initialId: string;
  mainNodeQuerySelector: string;
  microphoneQuerySelector: string;
  nameNodeQuerySelector: string;
  imageProfileNodeQuerySelector: string;

  constructor (initialId:string)  {
    this.initialId = initialId;
    this.mainNodeQuerySelector = `div[jscontroller="${jsControllerCodes.participantBox}"][data-initial-participant-id="${this.initialId}"]`
    this.microphoneQuerySelector = `div[jscontroller="${jsControllerCodes.microphoneBox}"]`;
    this.nameNodeQuerySelector = `div[jscontroller="${jsControllerCodes.participantNameBox}"]`;
    this.imageProfileNodeQuerySelector = `img[jscontroller="${jsControllerCodes.imageProfile}"]`;
  }

  getMainElement () : Element {
    return document.querySelector(`${this.mainNodeQuerySelector}`)
  }

  getMicrophoneElement () : Element {
    return this.getMainElement() ? this.getMainElement().querySelector(`${this.microphoneQuerySelector}`) : null;
  }

  getNameElement (): Element {
    return this.getMainElement() ? this.getMainElement().querySelector(`${this.nameNodeQuerySelector}`) : null;
  }

  getName () : string {
    return this.getNameElement() ? this.getNameElement().innerHTML : "";
  }

  getImageProfileElement () : Element {
    return this.getMainElement() ? this.getMainElement().querySelector(`${this.imageProfileNodeQuerySelector}`) : null;
  }

  getImageProfileSrc () : string {
    return this.getImageProfileElement() ? this.getImageProfileElement().getAttribute("src") : "";
  }
  
}