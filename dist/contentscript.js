/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/MeetingController.ts":
/*!**********************************!*\
  !*** ./src/MeetingController.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
var MeetingController = /** @class */ (function () {
    function MeetingController() {
        this.participants = {};
        this.meetingStartedInterval = setInterval(function (self) {
            if (self.isMeetingStarted()) {
                console.log("Meeting started.");
                self.meetingStarted();
                clearInterval(self.meetingStartedInterval);
            }
        }, 1000, this);
    }
    MeetingController.prototype.isMeetingStarted = function () {
        var participantsNodes = this.getParticipantsNodes();
        console.log("[isMeetingStarted] participantsNodes", participantsNodes);
        return participantsNodes != null && participantsNodes.length > 0;
    };
    MeetingController.prototype.getParticipantsNodes = function () {
        return document.querySelectorAll("div[jscontroller=\"" + constants_1.jsControllerCodes.participantBox + "\"]");
    };
    MeetingController.prototype.getParticipantsContainerBoxNode = function () {
        return document.querySelector("div[jscontroller=\"" + constants_1.jsControllerCodes.participantsContainerBox + "\"]");
    };
    MeetingController.prototype.getParticipantInitialId = function (node) {
        if (node == null)
            return null;
        return node.getAttribute("data-initial-participant-id");
    };
    MeetingController.prototype.isParticipantSpeaking = function (microphoneNode) {
        var nodeClass = microphoneNode.className;
        var isSilence = nodeClass.includes(constants_1.microphoneStatuses.silence);
        console.log("[isParticipantSpeaking] isSilence='" + isSilence + "' nodeClass=" + nodeClass, microphoneNode);
        return !isSilence;
    };
    MeetingController.prototype.getMicrophoneNode = function (participantNode) {
        return participantNode.querySelector("div[jscontroller=\"" + constants_1.jsControllerCodes.microphoneBox + "\"]");
    };
    MeetingController.prototype.meetingStarted = function () {
        var _this = this;
        // observe for participants changes
        var participantsBoxObserver = new MutationObserver(function () {
            console.log('callback that runs when observer is triggered');
        });
        var participantsContainerNode = this.getParticipantsContainerBoxNode();
        participantsBoxObserver.observe(participantsContainerNode, { subtree: true, childList: true });
        // start tracking participanta already present
        var participantsNodes = this.getParticipantsNodes();
        participantsNodes.forEach(function (node) {
            _this.trackParticipant(node);
        });
    };
    MeetingController.prototype.trackParticipant = function (node) {
        console.log('[trackParticipant] started tracking node: ', node);
        var participantId = this.getParticipantInitialId(node);
        console.log("[trackParticipant] participantInitialId is '" + participantId + "'");
        this.addParticipant(participantId);
        var participantMicrophoneBox = this.getMicrophoneNode(node);
        console.log("[trackParticipant] participantMicrophoneBox is", participantMicrophoneBox);
        var self = this;
        var participantMicrophoneBoxObserver = new MutationObserver(function (mutations) {
            var isSpeaking = self.isParticipantSpeaking(participantMicrophoneBox);
            if (isSpeaking) {
                // check if he keeps speaking or just started
                var wasSilenceBefore = mutations.find(function (mut) {
                    return mut.oldValue.includes(constants_1.microphoneStatuses.silence);
                });
                if (wasSilenceBefore) {
                    // he just started speaking
                    self.startSpeaking(participantId);
                }
            }
            else {
                self.stopSpeaking(participantId);
            }
            console.log("[trackParticipant][observer][" + participantId + "] class has changed.", isSpeaking, mutations);
        });
        participantMicrophoneBoxObserver.observe(participantMicrophoneBox, { attributes: true, attributeOldValue: true });
    };
    MeetingController.prototype.addParticipant = function (initialId) {
        if (!this.participants[initialId]) {
            this.participants[initialId] = {
                events: [
                    ["JOINED", new Date().getTime()]
                ],
                lastStartSpeaking: null,
                totalSpeakingTime: 0
            };
        }
    };
    MeetingController.prototype.startSpeaking = function (initialId) {
        var now = new Date().getTime();
        console.log("[startSpeaking][" + initialId + "][" + now + "]");
        // participants[initialId].events.push(["START_SPEAKING", now])
        this.participants[initialId].lastStartSpeaking = now;
    };
    MeetingController.prototype.stopSpeaking = function (initialId) {
        var now = new Date().getTime();
        console.log("[stopSpeaking][" + initialId + "][" + now + "]");
        // participants[initialId].events.push(["STOP_SPEAKING", now])
        if (this.participants[initialId].lastStartSpeaking) {
            var speakingTime = now - this.participants[initialId].lastStartSpeaking;
            console.log("[stopSpeaking] speakingTime is '" + speakingTime + "'");
            console.log("[stopSpeaking] previous totalSpeakingTime was '" + this.participants[initialId].totalSpeakingTime + "'");
            this.participants[initialId].totalSpeakingTime = this.participants[initialId].totalSpeakingTime + speakingTime;
            this.participants[initialId].lastStartSpeaking = null;
        }
    };
    return MeetingController;
}());
exports.default = MeetingController;


