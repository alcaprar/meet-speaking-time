import { formatTime } from '../Utils'
import { MeetingInformation, Storage } from '../Storage'
import {debug} from "webpack";
const storage = new Storage()

new Vue({
  el: '#app',
  data () {
    return {
      history: [],
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
     ]
  }
  },
  mounted () {
    const _self = this
    storage.getHistory(function (history: [MeetingInformation]) {
      _self.convertHistory(history)
    })
  },
  computed: {
    historySpeaking () {
      const byMonths = this.history
        .reduce((r, v, i, a, k = v.month) => ((r[k] || (r[k] = [])).push(v), r), {})
      return Object.entries(byMonths).reduce((months, [key, val]) => {
        months[key] = {
          speakingMonth: val.map(v => Object.values(v.days)).flat().flat().map(d => d.elapsed).reduce((a, b) => a + b, 0),
          days: Object.entries(val[0].days).reduce((days, [keyDay, valDay]) => {
            days[keyDay] = valDay.map(d => d.elapsed).reduce((a, b) => a + b, 0)
            return days;
          }, {}),
        }
        return months;
      }, {})
    }
  },
  methods: {
    convertHistory (history) {
      const _self = this
      const byMonths = Object.values(history)
        .map(h => {
          // @ts-ignore
          const startedAt: Date = new Date(h.startedAt)
          // @ts-ignore
          h.key = `${startedAt.getFullYear()}-${startedAt.getMonth() < 10 ? `0${startedAt.getMonth()}` : startedAt.getMonth()}`
          // @ts-ignore
          h.date = `${startedAt.getFullYear()}-${startedAt.getMonth() < 10 ? `0${startedAt.getMonth()}` : startedAt.getMonth()}-${startedAt.getDay() < 10 ? `0${startedAt.getDay()}` : startedAt.getDay()}`
          // @ts-ignore
          h.elapsedTime = formatTime(h.elapsed, false)
          // @ts-ignore
          h.startedAt = startedAt
          // @ts-ignore
          h.participants = h.participants.map(p => ({
            name: p[0],
            spoke: p[1],
            percentage: p[2],
            image: p[3],
          }))
          return h
        })
        // @ts-ignore
        .reduce((r, v, i, a, k = v.key) => ((r[k] || (r[k] = [])).push(v), r), {})
      _self.history = Object.values(Object.entries(byMonths).reduce((months, [key, val]) => {
        months[key] = {
          month: key,
          days: val.reduce((r, v, i, a, k = v.date) => ((r[k] || (r[k] = [])).push(v), r), {}),
        }
        return months;
      }, {}))
    },
    getTotalMeetingTime () {
      return formatTime(Object.values(this.historySpeaking).map(t => t.speakingMonth).reduce((a, b) => a + b, 0), false)
    },
    getMonth (month) {
      const date = new Date(`${month}-01`)
      return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`
    },
    getTotalMeetingTimeMonth (month) {
      return formatTime(this.historySpeaking[month].speakingMonth, false)
    },
    getDay (day) {
      const date = new Date(day)
      return `${date.getDay()}/${date.getMonth()+1}/${date.getFullYear()}`
    },
    getTotalMeetingTimeDay (month, day) {
      return formatTime(this.historySpeaking[month].days[day], false)
    },
  }
})
