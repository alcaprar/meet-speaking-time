import Logger from './Logger';
import { jsControllerCodes, meetUiString } from './constants';
import { Participant } from './Participant';
import { formatTime } from './Utils';
import { MeetingInformation, Storage } from './Storage';

/**
 * Main object of the extension.
 */
export default class MeetingController {
  meetingStartedInterval: number;
  startedAt: number;
  meetingId: string;
  _logger: Logger;
  _storage: Storage;
  participants: Participant[];

  constructor() {
    this.participants = [];
    this._logger = new Logger('MeetingController');
    this._storage = new Storage();

    this.meetingStartedInterval = window.setInterval(
      function (self: MeetingController) {
        self._logger.log(`Is meeting started: ${self.isMeetingStarted()}`);

        if (self.isMeetingStarted()) {
          self._logger.log('Meeting started.');
          self.meetingStarted();

          self.updateMeetingDurationTime();

          clearInterval(self.meetingStartedInterval);
        }
      },
      1000,
      this,
    );
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
    const pathname: string = window.location.pathname || '';
    // removes the '/' or any additional query params
    return pathname
      .replace('/', '')
      .slice(
        0,
        pathname.includes('?') ? pathname.indexOf('?') : pathname.length,
      );
  }

  /**
   * Returns the list of participants boxes in the window.
   * Please note, these can may be less than the people in the meeting since only the visible ones are captured.
   */
  getParticipantsNodes(): NodeListOf<Element> {
    return document.querySelectorAll(
      `div[jscontroller="${jsControllerCodes.participantBox}"]`,
    );
  }

  /**
   * Returns the main box of the meeting that contains all the participants.
   */
  getParticipantsContainerBoxNode(): Element {
    return document.querySelector(
      `div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`,
    );
  }

  /**
   * Returns the initial id. Property called: "data-initial-participant-id".
   * @param node The participant DOM Element
   * @returns data-initial-participant-id
   */
  getParticipantInitialId(node: Element): string {
    if (node == null) return null;
    return node.getAttribute('data-initial-participant-id');
  }

  /**
   * Called when the meeting has started.
   * 1. starts the observer for each participant already in the call.
   * 2. starts the observer for new participants.
   * 3. starts an interval that every second updates the UI with the data calculated.
   */
  meetingStarted(): void {
    this.startedAt = new Date().getTime();
    this.meetingId = this.getMeetingId();

    // observe for new participants
    this.startParticipantsChangeObserver();

    // start tracking participants already present
    this.loadCurrentParticipantBoxes();

    setInterval(
      function reconciliateCurrentBoxesInterval(self: MeetingController) {
        self.loadCurrentParticipantBoxes();
      },
      5000,
      this,
    );

    // this sends data to the popup
    this.startSummaryLogger();
  }

  loadCurrentParticipantBoxes(): void {
    const participantsNodes = this.getParticipantsNodes();

    participantsNodes.forEach((node: HTMLElement) => {
      this.onParticipantNodeAdded(node);
    });
  }

  startSummaryLogger(): void {
    setInterval(
      function (self: MeetingController) {
        self.updateMeetingDurationTime();

        const readableParticipants = [];

        // const participantsKeys = Object.keys(self.participants);
        let speakingTimeOfAllParticipants = 0;

        self.participants.forEach((singleParticipant: Participant) => {
          speakingTimeOfAllParticipants =
            speakingTimeOfAllParticipants +
            singleParticipant.getTotalSpeakingTime();
        });

        self.participants.forEach((singleParticipant: Participant) => {
          const percentageOfSpeaking = `${(speakingTimeOfAllParticipants !== 0
            ? (singleParticipant.getTotalSpeakingTime() /
                speakingTimeOfAllParticipants) *
              100
            : 0
          ).toFixed(1)}%`;

          // add current speaking time next to participant's name
          const participantsInformation = document.querySelectorAll(
            `div[jscontroller="${jsControllerCodes.participantInformationBar}"]`,
          );
          for (const participant of participantsInformation as any) {
            if (participant.innerHTML.includes(singleParticipant.name)) {
              participant.innerHTML = `${singleParticipant.name}
              <br/><small>(${formatTime(
                singleParticipant.getTotalSpeakingTime(),
                false,
              )} - ${percentageOfSpeaking})</small>`;
            }
          }

          // prepare data to be sent to chrome.storage
          readableParticipants.push([
            singleParticipant.name,
            formatTime(singleParticipant.getTotalSpeakingTime(), false),
            percentageOfSpeaking,
            singleParticipant.profileImageUrl,
            singleParticipant.getTotalSpeakingTime(),
          ]);
        });

        readableParticipants.sort((a, b) => {
          return b[4] - a[4];
        });

        const meetingInfo = new MeetingInformation(
          self.meetingId,
          self.startedAt,
          self.getTotalElapsedTime(),
          readableParticipants,
        );

        self._storage.set(meetingInfo);
      },
      1000,
      this,
    );
  }

