const meetNewUrl = 'https://meet.google.com/new'
let redirect = false
let tabIndex = null
let intervalToJoin = null
let intervalSetEnvironment = null
let retryTimes = 10

let intervalToJoinFunc = function (tab) {
  chrome.tabs.sendMessage(tab.id, { join: true }, function (resJoin) {
    if (resJoin.status) {
      clearInterval(intervalToJoin)
      intervalSetEnvironment = setInterval(intervalSetEnvironmentFunc.bind(null, tab), 500)
    }
  })
}

let intervalSetEnvironmentFunc = function (tab) {
  chrome.tabs.sendMessage(tab.id, { setEnvironment: true }, function (resEnv) {
    // dunno y but return false even when is true!
    if (resEnv.status || retryTimes === 0) {
      retryTimes = 10
      clearInterval(intervalSetEnvironment)
    } else {
      retryTimes -= 1
    }
  })
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.createMeeting) {
      chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        tabIndex = tabs[0].index
      });
      chrome.tabs.create({url: meetNewUrl})
    }
  }
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading' && changeInfo.url === meetNewUrl) {
    redirect = true
  }
  if (redirect && tabIndex >= 0 && changeInfo.status === 'complete' && tab.url !== meetNewUrl) {
    intervalToJoin = setInterval(intervalToJoinFunc.bind(null, tab), 500)
    redirect = false
    copyToClipboard(tab.url)
    // Back highlight tabs and reset old
    chrome.tabs.highlight({ tabs: tabIndex }, function () {
      tabIndex = null
    })
  }
})

function copyToClipboard(text) {
  const input = document.createElement('textarea')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('Copy')
  document.body.removeChild(input)
}
