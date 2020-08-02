const apiKey = "e6yMqRMFhgIevwx6utNWn23fX7ERX9Rp"; // Public API Key
const queryURL = "https://api.giphy.com/v1/gifs/";

setTheme();
toggleShowSearchResultSection(false);
buildTrendingImages();
hideClickOutSearchMenu();

document.querySelector(".button-create").addEventListener("click", function() {
    localStorage.setItem("clickOnNavButton", "button-create");
    window.location.href = "misGifos.html";
});

document.querySelector(".btn-misGuifos").addEventListener("click", function() {
    localStorage.setItem("clickOnNavButton", "btn-misGuifos");
    window.location.href = "misGifos.html";
});

/* ------------- SEARCH SECTION ------------- */
const focusInputSearch = document.querySelector('input[class="input-text"]');
const numberSearchGifs = 16;

function toggleInputSearchOnFocus(state) {
    let searchButton = document.querySelector("#buscar-bttn");
    let searchLupa = document.querySelector(".lupa-gris");

    if(state){
        toggleShowSearchMenu(state);
        focusInputSearch.value = "";
        searchButton.className = "buscar-bttn-active";
        searchLupa.src = "images/lupa.svg";
    }
    else{
        toggleShowSearchMenu(state);
        focusInputSearch.value = "Busca gifs, hashtags, temas, busca lo que quieras…";
        searchButton.className = "buscar-bttn";
        searchLupa.src = "images/lupa_inactive.svg";
    }
}

function getInputTextValue() {
    let inputTerm = focusInputSearch.value;
    inputTerm = inputTerm.trim().replace(/ /g, "+");
    return inputTerm;
}

function enterClick(e) {
    const code = (e.keyCode ? e.keyCode : e.which);
    if (code === 13){
        submitSearch();
    }
}

async function searchGifs(query) {
    //We need to overwrite the stored gifs so that only the new search results are shown
    localStorage.removeItem("gifsArray");

    //We also need to delete from the html the gifs that are being shown according to previous search
    removeOldSearchGifs();
    toggleShowSearchResultSection(false);
    toggleShowTrendingImages(false);

    const searchResults = await giphyStoreSearchGifs(query);
    if (getSearchResults(numberSearchGifs) === false){
        toggleShowTrendingImages(true);
        toggleInputSearchOnFocus(false);
        alert("No query inserted!");
    }
    else {
        buildSearchResults(query);
        const searchResultSection = document.querySelector(".search-results-sec");
        searchResultSection.scrollIntoView(true);
    }
}

async function submitSearch() {
    const inputTerm = getInputTextValue();
    searchGifs(inputTerm);
}

function buildSearchResults(inputTerm) {
    const searchResultsArray = getSearchResults(numberSearchGifs);
    
    const searchResultsHeader = document.querySelector(".search-results-header");
    searchResultsHeader.querySelector("h3").innerHTML = inputTerm;

    toggleShowSearchResultSection(true);
    toggleInputSearchOnFocus(false);

    const divImageContainer = document.createElement("div");
    divImageContainer.className = "search-results-container";

    searchResultsArray[0].forEach((element,index) => {
        let divElementsContainer = document.createElement("div");
        divElementsContainer.className = "s-img-container";

        let divInnerContainer = document.createElement("div");
        divInnerContainer.className = "inner-container";

        let divInnerBorder = document.createElement("div");
        divInnerBorder.className = "hover-border";

        let divImageTitle = document.createElement("div");
        divImageTitle.className = "s-img-title";
        let pImageTitle = document.createElement("p");
        pImageTitle.innerHTML = "#" + searchResultsArray[1][index];
        
        let imageItself = document.createElement("img");
        imageItself.src = element.url;
        imageItself.className = "search-img";

        let imageWidth = parseInt(element.width);
        let imageHeight = parseInt(element.height);
        let maxRatio = 1.8 * imageHeight;
        if(imageWidth > maxRatio) {
            divElementsContainer.style.width = "600px";
        }
        else {
            divElementsContainer.style.width = "294px";
        }
        imageItself.style.objectFit = "cover";

        divImageTitle.appendChild(pImageTitle);
        divInnerBorder.appendChild(divImageTitle);
        divInnerBorder.appendChild(imageItself);
        divInnerContainer.appendChild(divInnerBorder);
        divElementsContainer.appendChild(divInnerContainer);
        divImageContainer.appendChild(divElementsContainer);
    });  
    let appendSite = document.querySelector(".search-results-sec");
    appendSite.appendChild(divImageContainer);
}