  startParticipantsChangeObserver(): void {
    // observe for participants changes
    const participantsBoxObserver = new MutationObserver((mutations) => {
      this._logger.log('Changes in participant box(es)', mutations);
      mutations.forEach(function newParticipantObserverMutationsHandler(mut) {
        mut.addedNodes.forEach(
          function newParticipantObserverMutationsHandlerNodeHandler(node) {
            this.onParticipantNodeAdded(node);
          },
        );

        mut.removedNodes.forEach(function participantNodeRemovedHandler(node) {
          this.onParticipantNodeRemoved(node);
        });
      });
    });
    const participantsContainerNode = this.getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, {
      childList: true,
    });
  }

  onParticipantNodeAdded(node: HTMLElement): void {
    this._logger.log('Node added', node);
    if (this.isPresentationNode(node)) return;

    const initialId = this.getParticipantInitialId(node);
    this._logger.log('Initial id', initialId);

    if (initialId) {
      let participant = this.getParticipantByInitialId(initialId);

      if (!participant) {
        this._logger.log('Participant did not exist', initialId);
        participant = new Participant(initialId);

        if (!participant.isPresentationBox()) {
          this.participants.push(participant);
          this._logger.log('Participant added', initialId, participant);
        } else {
          this._logger.log('Participant is a presentation box');
        }
      } else {
        this._logger.log('Participant already exists', initialId);
      }
      this._logger.log('Participant', participant);

      participant.startObservers();
    }
  }

  onParticipantNodeRemoved(node: HTMLElement): void {
    this._logger.log('Node remomved', node);

    const initialId = this.getParticipantInitialId(node);

    if (initialId) {
      const participant = this.getParticipantByInitialId(initialId);
      if (participant) participant.stopObservers();
    }
  }

  getMeetUiStrings(): any {
    let lang = document.documentElement.lang.split('-')[0] || 'en';
    if (!meetUiString[lang]) lang = 'en';
    return meetUiString[lang];
  }

  isPresentationNode(node: HTMLElement): boolean {
    // TODO understand how to do this
    const innerHTML = node.innerHTML;
    const isPresentation =
      innerHTML.indexOf(this.getMeetUiStrings().presenting) != -1 ||
      innerHTML.indexOf(this.getMeetUiStrings().presentation) != -1;
    this._logger.log(node, isPresentation, this.getMeetUiStrings());
    return isPresentation;
  }

  getParticipantByInitialId(initialId: string): Participant {
    return this.participants.find((item) => {
      return item.getIdentifier() == initialId;
    });
  }

  /**
   * Returns the number of milliseconds since the beginning of the meeting.
   */
  getTotalElapsedTime(): number {
    return new Date().getTime() - this.startedAt;
  }

  /**
   * Updates the "clock" box with the meeting duration time.
   */
  updateMeetingDurationTime(): void {
    const elapsedMilliseconds = this.getTotalElapsedTime();
    document.querySelector(
      `div[jscontroller="${jsControllerCodes.timeMeetingBox}"]`,
    ).innerHTML = `${formatTime(elapsedMilliseconds, false)}`;
  }
}
