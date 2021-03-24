export class ParticipantEvent {
  event: ParticipantEventEnum;
  datetime: number;

  constructor(eventType: ParticipantEventEnum) {
    this.event = eventType;
    this.datetime = new Date().getTime();
  }
}

export enum ParticipantEventEnum {
  JOINED,
  START_SPEAKING,
  STOP_SPEAKING,
}