function removeOldSearchGifs(){
    const divImageContainer = document.querySelector(".search-results-container");
    if(divImageContainer !== null){
        divImageContainer.parentNode.removeChild(divImageContainer);
    }
}

function toggleShowTrendingImages(state){
    const trendingSection = document.querySelector(".tendencias");
    if(state === true){
        trendingSection.style.display = "block";
    }
    else if (state === false){
        trendingSection.style.display = "none";
    }       
}

function toggleShowSearchResultSection(state) {
    const searchResultsSection= document.querySelector(".search-results-sec");
    if(state === true) {
        searchResultsSection.style.display = "block";
    }
    else {
        searchResultsSection.style.display = "none";
    }
}

function toggleShowSearchMenu(state) {
    const searchSuggMenu= document.querySelector(".search-sugg");
    if(state === true) {
        searchSuggMenu.style.display = "block";
    }
    else{
        searchSuggMenu.style.display = "none";
    }
}

function hideClickOutSearchMenu(){
    const searchMenuContainer = document.querySelector(".searcher-input");
    document.addEventListener('click', function(event) {
        let isClickInside = searchMenuContainer.contains(event.target);
        if (!isClickInside) {
            toggleInputSearchOnFocus(false);
        }
    });
}

async function giphyStoreSearchGifs(inputTerm) {
    let limit = String(numberSearchGifs);
	let querySearch = queryURL + "search?q=" + inputTerm + "&limit=" + limit + "&api_key=" + apiKey;

    let gifSearch = await fetch(querySearch, {method: 'GET'})
        .then(data => data.json())
        .then(response => {
            const gifsArray = new Array();
            if(response.data){
                response.data.forEach(element => {
                    let gifObject = new Object();
                    gifObject.id = element.id;
                    gifObject.title = element.title;
                    gifObject.images = element.images;
                    gifObject.url = element.url; 
        
                    gifsArray.push(gifObject);
                });
            }
            const gifsArrayJSON = JSON.stringify(gifsArray);
            localStorage.setItem("gifsArray", gifsArrayJSON);
        })
        .catch(error => console.error(error));
    return gifSearch;
}

function getSearchResults(maxSearchGifs) {
    const searchStoredGifsJSON =  localStorage.getItem("gifsArray"); 
    const searchStoredGifsObj =  JSON.parse(searchStoredGifsJSON);

    let imagesSearch = new Array();
    let imagesTitles = new Array();
    if( searchStoredGifsObj.length === 0){
        let error = false;
        return error;
    }
    else {
        for(let i = 0; i < maxSearchGifs; i++ ){
            imagesSearch.push(searchStoredGifsObj[i].images.downsized_medium);
            imagesTitles.push(searchStoredGifsObj[i].title);
        }
        const searchResults = [imagesSearch, imagesTitles]
        return searchResults;
    }
}


/* ------------- AUTOCOMPLETE SECTION ------------- */

async function giphyStoreAutocomplete() {
    let limit = "3"; // Limit API to 3 gifs for 3 corresponding suggestions
    let q = getInputTextValue();

    if (q === ""){
        localStorage.setItem("tagsAutocomplete", "");
    }
    else {
        let queryAutocomplete = queryURL + "search/tags?api_key=" + "e6yMqRMFhgIevwx6utNWn23fX7ERX9Rp" + "&q=" + q ; //+ "&limit=" + limit;
        let tagAutocomplete = await fetch(queryAutocomplete, {method: 'GET'})
            .then(data => data.json())
            .then(response => {
                const tagsArray = new Array();
                if(response.data){
                    response.data.forEach((element,index) => {
                        if(index < parseInt(limit)) {
                            let tagObject = new Object();
                            tagObject.tag = element.name;
                            tagsArray.push(tagObject);
                        }
                    });
                }
                const tagsAutocompleteJSON = JSON.stringify(tagsArray);
                localStorage.setItem("tagsAutocomplete", tagsAutocompleteJSON);
            })
            .catch(error => console.error(error));
        return tagAutocomplete;
    }
}

