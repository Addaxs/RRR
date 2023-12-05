
var userInfo = null;
async function sendToBackground(data) {
    const response = await chrome.runtime.sendMessage(data);
    return response
}
let navbar = $Id("navbar");
let [fobloxBtn,settingsBtn] = navbar.children;
function switchNavbar(bool) {
    hidden($Id("nav-foblox"),!bool);
    hidden($Id("nav-settings"),bool);
    attribute(fobloxBtn,bool,"active")
    attribute(settingsBtn,!bool,"active")
}
fobloxBtn.onclick = () => {switchNavbar(true);}
settingsBtn.onclick = () => {switchNavbar(false);}
function hidden(div,shouldHide) {
    if(shouldHide) div.setAttribute("hidden","");
    else div.removeAttribute("hidden");    
}
function attribute(div,shouldSet,attribute,value="") {
    if(shouldSet) div.setAttribute(attribute,value);
    else div.removeAttribute(attribute);    
}
function $(str){
    return document.querySelector(str)
}
function $Id(str){
    return document.getElementById(str)
}
function $$(str){
    return document.querySelectorAll(str)
}
async function getUserInfo() {
    const payload = {
        method: "getUserInfo"
    }
    console.log("Requesting for user Info from popup.")
    const t1 = new Date().getTime()
    const response = await sendToBackground(payload);
    const timeTaken = new Date().getTime() - t1;
    console.log(response)
    console.log("Got response from background within " + timeTaken + " ms")
    
    
    if (response.ok) {
        console.log("Popup: response is ok");
        hidden($Id("join-player"),false)
        if(response.status === "playing") attribute($Id("join-btn"),false,"disabled")
        $Id("target-username").innerText = `Username: ${response.username} `
        $Id("target-status").innerText = `Status: ${response.status} `
        
        $Id("target-friends").innerText = `Friends: ${response.friends}`
        $Id("target-img").src = response.targetImg

        console.log(response)
    }else{
        
        console.log("Popup: response is NOT ok");
    }
    console.log(response.message)

}


getUserInfo();
