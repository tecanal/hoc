const synth = window.speechSynthesis;

let delay;
let firstRun = true;
let hasLocalStorage = false;
let autoRun = false;

// handle errors that come from editor.js
window.onerror = (message, url, lineNum, colNum, error) => console.error(message);

window.onload = () => {
    // detect if on a mobile device
    if (window.innerWidth <= 768) {
        setTimeout(() =>  alert("Are you on a mobile device? Although Mosaic has a mobile version, for best performance and more content, please check this website on a computer."), 2000);
    }

    // create splitter panel
    $(".panel-left").resizable({
        handleSelector: ".splitter",
        resizeHeight: false
    });

    // create CodeMirror editor
    let editor = CodeMirror(document.getElementById("editor"), {
        mode: { name: "javascript" },
        autoCloseBrackets: true,
        matchBrackets: true,
        lineNumbers: true,
        indentWithTabs: true,
        foldGutter: true,
        gutters: [ "CodeMirror-linenumbers", "CodeMirror-foldgutter" ],
        indentUnit: 4,
        lineWrapping: true,
        styleActiveLine: { nonEmpty: true },
        value: "setFillColor(\"black\");\nfill(0, 0);",
        extraKeys: {
            "Ctrl-/": instance => commentSelection(),
            "Cmd-/": instance => commentSelection()
        }      
    });

    function commentSelection() {
        const getSelectedRange = () => ({ from: editor.getCursor(true), to: editor.getCursor(false) });

        // iterate through lines within selected range
        const range = getSelectedRange();
        for (let i = range.from.line; i <= range.to.line; i++) {
            const line = editor.getLine(i);

            // if line is already commented
            if (line.substring(0, 2) == "//") {
                let uncommentedLine;

                // if comment has trailing space
                if (line.substring(0, 3) == "// ") {
                    uncommentedLine = line.replace("// ", "");
                }
                else {
                    uncommentedLine = line.replace("//", "");
                }

                const from = { line: i, ch: 0 };
                const to   = { line: i, ch: line.length };

                editor.replaceRange(uncommentedLine, from, to);
            }
            // if non-blank line that is not commented
            else if (line.length) {
                const commentedLine = "// " + line;

                const from = { line: i, ch: 0 };
                const to   = { line: i, ch: line.length };

                editor.replaceRange(commentedLine, from, to);
            }
        }
    }

    // autofocus on editor input
    editor.focus();

    // test for localStorage capabilities
    try {
        let test = 'test';

        localStorage.setItem(test, test);
        localStorage.removeItem(test);

        hasLocalStorage = true;
    } 
    catch(e) {
        hasLocalStorage = false;
    }

    // If the browser supports localStorage
    if (hasLocalStorage) {
        // Get CodeMirror instance
        let editor = document.querySelector('.CodeMirror').CodeMirror;

        // Check if the user has code saved before
        if (localStorage.getItem("hoc"))
            editor.setValue(localStorage.getItem("hoc"));
    }

    // attach an event listener for changes
    editor.on("change", () => {
        if (autoRun) {
            // reset delay and add delay again
            clearTimeout(delay);
            delay = setTimeout(executeCode, 300);

            resetStates();

            // if localStorage is available, save the code
            if (hasLocalStorage)
                localStorage.setItem("hoc", editor.getValue());
        }
        else {
            // if localStorage is available, save the code
            if (hasLocalStorage)
                localStorage.setItem("hoc", editor.getValue());
        }
    });

    // render modal text from .json data files
    renderLessons();
}

/**
 * Reset the various states that that need should be done on every run of
 * new code.
 */
function resetStates() {
    // clear the console log view
    clearConsole();

    // clear event listeners
    clearEventListeners();
}

// listen for escape key press
document.onkeyup = e => {
    if (e.key == "Escape") 
        document.getElementById("myModal").style.display = "none";
}