async function fillAutocompleteButtons() {
    const storeAutocomplete = await giphyStoreAutocomplete();
    const storedTagsJSON = localStorage.getItem("tagsAutocomplete");
    const suggestionsParent = document.querySelector(".s-sugg");
    const suggestionsChildren = suggestionsParent.children;

    if (storedTagsJSON.length === 0 ) {
        Object.values(suggestionsChildren).forEach((element,index) => {
            element.children.innerHTML = "Aca va una sugerencia random";
        });
    }
    else if (storedTagsJSON.length !== 0 ) {
        const tagsArrayObj = JSON.parse(storedTagsJSON);
        if(Object.values(suggestionsChildren)){
            Object.values(suggestionsChildren).forEach((element,index) => {
                element.children[0].innerHTML = tagsArrayObj[index].tag;
                console.log(tagsArrayObj[index]);
            });
        }
    }
}

function searchAutocompleteTag(clickedClass) {
    const clickedClassStr = "." + clickedClass;
    const tagClicked = document.querySelector(clickedClassStr)
    let text = tagClicked.children[0].innerHTML
    text = text.trim().replace(/ /g, "+");
    searchGifs(text);
}


/* ------------- SUGGESTION SECTION ------------- */

async function giphyFindSuggestions(topic) {
    const limit = "1";
    let querySuggestions = queryURL + "search?q=" + topic + "&limit=" + limit + "&api_key=" + apiKey;

    let gifSearch = await fetch(querySuggestions, {method: 'GET'})
        .then(data => data.json())
        .then(response => {
            const gifsSuggestionsArray = new Array();

            response.data.forEach(element => {
                let gifObject = new Object();
                gifObject.id = element.id;
                gifObject.title = element.title;
                gifObject.images = element.images;
                gifObject.url = element.url; 
    
                gifsSuggestionsArray.push(gifObject);
            });
            storeSuggestions(gifsSuggestionsArray);
        })
        .catch(error => console.error(error));
    return gifSearch;
}

function storeSuggestions(suggArray) {
    const suggestionGifsJSON = localStorage.getItem("suggestionGifs"); 
    const suggestionGifsObj = JSON.parse(suggestionGifsJSON);
    const maxSuggestions = 4;

    if (suggestionGifsObj === null || suggestionGifsObj.length < maxSuggestions) {
        if (suggestionGifsJSON === null){
            suggestionGifsArr = [suggArray];
        }
        else if (suggestionGifsJSON !== null){
            suggestionGifsArr = suggestionGifsObj;
            suggestionGifsArr.push(suggArray);
        }
    }
    else {
        suggestionGifsArr = suggestionGifsObj;
        suggestionGifsArr.shift();
        suggestionGifsArr.push(suggArray);
    }
    localStorage.setItem("suggestionGifs", JSON.stringify(suggestionGifsArr));
}

async function loadSuggestionResults() {
    //Search for 4 predefined topics for suggestions
    const sugg1 = giphyFindSuggestions("awesome");
    const sugg2 = giphyFindSuggestions("clap");
    const sugg3 = giphyFindSuggestions("puppy");
    const sugg4 = giphyFindSuggestions("happy");

    let allPromises = [sugg1, sugg2, sugg3, sugg4];

    let allPromisesData = await Promise.all(allPromises);
}
    
async function getSuggestionResults() {
    await loadSuggestionResults();
    //Get from local storage the image and title
    const suggGifsJSON =  localStorage.getItem("suggestionGifs"); 
    const suggGifsObj =  JSON.parse(suggGifsJSON);
    const maxSuggestions = 4;

    let imagesSugg = new Array();
    let imagesTitles = new Array();
    if(!suggGifsObj){
        let error = false;
        return error;
    }
    else {
        for(let i = 0; i < maxSuggestions; i++ ){
            imagesSugg.push(suggGifsObj[i][0].images.downsized_medium.url);
            imagesTitles.push(suggGifsObj[i][0].title);
        }
        const suggestionResults = [imagesSugg, imagesTitles]
        return suggestionResults;
    }
}

