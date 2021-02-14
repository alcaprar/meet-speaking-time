chrome.storage.sync.get(["participants"], function(items){
  console.log(items)
  document.querySelector("#table").innerHTML = formatParticipants(items.participants)
});

function makeTableHTML(ar) {
  return `${ar.reduce((c, o) => c += `<div class="bg-white p-2 flex items-center rounded mt-1 border-b border-grey cursor-pointer hover:bg-gray-100">
                                        <img src="https://i.imgur.com/OZaT7jl.png" class="rounded-full mr-2" />
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