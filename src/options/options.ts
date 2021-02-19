import { formatTime } from '../Utils'
import { MeetingInformation, Storage } from '../Storage'
const storage = new Storage()

new Vue({
  el: '#app',
  data () {
    return {
      history: [],
    }
  },
  mounted () {
    const _self = this
    storage.getHistory(function (history: [MeetingInformation]) {
      _self.convertHistory(history)
    })
  },
  methods: {
    convertHistory (history) {
      const _self = this
      const byMonths = Object.values(history)
        .map(h => {
          // @ts-ignore
          const startedAt: Date = new Date(h.startedAt)
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
        .reduce((r, v, i, a, k = v.key) => ((r[k] || (r[k] = [])).push(v), r), {})
      _self.history = Object.entries(byMonths)
        .reduce((months, [key, val]) => {
            months[key] = val.reduce((r, v, i, a, k = v.date) => ((r[k] || (r[k] = [])).push(v), r), {})
            return months;
          }, {}
        )
    }
  }
})
