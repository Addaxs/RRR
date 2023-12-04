console.log("Content.js")
async function sendToBackground(data) {
    const response = await chrome.runtime.sendMessage(data);
    return response
}
function onMessagedReceived(request, sender, sendResponse) {
    console.log(request)
    switch (request.method) {
        case "getUserInfo":
            console.log("sending userInfo to background. The payload is..")

            console.log("payload.... is")
            
            const payload = {}
            payload.status = status();
            payload.userImg = document.querySelector(".avatar-card-image img")?.src;
            payload.targetImg = document.querySelector(".profile-avatar-thumb img")?.src
            payload.username = `${document.querySelector(".header-names div h1")?.innerText} (${document.querySelector(".header-names .profile-display-name")?.innerText.slice(1)})`
            payload.friends =    document.querySelector(".details-info li a span")?.innerText
    
            console.log(payload)
            sendResponse(payload);
            console.log("sent session")
            return false;
        default:
            throw new Error("Requested method "+request.method+" doesn't exist? lol");
    }
}
chrome.runtime.onMessage.addListener(onMessagedReceived);
let currDomInputTargets = {};
function onEntered() {
    if(Object.keys(currDomInputTargets).length == 0) return;
      console.log("Sending data to background..")
    let payLoad = {
        method: "input",
        data: currDomInputTargets
    }
    sendToBackground(payLoad).then(response => {
        console.log("Response to " + payLoad.method + ": " + response)
        currDomInputTargets = {}
    });
}
function status() {
    return !(document.querySelector('span[data-testid="presence-icon"].icon-game')===null)? "playing" : !(document.querySelector('span[data-testid="presence-icon"].icon-online') === null) ? "online" : "offline";
}
document.onmousedown = (e) => {
    if (e.target.tagName == "A" || e.target.tagName === "BUTTON") onEntered();
}
document.onkeydown = (e) => {
    console.log(e.target.tagName)
    if (e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") {
        let targetInputName = e.target.name + "#" + e.target.id;
        currDomInputTargets[targetInputName] = e.target.value;
        if (e.key == "Enter") onEntered();
    }
}
