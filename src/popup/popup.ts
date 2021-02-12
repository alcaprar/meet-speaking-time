chrome.storage.sync.get(["participants"], function(items){
  console.log(items)
  document.querySelector("#table").innerHTML = formatParticipants(items.participants)
});

function makeTableHTML(ar) {
  return `<table>${ar.reduce((c, o) => c += `<tr>${o.reduce((c, d) => (c += `<td>${d}</td>`), '')}</tr>`, '')}</table>`
}

function formatParticipants (participants) : string {
  return makeTableHTML(participants);
}