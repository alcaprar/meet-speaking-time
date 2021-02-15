import { threadId } from "worker_threads";
import Logger from "./Logger";
import { Participant } from "./Participant";

export class MeetingInformation {
  meetingId: string;
  startedAt: number;
  elapsed: number;
  participants: Participant[]

  constructor (meetingId : string, startedAt : number, elapsed : number, participants : Participant[]) {
    this.meetingId = meetingId;
    this.startedAt = startedAt;
    this.elapsed = elapsed;
    this.participants = participants;
  }

  toObject () : any {
    return {
      meetingId: this.meetingId,
      startedAt: this.startedAt,
      elapsed: this.elapsed,
      participants: this.participants
    }
  }
}
export class Storage {

  currentKey = "current";
  historyKey = "history";
  _logger : Logger;
  
  constructor () {
    this._logger = new Logger("Storage");
  }

  set (meetingInformation: MeetingInformation) {
    this._logger.log(meetingInformation);
    this.saveCurrentMeeting(meetingInformation);
    this.saveHistory(meetingInformation);
  };

  getCurrent (callback : Function) {
    const self = this;
    chrome.storage.local.get([this.currentKey], function(result) {
      const currentObject = result[self.currentKey];
      callback(currentObject);
    });
  };

  getHistory (callback : Function) {
    const self = this;
    chrome.storage.local.get([this.historyKey], function(result) {
      const historyObject = result[self.historyKey];
      callback(historyObject);
    });
  };

  saveCurrentMeeting (meetingInformation: MeetingInformation) {
    chrome.storage.local.set({[this.currentKey]: meetingInformation})
  }

  saveHistory (meetingInformation: MeetingInformation) {
    const self = this;
    chrome.storage.local.get([this.historyKey], function (result) {
      let historyObject = result[self.historyKey] || {};

      const meetingKey = `${meetingInformation.meetingId}|${meetingInformation.startedAt}`;
      
      historyObject[meetingKey] = meetingInformation;

      chrome.storage.local.set({[self.historyKey]: historyObject});
    });
  }
}