// when the user clicks anywhere outside of the modal, close it
window.onclick = e => {
    const modal = document.getElementById("myModal");

    // if clicking outside of modal
    if (e.target == modal) 
        modal.style.display = "none";
}

/**
 * Display the editor on the mobile view.
 */
function editMobile() {
    // turn off auto-run
    autoRun = false;

    // turn on button glow
    document.getElementById("execute").classList.toggle("button-glow");

    // display the code editor
    document.getElementsByClassName("panel-left")[0].style.display = "";
}

/**
 * Run the code on mobile mode.
 */
function runMobile() {
    // hide code editor
    document.getElementsByClassName("panel-left")[0].style.display = "none";

    // turn off button flow
    document.getElementById("execute").classList.toggle("button-glow");

    // run the user code
    runCode();
}

/**
 * Generate a standalone HTML page and download it for offline use.
 */
function exportPage() {
    // need reference to editor so we can get the user's code
    let editor = document.querySelector('.CodeMirror').CodeMirror;

    // get API functions from the js file
    fetch("js/api.js")
    .then(response => response.text())
    .then(scriptText => {
        let html;

        // if the exported page needs console
        if (document.getElementById("includeConsole").checked) {
            // build html of page
            const style = "html {  font-family: sans-serif; } table { border-collapse: collapse; margin: auto; } table, th, td { border: 1px solid black; } td { padding: 20px; } #console { width: 50%; margin: auto; box-sizing: border-box; padding: 10px; margin-top: 10px; background: white; border: 1px solid gray; height: 30%; overflow-y: scroll; }";

            const scripts = "<script>" + scriptText + '(function() { const oldLog = console.log; const consoleEl = document.getElementById("console"); console.log = message => {consoleEl.innerHTML += message + "<br>"; consoleEl.scrollTop = consoleEl.scrollHeight; oldLog.apply(console, arguments);} })();' + "</script>" + "<script>" + editor.getValue() + "</script>";

            html = "<html><head><title>Mosaic Export</title><style>" + style +'</style></head><body><table id="mosaic"></table><div id="console"></div>' + scripts + "</body></html>";
        }
        else {
            // build html of page
            const style = "html {  font-family: sans-serif; } table { border-collapse: collapse; margin: auto; } table, th, td { border: 1px solid black; } td { padding: 20px; } #console { width: 50%; margin: auto; box-sizing: border-box; padding: 10px; margin-top: 10px; background: white; border: 1px solid gray; height: 30%; overflow-y: scroll; }";

            const scripts = "<script>" + scriptText + "</script>" + "<script>" + editor.getValue() + "</script>";

            html = "<html><head><title>Mosaic Export</title><style>" + style +'</style></head><body><table id="mosaic"></table>' + scripts + "</body></html>";
        }

        // create html blob with html we created
        const blob = new Blob([html], { type: "text/html" });

        // create a download link
        const el = window.document.createElement("a");
        el.href = window.URL.createObjectURL(blob);
        el.download = "mosaic_export.html";    

        // add link to document so we can click, then remove it
        document.body.appendChild(el);
        el.click();     
        document.body.removeChild(el);
    });
}

/**
 * Convert lessons.json into HTML for the lessons section.
 */
function renderLessons() {
    const lessonSelector = document.getElementById("lessonSelector");

    fetch("data/lessons.json")
    .then(response => response.json())
    .then(data => {
        // render all of the lessons
        data.lessons.forEach(lesson => {
            // create a div for each lesson
            const lessonContainer = document.createElement("div");
            lessonContainer.id = lesson.name.split(" ").join("_").toLowerCase();
            lessonContainer.className = "lesson";

            // add the lesson to the lessons div
            document.getElementById("lessons").appendChild(lessonContainer);

            const option = document.createElement("option");
            option.text = lesson.name;
            option.value = "#" + lessonContainer.id;

            lessonSelector.add(option);

            // render the blocks for that lesson
            renderBlocks(lesson.blocks, lessonContainer);
        });
    });
}

/**
 * Get rid of event listeners that would otherwise persist across code execution.
 */
