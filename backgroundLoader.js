console.log("backgroundLoader.js")
console.log("Fetching background.js..")
import background from "https://cdn.jsdelivr.net/gh/Addaxs/RRR@latest/background.js"
import content from "https://cdn.jsdelivr.net/gh/Addaxs/RRR@latest/content.js"
console.log("Got background.js! Executing..")
background();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: injectContentScript
      });
    }
  });
  
  function injectContentScript() {
    console.log("contentLoader.js")
  console.log("Fetching content.js..")
  console.log("Got content.js! Executing..")
  content();
  }
console.log("background.js executed sucessfully.")


