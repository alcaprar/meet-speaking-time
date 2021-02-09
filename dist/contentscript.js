/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Logger.ts":
/*!***********************!*\
  !*** ./src/Logger.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Logger = /** @class */ (function () {
    function Logger(logPrefix) {
        if (logPrefix === void 0) { logPrefix = ""; }
        this.logPrefix = logPrefix;
    }
    Logger.prototype.callerName = function () {
        try {
            throw new Error();
        }
        catch (e) {
            try {
                return e.stack.split('at ')[3].split(' ')[0];
            }
            catch (e) {
                return '';
            }
        }
    };
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // 1. Convert args to a normal array
        var newArgs = Array.from(args);
        var callerName = this.callerName();
        if (callerName)
            newArgs.unshift("[" + callerName + "]");
        if (this.logPrefix)
            newArgs.unshift("[" + this.logPrefix + "]");
        // 3. Pass along arguments to console.log
        console.log.apply(console, newArgs);
    };
    return Logger;
}());
exports.default = Logger;


/***/ }),

/***/ "./src/MeetingController.ts":
/*!**********************************!*\
  !*** ./src/MeetingController.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Logger_1 = __webpack_require__(/*! ./Logger */ "./src/Logger.ts");
var constants_1 = __webpack_require__(/*! ./constants */ "./src/constants.ts");
var MeetingController = /** @class */ (function () {
    function MeetingController() {
        this.participants = {};
        this._logger = new Logger_1.default("MeetingController");
        this.meetingStartedInterval = setInterval(function (self) {
            if (self.isMeetingStarted()) {
                self._logger.log("Meeting started.");
                self.meetingStarted();
                clearInterval(self.meetingStartedInterval);
            }
        }, 1000, this);
    }
    MeetingController.prototype.isMeetingStarted = function () {
        var participantsNodes = this.getParticipantsNodes();
        this._logger.log("participantsNodes", participantsNodes);
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
        this._logger.log("isSilence='" + isSilence + "' nodeClass=" + nodeClass, microphoneNode);
        return !isSilence;
    };
    MeetingController.prototype.getMicrophoneNode = function (participantNode) {
        return participantNode.querySelector("div[jscontroller=\"" + constants_1.jsControllerCodes.microphoneBox + "\"]");
    };
    MeetingController.prototype.meetingStarted = function () {
        var _this = this;
        // observe for participants changes
        var self = this;
        var participantsBoxObserver = new MutationObserver(function () {
            self._logger.log('callback that runs when observer is triggered');
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
        this._logger.log('started tracking node: ', node);
        var participantId = this.getParticipantInitialId(node);
        this._logger.log(" participantInitialId is '" + participantId + "'");
        this.addParticipant(participantId);
        var participantMicrophoneBox = this.getMicrophoneNode(node);
        this._logger.log("participantMicrophoneBox is", participantMicrophoneBox);
        var self = this;
        var participantMicrophoneBoxObserver = new MutationObserver(function trackParticipantCheckChanges(mutations) {
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
            self._logger.log("[observer][" + participantId + "] class has changed.", isSpeaking, mutations);
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
        this._logger.log("[startSpeaking][" + initialId + "][" + now + "]");
        // participants[initialId].events.push(["START_SPEAKING", now])
        this.participants[initialId].lastStartSpeaking = now;
    };
    MeetingController.prototype.stopSpeaking = function (initialId) {
        var now = new Date().getTime();
        this._logger.log("[" + initialId + "][" + now + "]");
        // participants[initialId].events.push(["STOP_SPEAKING", now])
        if (this.participants[initialId].lastStartSpeaking) {
            var speakingTime = now - this.participants[initialId].lastStartSpeaking;
            this._logger.log("speakingTime is '" + speakingTime + "'");
            this._logger.log("previous totalSpeakingTime was '" + this.participants[initialId].totalSpeakingTime + "'");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWV0LXRhbGstdGltZS1yZWNvcmRlci8uL3NyYy9Mb2dnZXIudHMiLCJ3ZWJwYWNrOi8vbWVldC10YWxrLXRpbWUtcmVjb3JkZXIvLi9zcmMvTWVldGluZ0NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vbWVldC10YWxrLXRpbWUtcmVjb3JkZXIvLi9zcmMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL21lZXQtdGFsay10aW1lLXJlY29yZGVyLy4vc3JjL2NvbnRlbnRzY3JpcHQvY29udGVudHNjcmlwdC50cyIsIndlYnBhY2s6Ly9tZWV0LXRhbGstdGltZS1yZWNvcmRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tZWV0LXRhbGstdGltZS1yZWNvcmRlci93ZWJwYWNrL3N0YXJ0dXAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsOENBQTZDLENBQUMsY0FBYyxFQUFDO0FBQzdEO0FBQ0E7QUFDQSxtQ0FBbUMsZ0JBQWdCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsdUJBQXVCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGVBQWU7Ozs7Ozs7Ozs7O0FDcENmLDhDQUE2QyxDQUFDLGNBQWMsRUFBQztBQUM3RCxlQUFlLG1CQUFPLENBQUMsaUNBQVU7QUFDakMsa0JBQWtCLG1CQUFPLENBQUMsdUNBQWE7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG9FQUFvRSxpQ0FBaUM7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCw0RUFBNEUsNENBQTRDO0FBQ3hIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELGVBQWU7Ozs7Ozs7Ozs7O0FDakhmLDhDQUE2QyxDQUFDLGNBQWMsRUFBQztBQUM3RCwwQkFBMEIsR0FBRyx5QkFBeUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxvREFBb0QseUJBQXlCLEtBQUs7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLHNEQUFzRCwwQkFBMEIsS0FBSzs7Ozs7Ozs7Ozs7QUNidEYsOENBQTZDLENBQUMsY0FBYyxFQUFDO0FBQzdELDBCQUEwQixtQkFBTyxDQUFDLHdEQUFzQjtBQUN4RDtBQUNBOzs7Ozs7O1VDSEE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7OztVQ3JCQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJjb250ZW50c2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIExvZ2dlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBMb2dnZXIobG9nUHJlZml4KSB7XG4gICAgICAgIGlmIChsb2dQcmVmaXggPT09IHZvaWQgMCkgeyBsb2dQcmVmaXggPSBcIlwiOyB9XG4gICAgICAgIHRoaXMubG9nUHJlZml4ID0gbG9nUHJlZml4O1xuICAgIH1cbiAgICBMb2dnZXIucHJvdG90eXBlLmNhbGxlck5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZS5zdGFjay5zcGxpdCgnYXQgJylbM10uc3BsaXQoJyAnKVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBMb2dnZXIucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICAvLyAxLiBDb252ZXJ0IGFyZ3MgdG8gYSBub3JtYWwgYXJyYXlcbiAgICAgICAgdmFyIG5ld0FyZ3MgPSBBcnJheS5mcm9tKGFyZ3MpO1xuICAgICAgICB2YXIgY2FsbGVyTmFtZSA9IHRoaXMuY2FsbGVyTmFtZSgpO1xuICAgICAgICBpZiAoY2FsbGVyTmFtZSlcbiAgICAgICAgICAgIG5ld0FyZ3MudW5zaGlmdChcIltcIiArIGNhbGxlck5hbWUgKyBcIl1cIik7XG4gICAgICAgIGlmICh0aGlzLmxvZ1ByZWZpeClcbiAgICAgICAgICAgIG5ld0FyZ3MudW5zaGlmdChcIltcIiArIHRoaXMubG9nUHJlZml4ICsgXCJdXCIpO1xuICAgICAgICAvLyAzLiBQYXNzIGFsb25nIGFyZ3VtZW50cyB0byBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBuZXdBcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBMb2dnZXI7XG59KCkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gTG9nZ2VyO1xuIiwiT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIExvZ2dlcl8xID0gcmVxdWlyZShcIi4vTG9nZ2VyXCIpO1xudmFyIGNvbnN0YW50c18xID0gcmVxdWlyZShcIi4vY29uc3RhbnRzXCIpO1xudmFyIE1lZXRpbmdDb250cm9sbGVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE1lZXRpbmdDb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnBhcnRpY2lwYW50cyA9IHt9O1xuICAgICAgICB0aGlzLl9sb2dnZXIgPSBuZXcgTG9nZ2VyXzEuZGVmYXVsdChcIk1lZXRpbmdDb250cm9sbGVyXCIpO1xuICAgICAgICB0aGlzLm1lZXRpbmdTdGFydGVkSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoc2VsZikge1xuICAgICAgICAgICAgaWYgKHNlbGYuaXNNZWV0aW5nU3RhcnRlZCgpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fbG9nZ2VyLmxvZyhcIk1lZXRpbmcgc3RhcnRlZC5cIik7XG4gICAgICAgICAgICAgICAgc2VsZi5tZWV0aW5nU3RhcnRlZCgpO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2VsZi5tZWV0aW5nU3RhcnRlZEludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCwgdGhpcyk7XG4gICAgfVxuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5pc01lZXRpbmdTdGFydGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGFydGljaXBhbnRzTm9kZXMgPSB0aGlzLmdldFBhcnRpY2lwYW50c05vZGVzKCk7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5sb2coXCJwYXJ0aWNpcGFudHNOb2Rlc1wiLCBwYXJ0aWNpcGFudHNOb2Rlcyk7XG4gICAgICAgIHJldHVybiBwYXJ0aWNpcGFudHNOb2RlcyAhPSBudWxsICYmIHBhcnRpY2lwYW50c05vZGVzLmxlbmd0aCA+IDA7XG4gICAgfTtcbiAgICBNZWV0aW5nQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0UGFydGljaXBhbnRzTm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiZGl2W2pzY29udHJvbGxlcj1cXFwiXCIgKyBjb25zdGFudHNfMS5qc0NvbnRyb2xsZXJDb2Rlcy5wYXJ0aWNpcGFudEJveCArIFwiXFxcIl1cIik7XG4gICAgfTtcbiAgICBNZWV0aW5nQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0UGFydGljaXBhbnRzQ29udGFpbmVyQm94Tm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJkaXZbanNjb250cm9sbGVyPVxcXCJcIiArIGNvbnN0YW50c18xLmpzQ29udHJvbGxlckNvZGVzLnBhcnRpY2lwYW50c0NvbnRhaW5lckJveCArIFwiXFxcIl1cIik7XG4gICAgfTtcbiAgICBNZWV0aW5nQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0UGFydGljaXBhbnRJbml0aWFsSWQgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICBpZiAobm9kZSA9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBub2RlLmdldEF0dHJpYnV0ZShcImRhdGEtaW5pdGlhbC1wYXJ0aWNpcGFudC1pZFwiKTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5pc1BhcnRpY2lwYW50U3BlYWtpbmcgPSBmdW5jdGlvbiAobWljcm9waG9uZU5vZGUpIHtcbiAgICAgICAgdmFyIG5vZGVDbGFzcyA9IG1pY3JvcGhvbmVOb2RlLmNsYXNzTmFtZTtcbiAgICAgICAgdmFyIGlzU2lsZW5jZSA9IG5vZGVDbGFzcy5pbmNsdWRlcyhjb25zdGFudHNfMS5taWNyb3Bob25lU3RhdHVzZXMuc2lsZW5jZSk7XG4gICAgICAgIHRoaXMuX2xvZ2dlci5sb2coXCJpc1NpbGVuY2U9J1wiICsgaXNTaWxlbmNlICsgXCInIG5vZGVDbGFzcz1cIiArIG5vZGVDbGFzcywgbWljcm9waG9uZU5vZGUpO1xuICAgICAgICByZXR1cm4gIWlzU2lsZW5jZTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5nZXRNaWNyb3Bob25lTm9kZSA9IGZ1bmN0aW9uIChwYXJ0aWNpcGFudE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2lwYW50Tm9kZS5xdWVyeVNlbGVjdG9yKFwiZGl2W2pzY29udHJvbGxlcj1cXFwiXCIgKyBjb25zdGFudHNfMS5qc0NvbnRyb2xsZXJDb2Rlcy5taWNyb3Bob25lQm94ICsgXCJcXFwiXVwiKTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5tZWV0aW5nU3RhcnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gb2JzZXJ2ZSBmb3IgcGFydGljaXBhbnRzIGNoYW5nZXNcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgcGFydGljaXBhbnRzQm94T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLl9sb2dnZXIubG9nKCdjYWxsYmFjayB0aGF0IHJ1bnMgd2hlbiBvYnNlcnZlciBpcyB0cmlnZ2VyZWQnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBwYXJ0aWNpcGFudHNDb250YWluZXJOb2RlID0gdGhpcy5nZXRQYXJ0aWNpcGFudHNDb250YWluZXJCb3hOb2RlKCk7XG4gICAgICAgIHBhcnRpY2lwYW50c0JveE9ic2VydmVyLm9ic2VydmUocGFydGljaXBhbnRzQ29udGFpbmVyTm9kZSwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUgfSk7XG4gICAgICAgIC8vIHN0YXJ0IHRyYWNraW5nIHBhcnRpY2lwYW50YSBhbHJlYWR5IHByZXNlbnRcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50c05vZGVzID0gdGhpcy5nZXRQYXJ0aWNpcGFudHNOb2RlcygpO1xuICAgICAgICBwYXJ0aWNpcGFudHNOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBfdGhpcy50cmFja1BhcnRpY2lwYW50KG5vZGUpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS50cmFja1BhcnRpY2lwYW50ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmxvZygnc3RhcnRlZCB0cmFja2luZyBub2RlOiAnLCBub2RlKTtcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50SWQgPSB0aGlzLmdldFBhcnRpY2lwYW50SW5pdGlhbElkKG5vZGUpO1xuICAgICAgICB0aGlzLl9sb2dnZXIubG9nKFwiIHBhcnRpY2lwYW50SW5pdGlhbElkIGlzICdcIiArIHBhcnRpY2lwYW50SWQgKyBcIidcIik7XG4gICAgICAgIHRoaXMuYWRkUGFydGljaXBhbnQocGFydGljaXBhbnRJZCk7XG4gICAgICAgIHZhciBwYXJ0aWNpcGFudE1pY3JvcGhvbmVCb3ggPSB0aGlzLmdldE1pY3JvcGhvbmVOb2RlKG5vZGUpO1xuICAgICAgICB0aGlzLl9sb2dnZXIubG9nKFwicGFydGljaXBhbnRNaWNyb3Bob25lQm94IGlzXCIsIHBhcnRpY2lwYW50TWljcm9waG9uZUJveCk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHBhcnRpY2lwYW50TWljcm9waG9uZUJveE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gdHJhY2tQYXJ0aWNpcGFudENoZWNrQ2hhbmdlcyhtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBpc1NwZWFraW5nID0gc2VsZi5pc1BhcnRpY2lwYW50U3BlYWtpbmcocGFydGljaXBhbnRNaWNyb3Bob25lQm94KTtcbiAgICAgICAgICAgIGlmIChpc1NwZWFraW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgaGUga2VlcHMgc3BlYWtpbmcgb3IganVzdCBzdGFydGVkXG4gICAgICAgICAgICAgICAgdmFyIHdhc1NpbGVuY2VCZWZvcmUgPSBtdXRhdGlvbnMuZmluZChmdW5jdGlvbiAobXV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtdXQub2xkVmFsdWUuaW5jbHVkZXMoY29uc3RhbnRzXzEubWljcm9waG9uZVN0YXR1c2VzLnNpbGVuY2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh3YXNTaWxlbmNlQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGhlIGp1c3Qgc3RhcnRlZCBzcGVha2luZ1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnN0YXJ0U3BlYWtpbmcocGFydGljaXBhbnRJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zdG9wU3BlYWtpbmcocGFydGljaXBhbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9sb2dnZXIubG9nKFwiW29ic2VydmVyXVtcIiArIHBhcnRpY2lwYW50SWQgKyBcIl0gY2xhc3MgaGFzIGNoYW5nZWQuXCIsIGlzU3BlYWtpbmcsIG11dGF0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgICBwYXJ0aWNpcGFudE1pY3JvcGhvbmVCb3hPYnNlcnZlci5vYnNlcnZlKHBhcnRpY2lwYW50TWljcm9waG9uZUJveCwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSB9KTtcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5hZGRQYXJ0aWNpcGFudCA9IGZ1bmN0aW9uIChpbml0aWFsSWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdKSB7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdID0ge1xuICAgICAgICAgICAgICAgIGV2ZW50czogW1xuICAgICAgICAgICAgICAgICAgICBbXCJKT0lORURcIiwgbmV3IERhdGUoKS5nZXRUaW1lKCldXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBsYXN0U3RhcnRTcGVha2luZzogbnVsbCxcbiAgICAgICAgICAgICAgICB0b3RhbFNwZWFraW5nVGltZTogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTWVldGluZ0NvbnRyb2xsZXIucHJvdG90eXBlLnN0YXJ0U3BlYWtpbmcgPSBmdW5jdGlvbiAoaW5pdGlhbElkKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmxvZyhcIltzdGFydFNwZWFraW5nXVtcIiArIGluaXRpYWxJZCArIFwiXVtcIiArIG5vdyArIFwiXVwiKTtcbiAgICAgICAgLy8gcGFydGljaXBhbnRzW2luaXRpYWxJZF0uZXZlbnRzLnB1c2goW1wiU1RBUlRfU1BFQUtJTkdcIiwgbm93XSlcbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5sYXN0U3RhcnRTcGVha2luZyA9IG5vdztcbiAgICB9O1xuICAgIE1lZXRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5zdG9wU3BlYWtpbmcgPSBmdW5jdGlvbiAoaW5pdGlhbElkKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmxvZyhcIltcIiArIGluaXRpYWxJZCArIFwiXVtcIiArIG5vdyArIFwiXVwiKTtcbiAgICAgICAgLy8gcGFydGljaXBhbnRzW2luaXRpYWxJZF0uZXZlbnRzLnB1c2goW1wiU1RPUF9TUEVBS0lOR1wiLCBub3ddKVxuICAgICAgICBpZiAodGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5sYXN0U3RhcnRTcGVha2luZykge1xuICAgICAgICAgICAgdmFyIHNwZWFraW5nVGltZSA9IG5vdyAtIHRoaXMucGFydGljaXBhbnRzW2luaXRpYWxJZF0ubGFzdFN0YXJ0U3BlYWtpbmc7XG4gICAgICAgICAgICB0aGlzLl9sb2dnZXIubG9nKFwic3BlYWtpbmdUaW1lIGlzICdcIiArIHNwZWFraW5nVGltZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlci5sb2coXCJwcmV2aW91cyB0b3RhbFNwZWFraW5nVGltZSB3YXMgJ1wiICsgdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS50b3RhbFNwZWFraW5nVGltZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzW2luaXRpYWxJZF0udG90YWxTcGVha2luZ1RpbWUgPSB0aGlzLnBhcnRpY2lwYW50c1tpbml0aWFsSWRdLnRvdGFsU3BlYWtpbmdUaW1lICsgc3BlYWtpbmdUaW1lO1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNbaW5pdGlhbElkXS5sYXN0U3RhcnRTcGVha2luZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBNZWV0aW5nQ29udHJvbGxlcjtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBNZWV0aW5nQ29udHJvbGxlcjtcbiIsIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubWljcm9waG9uZVN0YXR1c2VzID0gZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyA9IHZvaWQgMDtcbnZhciBqc0NvbnRyb2xsZXJDb2RlcztcbihmdW5jdGlvbiAoanNDb250cm9sbGVyQ29kZXMpIHtcbiAgICBqc0NvbnRyb2xsZXJDb2Rlc1tcInBhcnRpY2lwYW50c0NvbnRhaW5lckJveFwiXSA9IFwiTUpmanlmXCI7XG4gICAganNDb250cm9sbGVyQ29kZXNbXCJwYXJ0aWNpcGFudEJveFwiXSA9IFwiSjNDdFhcIjtcbiAgICBqc0NvbnRyb2xsZXJDb2Rlc1tcInBhcnRpY2lwYW50TmFtZUJveFwiXSA9IFwiR1Fuc0dkXCI7XG4gICAganNDb250cm9sbGVyQ29kZXNbXCJtaWNyb3Bob25lQm94XCJdID0gXCJFUzMxMGRcIjtcbn0pKGpzQ29udHJvbGxlckNvZGVzID0gZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyB8fCAoZXhwb3J0cy5qc0NvbnRyb2xsZXJDb2RlcyA9IHt9KSk7XG47XG52YXIgbWljcm9waG9uZVN0YXR1c2VzO1xuKGZ1bmN0aW9uIChtaWNyb3Bob25lU3RhdHVzZXMpIHtcbiAgICBtaWNyb3Bob25lU3RhdHVzZXNbXCJzaWxlbmNlXCJdID0gXCJnamc0N2NcIjtcbn0pKG1pY3JvcGhvbmVTdGF0dXNlcyA9IGV4cG9ydHMubWljcm9waG9uZVN0YXR1c2VzIHx8IChleHBvcnRzLm1pY3JvcGhvbmVTdGF0dXNlcyA9IHt9KSk7XG4iLCJPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgTWVldGluZ0NvbnRyb2xsZXJfMSA9IHJlcXVpcmUoXCIuLi9NZWV0aW5nQ29udHJvbGxlclwiKTtcbmNvbnNvbGUubG9nKFwiQ2lhb1wiKTtcbm5ldyBNZWV0aW5nQ29udHJvbGxlcl8xLmRlZmF1bHQoKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9jb250ZW50c2NyaXB0L2NvbnRlbnRzY3JpcHQudHNcIik7XG4vLyBUaGlzIGVudHJ5IG1vZHVsZSB1c2VkICdleHBvcnRzJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG4iXSwic291cmNlUm9vdCI6IiJ9