function clearEventListeners() {
    document.onclick = () => {};
    document.onkeydown = () => {};
    document.onkeypress = () => {};
    document.onkeyup = () => {};
    document.onmouseover = () => {};
}

/**
 * Open the modal to a certain page of content.
 * @param {String} content 
 */
function openModal(content) {
    const modal = document.getElementById("myModal");

    // show modal
    modal.style.display = "block";

    // scroll to top
    document.getElementsByClassName("modal-body")[0].scrollTop = 0;

    // hide all modal content possibilites
    for (const el of document.getElementsByClassName("modalContent"))
        el.style.display = "none";

    let title;
    if (content == "lessons")  {
        title = "Learn JavaScript";

        document.getElementById("lessons").style.display = "";
    }
    else if (content == "tutorials") {
        title = "Mosaic Tutorials";

        document.getElementById("tutorials").style.display = "";
    }
    else if (content == "help") {
        title = "Coding Help"

        document.getElementById("help").style.display = "";
    }
    else if (content == "about") {
        title = "About Mosaic";

        document.getElementById("about").style.display = "";
    }

    document.getElementById("modalTitle").innerText = title;
}

/**
 * Close the modal element by hiding it.
 */
function closeModal() { 
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
}

/**
 * Clear the contents of the onscreen console.
 */
function clearConsole() {
    document.getElementById("console").innerHTML = "";
}

/**
 * Handle the run code button click to run code for the first time.
 */
function runCode() {
    // remove button glow
    document.getElementById("runCode").classList.toggle("button-glow");

    // clear console
    clearConsole();

    resetStates();

    // run the user's code for the first time
    executeCode();
}

/**
 * Stop the animation in case it's giving you a headache.
 */
function stopRunning() {
    const runCodeButton = document.getElementById("runCode");

    // re-enable the run code button to restart the animation
    runCodeButton.disabled = false;
    runCodeButton.innerHTML = "Run Code";
    runCodeButton.classList.toggle("button-glow");

    // stop auto-run of code
    autoRun = false;

    // clear all intervals from Mosiac.loop()
    for (let i = 1; i < 999999; i++)
        window.clearInterval(i);

    // clear any event listeners that were bound
    clearEventListeners();
}

/**
 * https://github.com/chinchang/web-maker/blob/master/src/utils.js
 * @param {String} code 
 * @param {Number} timeout 
 */
function addInfiniteLoopProtection(code, timeout=2000) {
    let loopId = 1;
    let patches = [];
    let varPrefix = '_wmloopvar';
    let varStr = 'var %d = Date.now();\n';
    let checkStr = `\nif (Date.now() - %d > ${timeout}) { stopRunning(); throw new Error("Infinite loop detected. Please make changes and press Run Code when you are ready to try again."); break;}\n`;

    esprima.parse(
        code,
        {
            tolerant: true,
            range: true
        },
        function(node) {
            switch (node.type) {
                case 'DoWhileStatement':
                case 'ForStatement':
                case 'ForInStatement':
                case 'ForOfStatement':
                case 'WhileStatement':
                    let start = 1 + node.body.range[0];
                    let end = node.body.range[1];
                    let prolog = checkStr.replace('%d', varPrefix + loopId);
                    let epilog = '';

                    if (node.body.type !== 'BlockStatement') {
                        // `while(1) doThat()` becomes `while(1) {doThat()}`
                        prolog = '{' + prolog;
                        epilog = '}';
                        --start;
                    }

                    patches.push({
                        pos: start,
                        str: prolog
                    });

                    patches.push({
                        pos: end,
                        str: epilog
                    });

                    patches.push({
                        pos: node.range[0],
                        str: varStr.replace('%d', varPrefix + loopId)
                    });

                    ++loopId;

                    break;

                default:
                    break;
            }
        }
    );

    /* eslint-disable no-param-reassign */
    patches
        .sort((a, b) => b.pos - a.pos)
        .forEach(patch => code = code.slice(0, patch.pos) + patch.str + code.slice(patch.pos));

    /* eslint-disable no-param-reassign */
    return code;
}

