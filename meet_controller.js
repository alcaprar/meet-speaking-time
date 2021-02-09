const jsControllerCodes = {
    participantsContainerBox: "MJfjyf", // all the participants box divs are inside this
    participantBox: "J3CtX",
    participantNameBox: "GQnsGd",
    microphoneBox: "ES310d"
};

const microphoneStatuses = {
    silence: "gjg47c"
}

function isMeetingStarted () {
    const participantsNodes = getParticipantsNodes();
    console.log("[isMeetingStarted] participantsNodes", participantsNodes)
    return participantsNodes != null && participantsNodes.length > 0;
}

function getParticipantsNodes () {
    return document.querySelectorAll(`div[jscontroller="${jsControllerCodes.participantBox}"]`);
}

function getParticipantsContainerBoxNode () {
    return document.querySelector(`div[jscontroller="${jsControllerCodes.participantsContainerBox}"]`)
}

function getParticipantInitialId (node) {
    if (node == null) return null;
    return node.getAttribute("data-initial-participant-id");
}

function isParticipantSpeaking (microphoneNode) {
    const nodeClass = microphoneNode.className;
    const isSilence = nodeClass.includes(microphoneStatuses.silence)
    console.log(`[isParticipantSpeaking] isSilence='${isSilence}' nodeClass=${nodeClass}`, microphoneNode)
    return !isSilence;
}

function getMicrophoneNode (participantNode) {
    return participantNode.querySelector(`div[jscontroller="${jsControllerCodes.microphoneBox}"]`)
}

function meetingStarted (){
    // observe for participants changes
    const participantsBoxObserver = new MutationObserver(function() {
        console.log('callback that runs when observer is triggered');
    });
    const participantsContainerNode = getParticipantsContainerBoxNode();
    participantsBoxObserver.observe(participantsContainerNode, {subtree: true, childList: true})

    // start tracking participanta already present
    const participantsNodes = getParticipantsNodes()
    participantsNodes.forEach((node) => {
        trackParticipant(node);
    })
}

function wasNodeInSilenceStateBefore (mutations) {
    // check if any of the mutations.oldValue contains microphoneSilence value
}

function trackParticipant (node) {
    console.log('[trackParticipant] started tracking node: ', node);

    const participantId = getParticipantInitialId(node);
    console.log(`[trackParticipant] participantInitialId is '${participantId}'`)

    addParticipant(participantId);

    const participantMicrophoneBox = getMicrophoneNode(node)
    console.log(`[trackParticipant] participantMicrophoneBox is`, participantMicrophoneBox)

    const participantMicrophoneBoxObserver = new MutationObserver(function(mutations) {
        const isSpeaking = isParticipantSpeaking(participantMicrophoneBox);
        if (isSpeaking) {
            // check if he keeps speaking or just started
            const wasSilenceBefore = mutations.find((mut) => {
                return mut.oldValue.includes(microphoneStatuses.silence);
            })

            if (wasSilenceBefore) {
                // he just started speaking
                startSpeaking(participantId)
            }
        } else {
            stopSpeaking(participantId)
        }
        console.log(`[trackParticipant][observer][${participantId}] class has changed.`, isSpeaking, mutations);
    });
    
    participantMicrophoneBoxObserver.observe(participantMicrophoneBox, {attributes: true, attributeOldValue: true})
}

const participants = {}

const addParticipant = (initialId) => {
    if (!participants[initialId]) {
        participants[initialId] = {
            events: [
                ["JOINED", new Date().getTime()]
            ],
            lastStartSpeaking: null,
            totalSpeakingTime: 0
        }
    }
}

const startSpeaking = (initialId) => {
    const now = new Date().getTime();
    console.log(`[startSpeaking][${initialId}][${now}]`)
    // participants[initialId].events.push(["START_SPEAKING", now])
    participants[initialId].lastStartSpeaking = now;
}

const stopSpeaking = (initialId) => {
    const now = new Date().getTime();
    console.log(`[stopSpeaking][${initialId}][${now}]`)
    // participants[initialId].events.push(["STOP_SPEAKING", now])
    if (participants[initialId].lastStartSpeaking){
        const speakingTime = now - participants[initialId].lastStartSpeaking;
        console.log(`[stopSpeaking] speakingTime is '${speakingTime}'`)
        console.log(`[stopSpeaking] previous totalSpeakingTime was '${participants[initialId].totalSpeakingTime}'`)
        participants[initialId].totalSpeakingTime = participants[initialId].totalSpeakingTime + speakingTime 
        participants[initialId].lastStartSpeaking = null;
    }
}

const calculateTime = () => {
    console.log(participants)
}

const meetingStartedInterval = setInterval(function () {
    if (isMeetingStarted()) {
        console.log("Meeting started.")
        meetingStarted()
        clearInterval(meetingStartedInterval)

        setInterval(function () {
            calculateTime();
        }, 1000)
    }
}, 1000)