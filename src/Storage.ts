import Logger from './Logger';
import { Participant } from './Participant';

export class MeetingInformation {
  meetingId: string;
  startedAt: number;
  elapsed: number;
  participants: Participant[];

  constructor(
    meetingId: string,
    startedAt: number,
    elapsed: number,
    participants: Participant[],
  ) {
    this.meetingId = meetingId;
    this.startedAt = startedAt;
    this.elapsed = elapsed;
    this.participants = participants;
  }

  toObject(): unknown {
    return {
      meetingId: this.meetingId,
      startedAt: this.startedAt,
      elapsed: this.elapsed,
      participants: this.participants,
    };
  }
}
export class Storage {
  currentKey = 'current';
  historyKey = 'history';
  _logger: Logger;

  constructor() {
    this._logger = new Logger('Storage');
  }

  set(meetingInformation: MeetingInformation): void {
    this._logger.log(meetingInformation);
    this.saveCurrentMeeting(meetingInformation);
    this.saveHistory(meetingInformation);
  }

  getCurrent(callback: (currentObject: unknown) => void): void {
    chrome.storage.local.get([this.currentKey], (result) => {
      const currentObject = result[this.currentKey];
      callback(currentObject);
    });
  }

  getHistory(callback: (historyObject: unknown) => void): void {
    chrome.storage.local.get([this.historyKey], (result) => {
      const historyObject = result[this.historyKey];
      callback(historyObject);
    });
  }

  saveCurrentMeeting(meetingInformation: MeetingInformation): void {
    chrome.storage.local.set({ [this.currentKey]: meetingInformation });
  }

  saveHistory(meetingInformation: MeetingInformation): void {
    chrome.storage.local.get([this.historyKey], (result) => {
      let historyObject = result[this.historyKey] || {};

      if (Array.isArray(historyObject)) historyObject = {};

      const meetingKey = `${meetingInformation.meetingId}|${meetingInformation.startedAt}`;

      historyObject[meetingKey] = meetingInformation;

      chrome.storage.local.set({ [this.historyKey]: historyObject });
    });
  }
}
