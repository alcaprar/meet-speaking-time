import { jsControllerCodes, microphoneStatuses} from './constants'
import Logger from './Logger'
import { ParticipantEvent, ParticipantEventEnum} from "./ParticipantEvent";
import { ParticipantNode } from './ParticipantNode'

export class Participant {
  initialId: string;
  node: ParticipantNode;
  microphoneObserver: MutationObserver;
  name: string;
  events: ParticipantEvent[] = [];
  lastStartSpeaking: number = null;
  totalSpeakingTime: number = 0;
  _logger: Logger;

  constructor (initialId: string, node: Element) {
    this.initialId = initialId;
    this.node = new ParticipantNode(initialId);
    this.events.push(new ParticipantEvent(ParticipantEventEnum.JOINED));
    this._logger = new Logger(`Participant|${initialId}`);
    this.name = this.node.getName() || "";
  }

  startTracking () {
    this._logger.log("Started tracking.")
  }

  startSpeaking () {
    this.events.push(new ParticipantEvent(ParticipantEventEnum.START_SPEAKING))
    const now = new Date().getTime();
    this._logger.log(`[${this.initialId}][${now}]`)
    this.lastStartSpeaking = now;
  }

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
    this.updateNameBox();
  }

  updateNameBox () {
    const nameElement = this.node.getNameElement();
    this._logger.log(nameElement);
    nameElement.innerHTML = `${this.name} (${this.totalSpeakingTime})`; 
  }

  isParticipantSpeaking () : boolean {
    const nodeClass = this.node.getMicrophoneElement().className;
    const isSilence = nodeClass.includes(microphoneStatuses.silence)
    this._logger.log(`isSilence='${isSilence}' nodeClass=${nodeClass}`)
    return !isSilence;
  }

  startMicrophoneObserver () {
    const self = this;
    this.microphoneObserver = new MutationObserver(function checkMicrophoneObserve (mutations) {
      const isSpeaking = self.isParticipantSpeaking();
      if (isSpeaking) {
        // check if he keeps speaking or just started
        const wasSilenceBefore = mutations.find((mut) => {
          return mut.oldValue.includes(microphoneStatuses.silence);
        })

        if (wasSilenceBefore) {
          // he just started speaking
          self.startSpeaking()
        }
      } else {
        self.stopSpeaking()
      }
      self._logger.log(`[observer][${self.initialId}] class has changed.`, isSpeaking, mutations);
    });

    this.microphoneObserver.observe(this.node.getMicrophoneElement(), { attributes: true, attributeOldValue: true })
  }
}