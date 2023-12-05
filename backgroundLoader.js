console.log("backgroundLoader.js")
console.log("Fetching background.js..")
import background from "https://cdn.jsdelivr.net/gh/Addaxs/RRR@latest/background.js"
import content from "https://cdn.jsdelivr.net/gh/Addaxs/RRR@latest/content.js"
console.log(content)


console.log("Got background.js! Executing..")
background();
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url?.startsWith("chrome://")) return undefined;
    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: content
        });
    }
});
console.log("background.js executed sucessfully.")


