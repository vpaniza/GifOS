const storedTheme = localStorage.getItem("selectedTheme");
setTheme();

function swapTheme() {
    let checkedTheme = document.querySelector('input[name="temas"]:checked'); 
    const styleSheets = document.getElementById('selectedTheme');
    const gifosLogo = document.querySelector(".logo");
    
    if (checkedTheme.className === "radioDay") {
        styleSheets.setAttribute('href', 'styles/theme_day.css');
        gifosLogo.src = "images/gifOF_logo.png";
        localStorage.setItem("selectedTheme", "DayTheme");
    }
    else if (checkedTheme.className === "radioNight") {
        styleSheets.setAttribute('href', 'styles/theme_night.css');
        gifosLogo.src = "images/gifOF_logo_dark.png";
        localStorage.setItem("selectedTheme", "DarkTheme");
    }
    else {
        console.error("Error: ningun tema seleccionado");
    }
}

function setTheme() {
    const styleSheets = document.getElementById('selectedTheme');
    const gifosLogo = document.querySelector(".logo");
    if (!storedTheme) {
        //When user opens site for the first time, set the default theme
        document.querySelector(".radioDay").checked = true;
        localStorage.setItem("selectedTheme", "DayTheme");
        styleSheets.setAttribute('href', 'styles/theme_day.css');
        gifosLogo.src = "images/gifOF_logo.png"
    }
    else if(storedTheme === "DayTheme"){
        document.querySelector(".radioDay").checked = true;
        localStorage.setItem("selectedTheme", "DayTheme");
        styleSheets.setAttribute('href', 'styles/theme_day.css');
        gifosLogo.src = "images/gifOF_logo.png"
    }
    else if(storedTheme === "DarkTheme"){
        document.querySelector(".radioNight").checked = true;
        localStorage.setItem("selectedTheme", "DarkTheme");
        styleSheets.setAttribute('href', 'styles/theme_night.css');
        gifosLogo.src = "images/gifOF_logo_dark.png";
    }
}