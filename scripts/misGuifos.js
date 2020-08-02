let recorder;
let gifCreated = document.querySelector(".preview-gif");
let blob;
let tracks;
const uploadURL = "https://upload.giphy.com/v1/gifs";
const getURL = "https://api.giphy.com/v1/gifs/"
const apiKey = "e6yMqRMFhgIevwx6utNWn23fX7ERX9Rp"; // Public API Key

const constraints = {
    audio: false,
    video: {
        width: {min: 600, ideal: 832, max: 832},
        height: {min: 350, ideal: 434, max: 434}
    }
};

const myGifObject = {
    type: 'gif',
}; 

window.addEventListener('load', (event) => {
    buildImagesFromLocalStorage();
});

/* ------------- LOAD PAGE WITH SELECTED THEME ------------- */
swapTheme();
if(localStorage.getItem("clickOnNavButton") === "btn-misGuifos"){
    misGuifosButton();
}
else if(localStorage.getItem("clickOnNavButton") === "button-create"){
    createGuifosButton();
}

/* ------------- BACK TO HOME ------------- */
document.querySelector(".gif-logo").addEventListener("click", function(){
    window.location.href = "index.html";
})

/* ------------- MIS GUIFOS BUTTON ------------- */

function misGuifosButton() {
    localStorage.setItem("clickOnNavButton", "btn-misGuifos");
    displayMainMisGuifos(true, true, false);
}

/* ------------- CREAR GUIFOS ------------- */

function createGuifosButton() {
    localStorage.setItem("clickOnNavButton", "button-create");
    toggleShowCrearGuifosWindow(true);
    displayMainMisGuifos(false, true, true);
}

async function comenzarGuifosBttn() {
    toggleShowCrearGuifosWindow(false);
    toggleShowNavButtons(false);
    toggleShowGoBackArrow(false);
    toggleShowMisGuifosSection(false);
    toggleShowPreCaptureWindow(true);
    
    await captureCamera(constraints);
}

function toggleShowNavButtons(state) {
    const navButtons = document.querySelector(".buttons");
    navButtons.style.display = (state === true) ? "block" : "none";
}

function toggleShowGoBackArrow(state) {
    const arrow = document.querySelector("#go-back");
    arrow.style.display = (state === true) ? "block" : "none";
}

function toggleShowCrearGuifosWindow(state){
    const guifosWindow = document.querySelector(".crear-guifos-cont");
    guifosWindow.style.display = (state === true) ? "block" : "none";
}

function cancelGuifosBttn() {
    displayMainMisGuifos(true, true, false);
    toggleShowCrearGuifosWindow(false);
}

function displayMainMisGuifos(navBttn, mgSection, arrow) {
    toggleShowNavButtons(navBttn);
    toggleShowMisGuifosSection(mgSection);
    toggleShowGoBackArrow(arrow);
}

function toggleShowMisGuifosSection(state) {
    const misGuifosSection = document.querySelector(".mg-section");

    if(state === true){
        misGuifosSection.style.display = "block";
    }
    else {
        misGuifosSection.style.display = "none";
    }
}

function toggleShowPreCaptureWindow(state){
    const preCaptureWindow = document.querySelector(".check-container");
    preCaptureWindow.style.display = (state === true) ? "block" : "none";
}

function toggleShowCaptureWindow(state){
    const captureWindow = document.querySelector(".capturing-container");
    captureWindow.style.display = (state === true) ? "block" : "none";
}

function toggleShowPreviewWindow(state){
    const previewWindow = document.querySelector(".preview-container");
    previewWindow.style.display = (state === true) ? "block" : "none";
}

function toggleShowUploadingWindow(state){
    const uploadingWindow = document.querySelector(".uploading-container");
    uploadingWindow.style.display = (state === true) ? "block" : "none";
}

