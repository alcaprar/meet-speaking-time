setInterval(function (){
  chrome.storage.sync.get(["participants"], function(items){
    document.querySelector("#table").innerHTML = formatParticipants(items.participants)
  });
  
  chrome.storage.sync.get(["elapsedTime"], function(items){
    document.querySelector("#totalTime").innerHTML = items.elapsedTime;
  })
}, 1000)

function makeTableHTML(ar) {
  return `${ar.reduce((c, o) => c += `<div class="bg-white p-2 flex items-center rounded mt-1 border-b border-grey cursor-pointer hover:bg-gray-100">
                                        <img src="${o[3]}" class="rounded-full mr-2" width="24px" heigth="24px" />
                                        <div class="flex flex-col w-full">
                                          <span>${o[0]}</span>
                                          <div class="flex items-center justify-between">
                                            <span>${o[1]}</span>
                                            <span>${o[2]}</span>
                                          </div>
                                        </div>
                                     </div>`, '')}`
}

function formatParticipants (participants) : string {
  return makeTableHTML(participants);
}