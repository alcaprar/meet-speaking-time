import { microphoneStatuses } from './constants';
import Logger from './Logger';
import { ParticipantEvent, ParticipantEventEnum } from './ParticipantEvent';
import { ParticipantNode } from './ParticipantNode';
import config from './config';

export class Participant {
  initialId: string;
  node: ParticipantNode;
  microphoneObserver: MutationObserver;
  name: string;
  profileImageUrl: string;
  events: ParticipantEvent[] = [];
  lastStartSpeaking: number = null;
  totalSpeakingTime = 0;
  _logger: Logger;

  constructor(initialId: string) {
    this.initialId = initialId;
    this.node = new ParticipantNode(initialId);
    if (config.PersistEvents)
      this.events.push(new ParticipantEvent(ParticipantEventEnum.JOINED));
    this._logger = new Logger(`Participant|${initialId}`);
    this.name = this.node.getName() || '';
    this.profileImageUrl = this.node.getImageProfileSrc() || '';
  }

  getIdentifier(): string {
    // TODO maybe find a mixed way with name also?
    return this.initialId;
  }

  isPresentationBox(): boolean {
    return this.name == '' && this.profileImageUrl == '';
  }

  /**
   * Returns the current total speaking time of the participant.
   * Please note that this might be more than totalSpeakingTime if the user is currenly speaking.
   * @returns total speaking time.
   */
  getTotalSpeakingTime(): number {
    // if he is not speaking, return the already calculated time
    if (!this.lastStartSpeaking) {
      return this.totalSpeakingTime;
    }

    // calculate the "live" speaking time
    const liveSpeakingTime = new Date().getTime() - this.lastStartSpeaking;
    return this.totalSpeakingTime + liveSpeakingTime;
  }

  speaking(): void {
    if (!this.lastStartSpeaking) {
      if (config.PersistEvents)
        this.events.push(
          new ParticipantEvent(ParticipantEventEnum.START_SPEAKING),
        );
      const now = new Date().getTime();
      this._logger.log(`[${this.initialId}][${now}]`);
      this.lastStartSpeaking = now;
    }
  }

  /**
   * Calculate the speaking time since he/she has last started and adds it to the toal.
   */
  stopSpeaking(): void {
    if (config.PersistEvents)
      this.events.push(
        new ParticipantEvent(ParticipantEventEnum.STOP_SPEAKING),
      );
    const now = new Date().getTime();
    this._logger.log(`[${this.initialId}][${now}]`);

    if (this.lastStartSpeaking) {
      const speakingTime = now - this.lastStartSpeaking;
      this._logger.log(`speakingTime is '${speakingTime}'`);
      this._logger.log(
        `previous totalSpeakingTime was '${this.totalSpeakingTime}'`,
      );
      this.incrementSpeakingTime(speakingTime);
    }
  }

  incrementSpeakingTime(value: number): void {
    this.lastStartSpeaking = null;
    this.totalSpeakingTime = this.totalSpeakingTime + value;
    this._logger.log(`current totalSpeakingTime '${this.totalSpeakingTime}'`);
  }

  /**
   * Checks if the participant is currently speaking looking at the CSS classes of the wave.
   */
  isParticipantSpeaking(): boolean {
    const microphoneNode = this.node.getMicrophoneElement() || null;
    const nodeClass = microphoneNode ? microphoneNode.className : '';
    const isSilence = nodeClass.includes(microphoneStatuses.silence);
    this._logger.log(
      `nodeClass=${nodeClass} isSilence='${isSilence}'`,
      microphoneNode,
    );
    return !isSilence;
  }

  startObservers(): void {
    const microphoneElement = this.node.getMicrophoneElement();
    if (microphoneElement) {
      this.microphoneObserver = new MutationObserver((mutations) => {
        const isSpeaking = this.isParticipantSpeaking();
        if (isSpeaking) {
          this.speaking();
        } else {
          this.stopSpeaking();
        }
        this._logger.log(
          `[observer][${this.initialId}] class has changed.`,
          isSpeaking,
          mutations,
        );
      });

      this.microphoneObserver.observe(microphoneElement, {
        attributes: true,
        attributeOldValue: true,
      });
    }
  }

  stopObservers(): void {
    this.microphoneObserver.disconnect();
    this.stopSpeaking();
  }
}