async function toggleShowSuccessWindow(state){
    const successWindow = document.querySelector(".success-container");
    const downloadButton = document.querySelector(".bttn-download-guifo");
    if(state === true){
        successWindow.style.display = "block";
        await getMyGifByID();
        const savedGif = localStorage.getItem("myGifImage");
        const savedGifObj = JSON.parse(savedGif);
        const myGifImage = document.querySelector(".success-img");
        myGifImage.src = savedGifObj.url;
        downloadButton.href = savedGifObj.url;
    } 
    else{
        successWindow.style.display = "none";
    }
}

function capturarCloseButton() {
    displayMainMisGuifos(true, true, false);
    toggleShowPreCaptureWindow(false);
}

async function getMyGifByID() {
    const gifID = localStorage.getItem("myGifID");
    const gifURL = getURL + "" + gifID + "?api_key=" + apiKey;
    let myGifSearch = await fetch(gifURL, {method: 'GET'})
        .then(data => data.json())
        .then(response => {
            if(response.data){
                let myGifImage = response.data.images.downsized_medium;
                localStorage.setItem("myGifImage", JSON.stringify(myGifImage));
            }
        })
        .catch(error => console.error(error));
    return myGifSearch;
}

/* ------------- RECORD RTC ------------- */

async function captureCamera(constraints){
    let stream = null;
    tracks = new Array();
    const videoPreview = document.querySelector(".precapturing-cont");
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoPreview.srcObject = stream;
        tracks = stream.getTracks();
        document.querySelector(".close-bttn").addEventListener("click", function() { 
            for(const track of tracks){
                track.stop();
            }
            toggleShowPreCaptureWindow(false);
            displayMainMisGuifos(true, true, false);
        });
    }
    catch(error){
        alert("Unable to capture your camera.");
        console.error(error);
    }
}

async function recordButtonOn(){
    //If capture button is clicked, start recording
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    toggleShowPreCaptureWindow(false);
    toggleShowCaptureWindow(true);
    const capturingGif = document.querySelector(".capturing-cont");
    capturingGif.srcObject = stream;
    recordVideo(capturingGif.srcObject);
}

function recordVideo(camera){
    recorder = RecordRTC(camera, myGifObject);
    recorder.startRecording();
    recorder.camera = camera;
}

function stopRecordingCallback() {
    blob = recorder.getBlob();
    gifCreated.src = URL.createObjectURL(blob);
    recorder.camera.stop();
}

function closeCapturingButtonOn() {
    //If close button is clicked, stop recording
    recorder.stopRecording();
    stopRecordingCallback();

    //Turn off camera
    tracks[0].stop();

    toggleShowCaptureWindow(false);
    displayMainMisGuifos(true, true, false);
}

function listoStopButtonOn() {
    //If Listo button is clicked, stop recording and make preview
    recorder.stopRecording();
    toggleShowCaptureWindow(false);
    toggleShowPreviewWindow(true);
    stopRecordingCallback();

    //Turn off camera
    tracks[0].stop();
}

async function repeatButtonOn() {
    //If repeat button is clicked, go back to PreCapture adn capture camera again
    toggleShowPreviewWindow(false);
    toggleShowPreCaptureWindow(true);
    await captureCamera(constraints);
}