async function buildSuggestionImages(){
    const suggestionImgArr = await getSuggestionResults();
    const suggGifContainer = document.querySelectorAll(".gif-preview");
    const titleContainer = document.querySelectorAll("h5"); 
    suggestionImgArr[0].forEach((element, index) => {
        let imageTag = document.createElement("img");
        imageTag.src = element;
        imageTag.className = "sugg-image";
        imageTag.style.objectFit = "cover";
        suggGifContainer[index].appendChild(imageTag);
        titleContainer[index].innerHTML = "#" + suggestionImgArr[1][index];
    });
}

buildSuggestionImages();


/* ------------- TRENDING SECTION ------------- */

async function giphyStoreTrendingGifs() {
	let limit = "12"; // Limit API to 20 gifs
	let queryTrending = queryURL + "trending?api_key=" + apiKey + "&limit=" + limit;
    
    let gifTrending = await fetch(queryTrending, {method: 'GET'})
        .then(data => data.json())
        .then(response => {
            const gifsTrendingArray = new Array();
            response.data.forEach(element => {
                let gifObject = new Object();
                gifObject.id = element.id;
                gifObject.title = element.title;
                gifObject.images = element.images;
                gifObject.url = element.url; 
    
                gifsTrendingArray.push(gifObject);
            });

            const gifsTrendingArrayJSON = JSON.stringify(gifsTrendingArray);
            localStorage.setItem("gifsTrendingArray", gifsTrendingArrayJSON);
        })
        .catch(error => console.error(error));
    return gifTrending;
}

async function getTrendingImages() {
    const trendingGifs = await giphyStoreTrendingGifs();
    const gifsTrendingArrayJSON = localStorage.getItem("gifsTrendingArray");
    const gifsTrendingArrayObj = JSON.parse(gifsTrendingArrayJSON);
    const maxTrendingGifs = gifsTrendingArrayObj.length;

    let imagesTrending = new Array();
    let titlesTrending = new Array();
    for(let i = 0; i<maxTrendingGifs; i++ ){
        imagesTrending.push(gifsTrendingArrayObj[i].images.downsized_medium);
        titlesTrending.push(gifsTrendingArrayObj[i].title);
    }
    const trendingResults = [imagesTrending, titlesTrending];
    return trendingResults;
}

async function buildTrendingImages() {
    const trendingArray = await getTrendingImages();

    trendingArray[0].forEach((element,index) => {
        let divImageTag = document.createElement("div");
        divImageTag.className = "trend-div";
        divImageTag.style.cursor = "pointer";

        let divImageContainer = document.createElement("div");
        divImageContainer.className = "div-image-container";

        let divImageBorder = document.createElement("div");
        divImageBorder.className = "div-image-border";

        let divImageTagTitle = document.createElement("div");
        divImageTagTitle.className = "div-image-title";
        divImageTagTitle.innerHTML = "#" + trendingArray[1][index].trim().replace(/ /g, " #");
        
        let imageTag = document.createElement("img");
        imageTag.src = element.url;

        let imageWidth = parseInt(element.width);
        let imageHeight = parseInt(element.height);
        let maxRatio = 1.8 * imageHeight;

        if(imageWidth > maxRatio) {
            divImageTag.style.width = "600px";
        }
        else {
            divImageTag.style.width = "294px";
        }
        imageTag.style.objectFit = "cover";
        
        let appendSite = document.querySelector(".images-tend");
        divImageBorder.appendChild(imageTag);
        divImageBorder.appendChild(divImageTagTitle);
        divImageContainer.appendChild(divImageBorder);
        divImageTag.appendChild(divImageContainer);
        appendSite.appendChild(divImageTag);
    })
    toggleShowTrendingImages(true);
}



