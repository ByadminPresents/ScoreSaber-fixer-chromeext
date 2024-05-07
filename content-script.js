const innerHtml = (key) => `
<style>
.saberSaverButton {
    background-image: linear-gradient(to right,#fa152d,#9c49c7 54%,#137bf6); 
    color: white; 
    font-weight: 600; 
    width: fit-content; 
    text-align: center;
    display: block;
    margin: auto;
    border-style: none;
    padding: 9.75px;
    padding-top: 6px;
}

.saberSaverButton:hover {
    color: #eeeeee; 
}
            
/* Tooltip container */
.tooltip {
    position: relative;
    /*border-bottom: 1px dotted black; !* If you want dots under the hoverable text *!*/
    font-size: small;
}

/* Tooltip text */
.tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    height: fit-content;
    background-color: #555;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;

    /* Position the tooltip text */
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;

    /* Fade in tooltip */
    opacity: 0;
    transition: opacity 0.3s;
}

/* Tooltip arrow */
.tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

.beatSaverFix-parent {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.beatSaverFix-img {
    vertical-align: middle;
}

.beatSaverFix-p {
 vertical-align: middle;
 display: inline;
}
</style>
<div class="beatSaverFix-parent">
  <a href="https://beatsaver.com/maps/${key}" class="button tooltip saberSaverButton" target="_blank" rel="noopener noreferre">
    <p class="beatSaverFix-p">Go to Beatsaver</p>
    &ensp;
    <img class="beatSaverFix-img" src="${chrome.runtime.getURL("beatsaver-favicon-16x16.png")}" alt="Download Button" title="Download Button">
  </a>
</div>
`

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function loadBeatsaverAndInject(url, callback /*, opt_arg1, opt_arg2, ... */) {
    let xhr = new XMLHttpRequest();
    xhr.onload = callback;
    xhr.open("GET", url, true);
    xhr.send(null);
  }

let isInjected = false

function showBeatSaverButton() {
    let key = JSON.parse(this.responseText).id
  
    let downloadButtonElement = document.createElement('div');
    downloadButtonElement.innerHTML = innerHtml(key);
  
    let card = document
      .querySelector(".column > .card.map-card")
      .cloneNode(true)

    card.id = "GoToBeatSaverCard"

    let card_inner = card.firstChild
    while (card_inner.firstChild) {
      card_inner.removeChild(card_inner.firstChild);
    }

    while (card.childNodes.length !== 1) {
      card.removeChild(card.lastChild)
    }
  
    card_inner.appendChild(downloadButtonElement)
  
    card.classList.add("beatSaverFix")
  
    document.querySelector(".column > .card.map-card").append(card)
  }

let prev_url = new URL(window.location)

setInterval(function () {
    let url = new URL(window.location)
    if (url.pathname !== prev_url.pathname && url.pathname.startsWith("/leaderboard/")) {
        isInjected = false
    }
    prev_url = url
    if (document.getElementById("GoToBeatSaverCard") != null && document.querySelectorAll(".scoreSaverExtension-parent").length > 0)
    {
        document.getElementById("GoToBeatSaverCard").remove();
    }
    if (!isInjected)
    {
        let hash_element = document.querySelector("div.content > strong")
        if (hash_element !== undefined && hash_element !== null) {
            let song_hash = hash_element.textContent.trim();
            loadBeatsaverAndInject(`https://api.beatsaver.com/maps/hash/${song_hash}`, showBeatSaverButton)
            isInjected = true
    }
    waitForElm(".scoreSaverExtension-parent").then((elm) => {
        if (document.getElementById("GoToBeatSaverButton") != null)
            {
                return
            }
        isInjected = true
        if (document.getElementById("GoToBeatSaverCard") != null)
        {
            document.getElementById("GoToBeatSaverCard").remove();
        }
        button = document.createElement('a')
        button.className = "button tooltip saberSaverButton"
        var mapId = document.getElementsByClassName("scoreSaverExtension-parent")[0].firstElementChild.getAttribute('href')
    
        button.setAttribute('href', "https://beatsaver.com/maps/" + mapId.substring(mapId.lastIndexOf('/') + 1, mapId.length));
        button.setAttribute('target', "_blank")
        button.setAttribute('rel', "noopener noreferre")
        button.setAttribute('style', "background-image: linear-gradient(to right,#fa152d,#9c49c7 54%,#137bf6);")
        button.id = "GoToBeatSaverButton"
    
        beatsaverPic = document.createElement('img')
        beatsaverPic.className = "scoreSaverExtension-img"
        beatsaverPic.setAttribute('src', chrome.runtime.getURL("beatsaver-favicon-16x16.png"))
        text = document.createElement('p')
        text.appendChild(document.createTextNode("Go to Beatsaver  "))
        text.className = "scoreSaverExtension-p"
        button.appendChild(text)
        button.appendChild(beatsaverPic)
        elm.appendChild(button)
    });
}}, 100)