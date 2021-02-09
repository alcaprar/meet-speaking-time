import Logger from './Logger'
import { jsControllerCodes, microphoneStatuses } from './constants'
import { Participant } from './Participant'

export default class MeetingController {
  meetingStartedInterval: any;
  _logger: Logger;
  participants: {
    [id: string]: Participant
  };

  constructor() {
    this.participants = {}
    this._logger = new Logger("MeetingController");

    this.meetingStartedInterval = setInterval(function (self : MeetingController) {
      self._logger.log(`Meeting started: ${self.isMeetingStarted()}`)
      
      if (self.isMeetingStarted()) {
        self._logger.log("Meeting started.")
        self.meetingStarted()

        clearInterval(self.meetingStartedInterval);
      }
    }, 1000, this)
  }

  isMeetingStarted(): boolean {
    const participantsNodes = this.getParticipantsNodes();
    return participantsNodes != null && participantsNodes.length > 0;
  }

  getParticipantsNodes() : NodeListOf<Element> {
    return document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantBox}"]`);
  }

  getParticipantsContainerBoxNode() : Element {
    return document.querySelector(`div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`)
  }

  getParticipantInitialId (node) : string {
    if (node == null) return null;
    return node.getAttribute("data-initial-participant-id");
  }


  meetingStarted() {
    this.startParticipantsChangeObserver()

    // start tracking participants already present
    const participantsNodes = this.getParticipantsNodes()

    participantsNodes.forEach((node) => {
      this.createParticipant(node);
    })

    this.startSummaryLogger();
  }

  startSummaryLogger () {
    setInterval(function (self : MeetingController) {
      console.log(self.participants)
    }, 1000, this)
  }

  startParticipantsChangeObserver () {
    // observe for participants changes
    const self = this;
    const participantsBoxObserver = new MutationObserver(function () {
      self._logger.log('callback that runs when observer is triggered');
    });
    const participantsContainerNode = this.getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, { subtree: true, childList: true })
  }

  createParticipant (node) {
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