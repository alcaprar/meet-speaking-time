import { microphoneStatuses} from './constants'
import Logger from './Logger'
import { ParticipantEvent, ParticipantEventEnum} from "./ParticipantEvent";
import { ParticipantNode } from './ParticipantNode'

export class Participant {
  initialId: string;
  node: ParticipantNode;
  microphoneObserver: MutationObserver;
  name: string;
  profileImageUrl: string;
  events: ParticipantEvent[] = [];
  lastStartSpeaking: number = null;
  totalSpeakingTime: number = 0;
  _logger: Logger;

  constructor (initialId: string) {
    this.initialId = initialId;
    this.node = new ParticipantNode(initialId);
    this.events.push(new ParticipantEvent(ParticipantEventEnum.JOINED));
    this._logger = new Logger(`Participant|${initialId}`);
    this.name = this.node.getName() || "";
    this.profileImageUrl = this.node.getImageProfileSrc() || "";
  }

  getIdentifier () : string {
    // TODO maybe find a mixed way with name also?
    return this.initialId;
  }

  /**
   * Returns the current total speaking time of the participant.
   * Please note that this might be more than totalSpeakingTime if the user is currenly speaking.
   * @returns total speaking time.
   */
  getTotalSpeakingTime (): number {
    // if he is not speaking, return the already calculated time
    if (!this.lastStartSpeaking) {
      return this.totalSpeakingTime;
    }

    // calculate the "live" speaking time
    const liveSpeakingTime = new Date().getTime() - this.lastStartSpeaking;
    return this.totalSpeakingTime + liveSpeakingTime;
  }

  speaking () {
    if (!this.lastStartSpeaking) {
      this.events.push(new ParticipantEvent(ParticipantEventEnum.START_SPEAKING))
      const now = new Date().getTime();
      this._logger.log(`[${this.initialId}][${now}]`)
      this.lastStartSpeaking = now;
    }
  }

  /**
   * Calculate the speaking time since he/she has last started and adds it to the toal.
   */
  stopSpeaking () {
    this.events.push(new ParticipantEvent(ParticipantEventEnum.STOP_SPEAKING))
    const now = new Date().getTime();
    this._logger.log(`[${this.initialId}][${now}]`)

    if (this.lastStartSpeaking) {
      const speakingTime = now - this.lastStartSpeaking;
      this._logger.log(`speakingTime is '${speakingTime}'`)
      this._logger.log(`previous totalSpeakingTime was '${this.totalSpeakingTime}'`)
      this.incrementSpeakingTime(speakingTime);
    }
  }

  incrementSpeakingTime (value: number){
    this.lastStartSpeaking = null;
    this.totalSpeakingTime = this.totalSpeakingTime + value;
    this._logger.log(`current totalSpeakingTime '${this.totalSpeakingTime}'`)
  }

  /**
   * Checks if the participant is currently speaking looking at the CSS classes of the wave.
   */
  isParticipantSpeaking () : boolean {
    const nodeClass = this.node.getMicrophoneElement().className;
    const isSilence = nodeClass.includes(microphoneStatuses.silence)
    this._logger.log(`isSilence='${isSilence}' nodeClass=${nodeClass}`)
    return !isSilence;
  }

  startObservers () {
    const self = this;
    this.microphoneObserver = new MutationObserver(function checkMicrophoneObserve (mutations) {
      const isSpeaking = self.isParticipantSpeaking();
      if (isSpeaking) {
        self.speaking();
      } else {
        self.stopSpeaking();
      }
      self._logger.log(`[observer][${self.initialId}] class has changed.`, isSpeaking, mutations);
    });

    this.microphoneObserver.observe(this.node.getMicrophoneElement(), { attributes: true, attributeOldValue: true })  
  }

  stopObservers () {
    this.microphoneObserver.disconnect();
    this.stopSpeaking();
  }
}