async function uploadButtonOn() {
    let fileName = prompt("Ingrese un nombre para su Guifo:");
    fileName = fileName + ".gif";

    //If upload button is clicked, go to uploading window and upload gif
    toggleShowPreviewWindow(false);
    toggleShowUploadingWindow(true);
    
    let form = new FormData();
    form.append('file', blob, String(fileName));

    const controller = new AbortController();
    const signal = controller.signal;
    const abortBtnClose = document.querySelector(".cancel-button");
    abortBtnClose.addEventListener('click', () => {
        if (controller) {
            controller.abort();
            closeUploadButtonOn();
        }
    });

    const abortBtnCancel = document.querySelector(".cancel-button");
    abortBtnCancel.addEventListener('click', () => {
        if (controller) {
            controller.abort();
            cancelUploadButtonOn();
        }
    });
    const uploadingURL = uploadURL + "?api_key=" + apiKey;
    
    let response = await fetch(uploadingURL, {
        method: 'POST',
        body: form
    });

    //@TO-DO: FIX SIGNAL ABORT CONTROLLER
    /*let response = await fetch(uploadingURL, {signal},{
        method: 'POST',
        body: form
    });*/

    if(response.ok){
        let jsonData = await response.json();
        localStorage.setItem("myGifID", jsonData.data.id);
        toggleShowUploadingWindow(false);
        toggleShowSuccessWindow(true);
        displayMainMisGuifos(false, true, true);
        toggleShowGoBackArrow(true); 
    }
    else{
        console.error("Error al subir el archivo a Giphy");
        alert("Error al subir el archivo");
        toggleShowUploadingWindow(false);
        displayMainMisGuifos(true, true, false);
    }
}

function closeUploadButtonOn() {
    toggleShowUploadingWindow(false);
    displayMainMisGuifos(true, true, false);
}

function cancelUploadButtonOn() {
    toggleShowUploadingWindow(false);
    displayMainMisGuifos(true, true, false);
}

function closeSuccessButtonOn() {
    toggleShowSuccessWindow(false);
    displayMainMisGuifos(true, true, false);
}

function listoSuccessButtonOn() {
    const savedGif = localStorage.getItem("myGifImage");
    const gifObject = JSON.parse(savedGif);
    buildMyGuifosImages(gifObject.url);
    toggleShowSuccessWindow(false);
    displayMainMisGuifos(true, true, false);
}

function buildMyGuifosImages(gifUrl) {
    let divImageTag = document.createElement("div");
    divImageTag.className = "mg-img-container";
    divImageTag.style.cursor = "pointer";

    let divImageContainer = document.createElement("div");
    divImageContainer.className = "inner-container";

    let divImageBorder = document.createElement("div");
    divImageBorder.className = "hover-border";

    let imageTag = document.createElement("img");
    imageTag.src = gifUrl;
    imageTag.className = "mg-img";
    
    let appendSite = document.querySelector(".mg-gifs-container");
    divImageBorder.appendChild(imageTag);
    divImageContainer.appendChild(divImageBorder);
    divImageTag.appendChild(divImageContainer);
    appendSite.appendChild(divImageTag);

    saveSrcImageToLocalSotrage(imageTag.src);
}

function saveSrcImageToLocalSotrage(imageSrc) {
    if(!localStorage.getItem("mySavedGifs")){
        let mySavedGifs = new Array();
        mySavedGifs.push(imageSrc);
        mySavedGifs = [...new Set(mySavedGifs)];
        localStorage.setItem("mySavedGifs", JSON.stringify(mySavedGifs));
    }
    else{
        let mySavedGifs = JSON.parse(localStorage.getItem("mySavedGifs"));
        mySavedGifs.push(imageSrc);
        mySavedGifs = [...new Set(mySavedGifs)];
        localStorage.setItem("mySavedGifs", JSON.stringify(mySavedGifs));
    }
}

function buildImagesFromLocalStorage() {
    let srcArray = JSON.parse(localStorage.getItem("mySavedGifs"));
    srcArray = [...new Set(srcArray)];
    srcArray.forEach(element =>{
        buildMyGuifosImages(element);
    })
}

function downloadGif(){
    invokeSaveAsDialog(blob);
    recorder.destroy();
    recorder = null;
}

function updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function() {
      alert("Link copiado en el portapapeles");
    }, function() {
      console.error("No se puedo copiar al portapapeles");
    });
}

function copyToClipboard() {
    const savedGif = JSON.parse(localStorage.getItem("myGifImage"));
    const copyText = savedGif.url;
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
            updateClipboard(copyText)
        }
    });
}