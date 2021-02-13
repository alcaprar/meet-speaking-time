import Logger from './Logger'
import { jsControllerCodes, microphoneStatuses } from './constants'
import { Participant } from './Participant'
import { formatTime } from './Utils'

export default class MeetingController {
  meetingStartedInterval: any;
  startedAt: number;
  meetingId: string;
  _logger: Logger;
  participants: {
    [id: string]: Participant
  };

  constructor() {
    this.participants = {}
    this._logger = new Logger("MeetingController");

    this.meetingStartedInterval = setInterval(function (self: MeetingController) {
      self._logger.log(`Meeting started: ${self.isMeetingStarted()}`)

      if (self.isMeetingStarted()) {
        self._logger.log("Meeting started.")
        self.meetingStarted()

        document.querySelector(`div[jscontroller="${jsControllerCodes.timeMeetingBox}"]`).innerHTML = '00:00:00';

        clearInterval(self.meetingStartedInterval);
      }
    }, 1000, this)
  }

  isMeetingStarted(): boolean {
    const participantsNodes = this.getParticipantsNodes();
    return participantsNodes != null && participantsNodes.length > 0;
  }

  getMeetingId(): string {
    const pathname: string = window.location.pathname || "";
    // removes the '/' or any additional query params
    return pathname.replace('/', '').slice(0, pathname.includes('?') ? pathname.indexOf('?') : pathname.length);
  }

  getParticipantsNodes(): NodeListOf<Element> {
    return document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantBox}"]`);
  }

  getParticipantsContainerBoxNode(): Element {
    return document.querySelector(`div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`)
  }

  getParticipantInitialId(node): string {
    if (node == null) return null;
    return node.getAttribute("data-initial-participant-id");
  }


  meetingStarted() {
    this.startedAt = new Date().getTime();
    this.meetingId = this.getMeetingId();

    // observe for new participants
    this.startParticipantsChangeObserver()

    // start tracking participants already present
    const participantsNodes = this.getParticipantsNodes()

    participantsNodes.forEach((node) => {
      this.createParticipant(node);
    })

    this.startSummaryLogger();
  }

  startSummaryLogger() {
    let seconds = 1000
    setInterval(function (self: MeetingController) {
      const meetingKey = `${self.meetingId}|${self.startedAt}`;

      const readableParticipants = [];
      Object.keys(self.participants).forEach((key) => {
        const singleParticipant : Participant = self.participants[key];

        const participantsInformation = document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantInformationBar}"]`);
        for (const participant of participantsInformation as any) {
          const splitName = participant.innerHTML.split(' (')[0]
          if (participant.innerHTML.includes(singleParticipant.name)) {
            participant.innerHTML = splitName + ` (${formatTime(singleParticipant.totalSpeakingTime, false)})`;
          }
        }

        readableParticipants.push([
          singleParticipant.name,
          formatTime(singleParticipant.totalSpeakingTime)
        ])
      })
      const message = {
        startedAt: self.startedAt,
        participants: readableParticipants
      };

      document.querySelector(`div[jscontroller="${jsControllerCodes.timeMeetingBox}"]`).innerHTML = formatTime(seconds, false);
      seconds += 1000;

      chrome.storage.sync.set(message);
      self._logger.log(message)
    }, 1000, this)
  }

  startParticipantsChangeObserver() {
    // observe for participants changes
    const self = this;
    const participantsBoxObserver = new MutationObserver(function newParticipantObserver(mutations) {
      self._logger.log('New participant box(es)', mutations);
      mutations.forEach(function newParticipantObserverMutationsHandler(mut) {
        const addedNodes = mut.addedNodes;
        addedNodes.forEach(function newParticipantObserverMutationsHandlerNodeHandler(node) {
          self.createParticipant(node)
        })
      })
    });
    const participantsContainerNode = this.getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, { childList: true })
  }

  createParticipant(node) {
    const participantId = this.getParticipantInitialId(node);
    this._logger.log(`initialId is '${participantId}'`)

    let part = this.participants[participantId]
    if (!part) {
      part = new Participant(participantId, node);
      this.participants[participantId] = part;
    }

    part.startMicrophoneObserver()
  }
}
