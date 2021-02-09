import { jsControllerCodes, microphoneStatuses } from './constants'

export default class MeetingController {
  meetingStartedInterval: any;
  participants: any;

  constructor() {
    this.participants = {}
    this.meetingStartedInterval = setInterval(function (self) {
      if (self.isMeetingStarted()) {
        console.log("Meeting started.")
        self.meetingStarted()

        clearInterval(self.meetingStartedInterval);
      }
    }, 1000, this)
  }

  isMeetingStarted(): boolean {
    const participantsNodes = this.getParticipantsNodes();
    console.log("[isMeetingStarted] participantsNodes", participantsNodes)
    return participantsNodes != null && participantsNodes.length > 0;
  }

  getParticipantsNodes() {
    return document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantBox}"]`);
  }

  getParticipantsContainerBoxNode() {
    return document.querySelector(`div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`)
  }

  getParticipantInitialId (node) {
      if (node == null) return null;
      return node.getAttribute("data-initial-participant-id");
  }

  isParticipantSpeaking (microphoneNode) {
    const nodeClass = microphoneNode.className;
    const isSilence = nodeClass.includes(microphoneStatuses.silence)
    console.log(`[isParticipantSpeaking] isSilence='${isSilence}' nodeClass=${nodeClass}`, microphoneNode)
    return !isSilence;
}

getMicrophoneNode (participantNode) {
  return participantNode.querySelector(`div[jscontroller="${jsControllerCodes.microphoneBox}"]`)
}

  meetingStarted() {
    // observe for participants changes
    const participantsBoxObserver = new MutationObserver(function () {
      console.log('callback that runs when observer is triggered');
    });
    const participantsContainerNode = this.getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, { subtree: true, childList: true })

    // start tracking participanta already present
    const participantsNodes = this.getParticipantsNodes()
    participantsNodes.forEach((node) => {
      this.trackParticipant(node);
    })
  }

  trackParticipant(node) {
    console.log('[trackParticipant] started tracking node: ', node);

    const participantId = this.getParticipantInitialId(node);
    console.log(`[trackParticipant] participantInitialId is '${participantId}'`)

    this.addParticipant(participantId);

    const participantMicrophoneBox = this.getMicrophoneNode(node)
    console.log(`[trackParticipant] participantMicrophoneBox is`, participantMicrophoneBox)

    const self = this;
    const participantMicrophoneBoxObserver = new MutationObserver(function (mutations) {
      const isSpeaking = self.isParticipantSpeaking(participantMicrophoneBox);
      if (isSpeaking) {
        // check if he keeps speaking or just started
        const wasSilenceBefore = mutations.find((mut) => {
          return mut.oldValue.includes(microphoneStatuses.silence);
        })

        if (wasSilenceBefore) {
          // he just started speaking
          self.startSpeaking(participantId)
        }
      } else {
        self.stopSpeaking(participantId)
      }
      console.log(`[trackParticipant][observer][${participantId}] class has changed.`, isSpeaking, mutations);
    });

    participantMicrophoneBoxObserver.observe(participantMicrophoneBox, { attributes: true, attributeOldValue: true })
  }

  addParticipant (initialId) {
    if (!this.participants[initialId]) {
        this.participants[initialId] = {
            events: [
                ["JOINED", new Date().getTime()]
            ],
            lastStartSpeaking: null,
            totalSpeakingTime: 0
        }
    }
}

startSpeaking (initialId) {
  const now = new Date().getTime();
  console.log(`[startSpeaking][${initialId}][${now}]`)
  // participants[initialId].events.push(["START_SPEAKING", now])
  this.participants[initialId].lastStartSpeaking = now;
}

stopSpeaking (initialId) {
  const now = new Date().getTime();
  console.log(`[stopSpeaking][${initialId}][${now}]`)
  // participants[initialId].events.push(["STOP_SPEAKING", now])
  if (this.participants[initialId].lastStartSpeaking){
      const speakingTime = now - this.participants[initialId].lastStartSpeaking;
      console.log(`[stopSpeaking] speakingTime is '${speakingTime}'`)
      console.log(`[stopSpeaking] previous totalSpeakingTime was '${this.participants[initialId].totalSpeakingTime}'`)
      this.participants[initialId].totalSpeakingTime = this.participants[initialId].totalSpeakingTime + speakingTime 
      this.participants[initialId].lastStartSpeaking = null;
  }
}
}