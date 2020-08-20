/* UI STUFF */

// setUpHelp bootstraps the help mechanism.
function setUpHelp() {
    var helpEl = document.getElementById('help')
    var currentClass = helpEl.className
    document.getElementById('helpOpen').onclick = () => {
        helpEl.className += " is-active";
    }
    helpEl.lastElementChild.onclick = () => {
        helpEl.className = currentClass;
    }
}

// setUpLoad bootstraps the load mechanism.
function setUpLoad() {
    function importStuff() {
        var x = document.getElementById('importContent').innerText;
        try {
            localStorage.setItem(ALIASES_KEY, x);
            loadEl.className = currentClass;
            displayContent("loaded")
            listAll()
        } catch (err) {
            alert("loading: " + err)
        }
    }

    var loadEl = document.getElementById('load')
    var currentClass = loadEl.className
    document.getElementById('loadOpen').onclick = () => {
            loadEl.className += " is-active";
        }
        // add handler for cancel button
    document.getElementById('submitLoadBtn').onclick = importStuff
        // add handler for cancel button
    document.getElementById('cancelLoadBtn').onclick = () => {
            loadEl.className = currentClass;
        }
        // add handler for top right cross
    loadEl.lastElementChild.onclick = () => {
        loadEl.className = currentClass;
    }
}
