import Logger from './Logger'
import { jsControllerCodes, microphoneStatuses } from './constants'
import { Participant } from './Participant'
import { formatTime } from './Utils'
import { MeetingInformation, Storage } from "./Storage"

/**
 * Main object of the extension.
 */
export default class MeetingController {
  meetingStartedInterval: any;
  startedAt: number;
  meetingId: string;
  _logger: Logger;
  _storage: Storage;
  participants: Participant[]

  constructor() {
    this.participants = []
    this._logger = new Logger("MeetingController");
    this._storage = new Storage();

    this.meetingStartedInterval = setInterval(function (self: MeetingController) {
      self._logger.log(`Is meeting started: ${self.isMeetingStarted()}`)

      if (self.isMeetingStarted()) {
        self._logger.log("Meeting started.")
        self.meetingStarted()

        self.updateMeetingDurationTime();
        
        clearInterval(self.meetingStartedInterval);
      }
    }, 1000, this)
  }

  /**
   * Checks whether the meeting is started or not.
   * Meeting started = there is at least one participant box in the window.
   * There might be better ways to do this.
   * @returns true if it has started.
   */
  isMeetingStarted(): boolean {
    const participantsNodes = this.getParticipantsNodes();
    return participantsNodes != null && participantsNodes.length > 0;
  }

  /**
   * Returns the meeting id taken from the url.
   * @returns Meeting id.
   */
  getMeetingId(): string {
    const pathname: string = window.location.pathname || "";
    // removes the '/' or any additional query params
    return pathname.replace('/', '').slice(0, pathname.includes('?') ? pathname.indexOf('?') : pathname.length);
  }

  /**
   * Returns the list of participants boxes in the window.
   * Please note, these can may be less than the people in the meeting since only the visible ones are captured.
   */
  getParticipantsNodes(): NodeListOf<Element> {
    return document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantBox}"]`);
  }

  /**
   * Returns the main box of the meeting that contains all the participants.
   */
  getParticipantsContainerBoxNode(): Element {
    return document.querySelector(`div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`)
  }

  /**
   * Returns the initial id. Property called: "data-initial-participant-id".
   * @param node The participant DOM Element
   * @returns data-initial-participant-id
   */
  getParticipantInitialId(node : Element): string {
    if (node == null) return null;
    return node.getAttribute("data-initial-participant-id");
  }


  /**
   * Called when the meeting has started.
   * 1. starts the observer for each participant already in the call.
   * 2. starts the observer for new participants.
   * 3. starts an interval that every second updates the UI with the data calculated.
   */
  meetingStarted() {
    this.startedAt = new Date().getTime();
    this.meetingId = this.getMeetingId();

    // observe for new participants
    this.startParticipantsChangeObserver();

    // start tracking participants already present
    this.loadCurrentParticipantBoxes();

    setInterval(function reconciliateCurrentBoxesInterval (self : MeetingController) {
      self.loadCurrentParticipantBoxes();
    }, 5000, this)

    // this sends data to the popup
    this.startSummaryLogger();
  }

  loadCurrentParticipantBoxes () {
    const participantsNodes = this.getParticipantsNodes()

    participantsNodes.forEach((node) => {
      this.onParticipantNodeAdded(node);
    })
  }

  startSummaryLogger() {
    setInterval(function (self: MeetingController) {
      self.updateMeetingDurationTime();

      const readableParticipants = [];

      const participantsKeys = Object.keys(self.participants);
      let speakingTimeOfAllParticipants = 0;

      self.participants.forEach((singleParticipant : Participant) => {
        speakingTimeOfAllParticipants = speakingTimeOfAllParticipants + singleParticipant.getTotalSpeakingTime();
      })

      self.participants.forEach((singleParticipant : Participant) => {
        const percentageOfSpeaking = `${(speakingTimeOfAllParticipants !== 0 ? (singleParticipant.getTotalSpeakingTime() / speakingTimeOfAllParticipants)*100 : 0).toFixed(2)}%`;

        // add current speaking time next to participant's name
        const participantsInformation = document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantInformationBar}"]`);
        for (const participant of participantsInformation as any) {
          if (participant.innerHTML.includes(singleParticipant.name)) {
            participant.innerHTML = `${singleParticipant.name} (${formatTime(singleParticipant.getTotalSpeakingTime(), false)} - ${percentageOfSpeaking})`;
          }
        }

        // prepare data to be sent to chrome.storage
        readableParticipants.push([
          singleParticipant.name,
          formatTime(singleParticipant.getTotalSpeakingTime(), false),
          percentageOfSpeaking,
          singleParticipant.profileImageUrl
        ])
      })
      
      const meetingInfo = new MeetingInformation(
        self.meetingId,
        self.startedAt,
        self.getTotalElapsedTime(),
        readableParticipants
      );

      self._storage.set(meetingInfo);
    }, 1000, this)
  }

  startParticipantsChangeObserver() {
    // observe for participants changes
    const self = this;
    const participantsBoxObserver = new MutationObserver(function newParticipantObserver(mutations) {
      self._logger.log('Changes in participant box(es)', mutations);
      mutations.forEach(function newParticipantObserverMutationsHandler(mut) {
        
        mut.addedNodes.forEach(function newParticipantObserverMutationsHandlerNodeHandler(node) {
          self.onParticipantNodeAdded(node);
        })

        mut.removedNodes.forEach(function participantNodeRemovedHandler (node) {
          self.onParticipantNodeRemoved(node);
        })
      })
    });
    const participantsContainerNode = this.getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, { childList: true })
  }

  onParticipantNodeAdded (node) {
    this._logger.log("Node added", node);
    if (this.isPresentationNode(node)) return;

    const initialId = this.getParticipantInitialId(node);
    this._logger.log("Initial id", initialId);

    if (initialId) {
      let participant = this.getParticipantByInitialId(initialId);
      
      if (!participant) {
        participant = new Participant(initialId);
        
        if (!participant.isPresentationBox()) {
          this.participants.push(participant);
          participant.startObservers()
          this._logger.log("Participant added", initialId, participant)
        } else {
          this._logger.log("Participant is a presentation box")
        }
      } {
        this._logger.log("Participant already exists", initialId, participant)
      }
    }
  }

  onParticipantNodeRemoved (node) {
    this._logger.log("Node remomved", node);

    const initialId = this.getParticipantInitialId(node);

    if (initialId) {
      const participant = this.getParticipantByInitialId(initialId);
      if (participant) participant.stopObservers();
    }
  }

  isPresentationNode (node) : Boolean {
    // TODO understand how to do this
    return false;
  }

  getParticipantByInitialId (initialId : string) : Participant {
    return this.participants.find((item) => {
      return item.getIdentifier() == initialId;
    })
  }

  /**
   * Returns the number of milliseconds since the beginning of the meeting.
   */
  getTotalElapsedTime () : number{
    return new Date().getTime() - this.startedAt;
  }

  /**
   * Updates the "clock" box with the meeting duration time.
   */
  updateMeetingDurationTime () {
    const elapsedMilliseconds = this.getTotalElapsedTime();
    document.querySelector(`div[jscontroller="${jsControllerCodes.timeMeetingBox}"]`).innerHTML = `${formatTime(elapsedMilliseconds, false)}`;
  }
}