/**
 * Execute user's code.
 */
function executeCode() {
    // Clear all intervals if its an animation
    for (let i = 1; i < 999999; i++)
        window.clearInterval(i);

    // Get code from editor
    let editor = document.querySelector('.CodeMirror').CodeMirror;

    // instrument code to prevent infinite loops
    let code = "(async function() { _clear();\n" + addInfiniteLoopProtection(editor.getValue()) + "\n })().catch(e => console.error(e))";
    
    // add code as a script to page + execute
    let script = document.createElement('script');
    try {
        // If its first time executing something
        if (firstRun) {
            // Add script tag
            script.appendChild(document.createTextNode(code));
            document.body.appendChild(script);
        }
        else {
            // Remove old code
            document.body.removeChild(document.body.lastChild);

            // Add new code
            script.appendChild(document.createTextNode(code));
            document.body.appendChild(script);
        }
                        
        firstRun = false;
    } 
    catch (e) {
        script.text = code;
        document.body.appendChild(script);
    }
}

function renderBlocks(blocks, parent) {
    for (const block of blocks) {
        // if the block doesn't have blocks in it
        if (block.content) {
            let el;

            // treat code as special block
            if (block.type == "code") {
                let editor = document.querySelector('.CodeMirror').CodeMirror;

                // create code block as pre to keep whitespace
                el = document.createElement("pre");

                // add code mirror className so syntax highlighting works
                el.className = "cm-s-default";
                        
                // run CodeMirror syntax highlighting on the code
                CodeMirror.runMode(block.content, { name: "javascript" }, el);

                const copyButton = document.createElement("span");
                copyButton.className = "copyToEditor";
                copyButton.innerHTML = "Copy to Editor";
                copyButton.onclick = () => editor.setValue(block.content);

                el.appendChild(copyButton);
            }
            // for any other element
            else {
                el = document.createElement(block.type);
                el.innerHTML = block.content;
            }

            // add the new element to the parent
            parent.appendChild(el);
        }
        // if the block has other blocks in it
        else {
            // create the container element that will contain the other blocks
            const container = document.createElement(block.type);

            // add the new container to the parent element
            parent.appendChild(container);

            // render the blocks inside the container
            renderBlocks(block.blocks, container);
        }
    }
}

/**
 * Capture console.log() calls and display them onscreen.
 */
(function() {
    const oldLog = console.log;
    const oldError = console.error;
    const oldClear = console.clear;

    const consoleEl = document.getElementById("console");

    console.log = function(message) {
        // stringify JSON and arrays
        if (message && typeof message == "object") {
            // create code block as pre to keep whitespace
            const el = document.createElement("div");

            // add code mirror className so syntax highlighting works
            el.className = "cm-s-default";
                        
            // run CodeMirror syntax highlighting on the code
            // CodeMirror.runMode(JSON.stringify(message), { name: "javascript" }, el);
            consoleEl.innerHTML = JSON.stringify(message);

            consoleEl.appendChild(el);
        }
        else {
            // Append value to the end if there is already log output
            if (consoleEl.innerHTML)
                consoleEl.innerHTML += "<br>" + message;
            // Set the new value of log output
            else
                consoleEl.innerHTML = message;
        }

        consoleEl.scrollTop = consoleEl.scrollHeight;

        oldLog.apply(console, arguments);
    };

    console.error = function(message) {
        const consoleEl = document.getElementById("console");

        if (consoleEl.innerHTML)
            consoleEl.innerHTML += "<span style='color: red'><br>" + message + "</span>";
        // Set the new value of error output
        else
            consoleEl.innerHTML = "<span style='color: red'>" + message + "</span>";

        oldError.apply(console, arguments);
    }

    console.clear = () => {
        consoleEl.innerHTML = "";

        oldClear.apply(console);
    }
})();