/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.microphoneStatuses = exports.jsControllerCodes = void 0;
var jsControllerCodes;
(function (jsControllerCodes) {
    jsControllerCodes["participantsContainerBox"] = "MJfjyf";
    jsControllerCodes["participantBox"] = "J3CtX";
    jsControllerCodes["participantNameBox"] = "GQnsGd";
    jsControllerCodes["microphoneBox"] = "ES310d";
})(jsControllerCodes = exports.jsControllerCodes || (exports.jsControllerCodes = {}));
;
var microphoneStatuses;
(function (microphoneStatuses) {
    microphoneStatuses["silence"] = "gjg47c";
})(microphoneStatuses = exports.microphoneStatuses || (exports.microphoneStatuses = {}));


/***/ }),

/***/ "./src/contentscript/contentscript.ts":
/*!********************************************!*\
  !*** ./src/contentscript/contentscript.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var MeetingController_1 = __webpack_require__(/*! ../MeetingController */ "./src/MeetingController.ts");
console.log("Ciao");
new MeetingController_1.default();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/contentscript/contentscript.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWV0LXRhbGstdGltZS1yZWNvcmRlci8uL3NyYy9NZWV0aW5nQ29udHJvbGxlci50cyIsIndlYnBhY2s6Ly9tZWV0LXRhbGstdGltZS1yZWNvcmRlci8uL3NyYy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vbWVldC10YWxrLXRpbWUtcmVjb3JkZXIvLi9zcmMvY29udGVudHNjcmlwdC9jb250ZW50c2NyaXB0LnRzIiwid2VicGFjazovL21lZXQtdGFsay10aW1lLXJlY29yZGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL21lZXQtdGFsay10aW1lLXJlY29yZGVyL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYiw4Q0FBNkMsQ0FBQyxjQUFjLEVBQUM7QUFDN0Qsa0JBQWtCLG1CQUFPLENBQUMsdUNBQWE7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esb0VBQW9FLGlDQUFpQztBQUNyRztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULDRFQUE0RSw0Q0FBNEM7QUFDeEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsZUFBZTs7Ozs7Ozs7Ozs7QUMvR0Y7QUFDYiw4Q0FBNkMsQ0FBQyxjQUFjLEVBQUM7QUFDN0QsMEJBQTBCLEdBQUcseUJBQXlCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsb0RBQW9ELHlCQUF5QixLQUFLO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxzREFBc0QsMEJBQTBCLEtBQUs7Ozs7Ozs7Ozs7O0FDZHpFO0FBQ2IsOENBQTZDLENBQUMsY0FBYyxFQUFDO0FBQzdELDBCQUEwQixtQkFBTyxDQUFDLHdEQUFzQjtBQUN4RDtBQUNBOzs7Ozs7O1VDSkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7OztVQ3JCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJjb250ZW50c2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgY29uc3RhbnRzXzEgPSByZXF1aXJlKFwiLi9jb25zdGFudHNcIik7XG52YXIgTWVldGluZ0NvbnRyb2xsZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWVldGluZ0NvbnRyb2xsZXIoKSB7XG4gICAgICAgIHRoaXMucGFydGljaXBhbnRzID0ge307XG4gICAgICAgIHRoaXMubWVldGluZ1N0YXJ0ZWRJbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uIChzZWxmKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5pc01lZXRpbmdTdGFydGVkKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1lZXRpbmcgc3RhcnRlZC5cIik7XG4gICAgICAgICAgICAgICAgc2VsZi5tZWV0aW5nU3RhcnRlZCgpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2VsZi5tZWV0aW5nU3RhcnRlZEludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCwgdGhpcyk7XG4gICAgfVxuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5pc01lZXRpbmdTdGFydGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGFydGljaXBhbnRzTm9kZXMgPSB0aGlzLmdldFBhcnRpY2lwYW50c05vZGVzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW2lzTWVldGluZ1N0YXJ0ZWRdIHBhcnRpY2lwYW50c05vZGVzXCIsIHBhcnRpY2lwYW50c05vZGVzKTtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50c05vZGVzICE9IG51bGwgJiYgcGFydGljaXBhbnRzTm9kZXMubGVuZ3RoID4gMDtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5nZXRQYXJ0aWNpcGFudHNOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXZbanNjb250cm9sbGVyPVxcXCJcIiArIGNvbnN0YW50c18xLmpzQ29udHJvbGxlckNvZGVzLnBhcnRpY2lwYW50Qm94ICsgXCJcXFwiXVwiKTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5nZXRQYXJ0aWNpcGFudHNDb250YWluZXJCb3hOb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltqc2NvbnRyb2xsZXI9XFxcIlwiICsgY29uc3RhbnRzXzEuanNDb250cm9sbGVyQ29kZXMucGFydGljaXBhbnRzQ29udGFpbmVyQm94ICsgXCJcXFwiXVwiKTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5nZXRQYXJ0aWNpcGFudEluaXRpYWxJZCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlID09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1pbml0aWFsLXBhcnRpY2lwYW50LWlkXCIpO1xuICAgIH07XG4gICAgTWVldGluZ0NvbnRyb2xsZXIucHJvdG90eXBlLmlzUGFydGljaXBhbnRTcGVha2luZyA9IGZ1bmN0aW9uIChtaWNyb3Bob25lTm9kZSkge1xuICAgICAgICB2YXIgbm9kZUNsYXNzID0gbWljcm9waG9uZU5vZGUuY2xhc3NOYW1lO1xuICAgICAgICB2YXIgaXNTaWxlbmNlID0gbm9kZUNsYXNzLmluY2x1ZGVzKGNvbnN0YW50c18xLm1pY3JvcGhvbmVTdGF0dXNlcy5zaWxlbmNlKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJbaXNQYXJ0aWNpcGFudFNwZWFraW5nXSBpc1NpbGVuY2U9J1wiICsgaXNTaWxlbmNlICsgXCInIG5vZGVDbGFzcz1cIiArIG5vZGVDbGFzcywgbWljcm9waG9uZU5vZGUpO1xuICAgICAgICByZXR1cm4gIWlzU2lsZW5jZTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNaWNyb3Bob25lTm9kZSA9IGZ1bmN0aW9uIChwYXJ0aWNpcGFudE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50Tm9kZS5xdWVyeVNlbGVjdG9yKFwiZGl2W2pzY29udHJvbGxlcj1cXFwiXCIgKyBjb25zdGFudHNfMS5qc0NvbnRyb2xsZXJDb2Rlcy5taWNyb3Bob25lQm94ICsgXCJcXFwiXVwiKTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5tZWV0aW5nU3RhcnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gb2JzZXJ2ZSBmb3IgcGFydGljaXBhbnRzIGNoYW5nZXNcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50c0JveE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NhbGxiYWNrIHRoYXQgcnVucyB3aGVuIG9ic2VydmVyIGlzIHRyaWdnZXJlZCcpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50c0NvbnRhaW5lck5vZGUgPSB0aGlzLmdldFBhcnRpY2lwYW50c0NvbnRhaW5lckJveE5vZGUoKTtcbiAgICAgICAgcGFydGljaXBhbnRzQm94T2JzZXJ2ZXIub2JzZXJ2ZShwYXJ0aWNpcGFudHNDb250YWluZXJOb2RlLCB7IHN1YnRyZWU6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSB9KTtcbiAgICAgICAgLy8gc3RhcnQgdHJhY2tpbmcgcGFydGljaXBhbnRhIGFscmVhZHkgcHJlc2VudFxuICAgICAgICB2YXIgcGFydGljaXBhbnRzTm9kZXMgPSB0aGlzLmdldFBhcnRpY2lwYW50c05vZGVzKCk7XG4gICAgICAgIHBhcnRpY2lwYW50c05vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIF90aGlzLnRyYWNrUGFydGljaXBhbnQobm9kZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgTWVldGluZ0NvbnRyb2xsZXIucHJvdG90eXBlLnRyYWNrUGFydGljaXBhbnQgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnW3RyYWNrUGFydGljaXBhbnRdIHN0YXJ0ZWQgdHJhY2tpbmcgbm9kZTogJywgbm9kZSk7XG4gICAgICAgIHZhciBwYXJ0aWNpcGFudElkID0gdGhpcy5nZXRQYXJ0aWNpcGFudEluaXRpYWxJZChub2RlKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJbdHJhY2tQYXJ0aWNpcGFudF0gcGFydGljaXBhbnRJbml0aWFsSWQgaXMgJ1wiICsgcGFydGljaXBhbnRJZCArIFwiJ1wiKTtcbiAgICAgICAgdGhpcy5hZGRQYXJ0aWNpcGFudChwYXJ0aWNpcGFudElkKTtcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50TWljcm9waG9uZUJveCA9IHRoaXMuZ2V0TWljcm9waG9uZU5vZGUobm9kZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW3RyYWNrUGFydGljaXBhbnRdIHBhcnRpY2lwYW50TWljcm9waG9uZUJveCBpc1wiLCBwYXJ0aWNpcGFudE1pY3JvcGhvbmVCb3gpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBwYXJ0aWNpcGFudE1pY3JvcGhvbmVCb3hPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpc1NwZWFraW5nID0gc2VsZi5pc1BhcnRpY2lwYW50U3BlYWtpbmcocGFydGljaXBhbnRNaWNyb3Bob25lQm94KTtcbiAgICAgICAgICAgIGlmIChpc1NwZWFraW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgaGUga2VlcHMgc3BlYWtpbmcgb3IganVzdCBzdGFydGVkXG4gICAgICAgICAgICAgICAgdmFyIHdhc1NpbGVuY2VCZWZvcmUgPSBtdXRhdGlvbnMuZmluZChmdW5jdGlvbiAobXV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtdXQub2xkVmFsdWUuaW5jbHVkZXMoY29uc3RhbnRzXzEubWljcm9waG9uZVN0YXR1c2VzLnNpbGVuY2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh3YXNTaWxlbmNlQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGhlIGp1c3Qgc3RhcnRlZCBzcGVha2luZ1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJ0U3BlYWtpbmcocGFydGljaXBhbnRJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdG9wU3BlYWtpbmcocGFydGljaXBhbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlt0cmFja1BhcnRpY2lwYW50XVtvYnNlcnZlcl1bXCIgKyBwYXJ0aWNpcGFudElkICsgXCJdIGNsYXNzIGhhcyBjaGFuZ2VkLlwiLCBpc1NwZWFraW5nLCBtdXRhdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgcGFydGljaXBhbnRNaWNyb3Bob25lQm94T2JzZXJ2ZXIub2JzZXJ2ZShwYXJ0aWNpcGFudE1pY3JvcGhvbmVCb3gsIHsgYXR0cmlidXRlczogdHJ1ZSwgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUgfSk7XG4gICAgfTtcbiAgICBNZWV0aW5nQ29udHJvbGxlci5wcm90b3R5cGUuYWRkUGFydGljaXBhbnQgPSBmdW5jdGlvbiAoaW5pdGlhbElkKSB7XG4gICAgICAgIGlmICghdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXSkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXSA9IHtcbiAgICAgICAgICAgICAgICBldmVudHM6IFtcbiAgICAgICAgICAgICAgICAgICAgW1wiSk9JTkVEXCIsIG5ldyBEYXRlKCkuZ2V0VGltZSgpXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgbGFzdFN0YXJ0U3BlYWtpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgdG90YWxTcGVha2luZ1RpbWU6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5zdGFydFNwZWFraW5nID0gZnVuY3Rpb24gKGluaXRpYWxJZCkge1xuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW3N0YXJ0U3BlYWtpbmddW1wiICsgaW5pdGlhbElkICsgXCJdW1wiICsgbm93ICsgXCJdXCIpO1xuICAgICAgICAvLyBwYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5ldmVudHMucHVzaChbXCJTVEFSVF9TUEVBS0lOR1wiLCBub3ddKVxuICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdLmxhc3RTdGFydFNwZWFraW5nID0gbm93O1xuICAgIH07XG4gICAgTWVldGluZ0NvbnRyb2xsZXIucHJvdG90eXBlLnN0b3BTcGVha2luZyA9IGZ1bmN0aW9uIChpbml0aWFsSWQpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIltzdG9wU3BlYWtpbmddW1wiICsgaW5pdGlhbElkICsgXCJdW1wiICsgbm93ICsgXCJdXCIpO1xuICAgICAgICAvLyBwYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5ldmVudHMucHVzaChbXCJTVE9QX1NQRUFLSU5HXCIsIG5vd10pXG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdLmxhc3RTdGFydFNwZWFraW5nKSB7XG4gICAgICAgICAgICB2YXIgc3BlYWtpbmdUaW1lID0gbm93IC0gdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5sYXN0U3RhcnRTcGVha2luZztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW3N0b3BTcGVha2luZ10gc3BlYWtpbmdUaW1lIGlzICdcIiArIHNwZWFraW5nVGltZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW3N0b3BTcGVha2luZ10gcHJldmlvdXMgdG90YWxTcGVha2luZ1RpbWUgd2FzICdcIiArIHRoaXMucGFydGljaXBhbnRzW2luaXRpYWxJZF0udG90YWxTcGVha2luZ1RpbWUgKyBcIidcIik7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdLnRvdGFsU3BlYWtpbmdUaW1lID0gdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS50b3RhbFNwZWFraW5nVGltZSArIHNwZWFraW5nVGltZTtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzW2luaXRpYWxJZF0ubGFzdFN0YXJ0U3BlYWtpbmcgPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTWVldGluZ0NvbnRyb2xsZXI7XG59KCkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gTWVldGluZ0NvbnRyb2xsZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWljcm9waG9uZVN0YXR1c2VzID0gZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyA9IHZvaWQgMDtcbnZhciBqc0NvbnRyb2xsZXJDb2RlcztcbihmdW5jdGlvbiAoanNDb250cm9sbGVyQ29kZXMpIHtcbiAgICBqc0NvbnRyb2xsZXJDb2Rlc1tcInBhcnRpY2lwYW50c0NvbnRhaW5lckJveFwiXSA9IFwiTUpmanlmXCI7XG4gICAganNDb250cm9sbGVyQ29kZXNbXCJwYXJ0aWNpcGFudEJveFwiXSA9IFwiSjNDdFhcIjtcbiAgICBqc0NvbnRyb2xsZXJDb2Rlc1tcInBhcnRpY2lwYW50TmFtZUJveFwiXSA9IFwiR1Fuc0dkXCI7XG4gICAganNDb250cm9sbGVyQ29kZXNbXCJtaWNyb3Bob25lQm94XCJdID0gXCJFUzMxMGRcIjtcbn0pKGpzQ29udHJvbGxlckNvZGVzID0gZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyB8fCAoZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyA9IHt9KSk7XG47XG52YXIgbWljcm9waG9uZVN0YXR1c2VzO1xuKGZ1bmN0aW9uIChtaWNyb3Bob25lU3RhdHVzZXMpIHtcbiAgICBtaWNyb3Bob25lU3RhdHVzZXNbXCJzaWxlbmNlXCJdID0gXCJnamc0N2NcIjtcbn0pKG1pY3JvcGhvbmVTdGF0dXNlcyA9IGV4cG9ydHMubWljcm9waG9uZVN0YXR1c2VzIHx8IChleHBvcnRzLm1pY3JvcGhvbmVTdGF0dXNlcyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBNZWV0aW5nQ29udHJvbGxlcl8xID0gcmVxdWlyZShcIi4uL01lZXRpbmdDb250cm9sbGVyXCIpO1xuY29uc29sZS5sb2coXCJDaWFvXCIpO1xubmV3IE1lZXRpbmdDb250cm9sbGVyXzEuZGVmYXVsdCgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZVxuX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2NvbnRlbnRzY3JpcHQvY29udGVudHNjcmlwdC50c1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=