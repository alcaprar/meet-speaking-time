import { formatTime } from '../Utils'
import { MeetingInformation, Storage } from '../Storage'
const storage = new Storage()

new Vue({
  el: '#app',
  data () {
    return {
      participants: [],
      elapsed: null,
    }
  },
  mounted () {
    const _self = this
    setInterval(() => {
      _self.updateView()
    }, 1000)
  },
  methods: {
    async createMeeting () {
      const createMeeting = await chrome.runtime.sendMessage({ createMeeting: true })
      console.log('createMeeting', createMeeting)
    },
    async updateView () {
      const _self = this
      storage.getCurrent(function (currentMeeting: MeetingInformation) {
        _self.participants = currentMeeting.participants
        _self.elapsed = formatTime(currentMeeting.elapsed, false)
      })
      // TODO there should be also the history object
    },
    openOption () {
      chrome.runtime.openOptionsPage();
    },
  }
})
