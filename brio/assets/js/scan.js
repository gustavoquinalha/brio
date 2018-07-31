/* TODO:
 * - treat strings for matching with regex for special characters
 */

// collect text from page
const content = {
  pageText: document.body.innerText,
  requestAPI: () => { // retrieve data from API
    if (Object.keys(content.resultAPI).length === 0) {
        return new Promise(resolve => {
          fetch(
            'https://brasil.io/api/dataset/socios-brasil/socios/data?format=json'
          ).then(
            res => {
              if (res.status !== 200) {
                resolve("Request status: " + res.status + " - This doesn't look right...");
              }
              res.json().then(data => {
                console.log(data);
                content.resultAPI = data;
                resolve(content.resultAPI);
              })
            }).catch( err => {
              console.log("ERR:: The fetch API request returned an error: " + err);
              resolve(err);
            });
        });
    } else { return content.resultAPI }
  },
  analyzeAPI: (data, selection, type="default") => { // compare strings for matching data
    if (type === "default") {
      Array.from(data, list => {
        for (i in list) {
          let text = String(list[i]);
          if (selection) {
            selection.match(text) ? console.log("Text: " + text + " " + selection.match(text)) : console.log("No results for this selection: " + String(selection) + " in the dataset: " + String(content.resultAPI.next));
          } else {
            content.pageText.match(text) ? console.log("Text: " + text + " " + content.pageText.match(text)) : console.log("No results in dataset: " + String(content.resultAPI.next));
          }
        }
      });
    } else {
      console.log("Did you choose the type correctly? Type: " + type);
    }
  },
  resultAPI: {}
}

// fetch Brasil.io API for suggesting matching strings
async function globalMatch(selection="") {
  var result = await content.requestAPI();
  selection.length !== 0 ? content.analyzeAPI(content.resultAPI.results, selection) : content.analyzeAPI(content.resultAPI.results);
}

// wait to DOM Render before requesting data
window.addEventListener("load", () => {
  if (document.readyState === "complete") {
    globalMatch();
  }
});

// get selected text on page
function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type !== "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

// listener for text selection and matching strings
document.addEventListener("selectionchange", e => {
  console.dir(e);

  // collect text selection
  var textSelect = "";
  window.setTimeout(function() {
    textSelect = getSelectionText();
    if (textSelect.length > 0) {
      globalMatch(textSelect);
    }
  }, 1000);
});
