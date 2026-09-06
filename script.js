// ==========================================
// 1. TEXT DE-HASH ANIMATION UTILITY
// ==========================================
const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEF';

function dehashTextNode(node) {
    if (!node.originalText) {
        node.originalText = node.nodeValue;
    }

    const originalText = node.originalText;
    let iterations = 0;

    clearInterval(node.dehashInterval);

    node.dehashInterval = setInterval(() => {
        node.nodeValue = originalText
            .split('')
            .map((char, index) => {
                if (char === ' ' || char === '\n' || char === '\t') return char;
                if (index < iterations) return originalText[index];
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('');

        if (iterations >= originalText.length) {
            clearInterval(node.dehashInterval);
        }

        iterations += 1 / 2;
    }, 15);
}

function dehashElement(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeValue.trim().length > 0) {
            dehashTextNode(node);
        }
    }
}


// ==========================================
// UPDATED SECTION SWITCHING & NAVIGATION
// ==========================================
function switchSection(targetId) {
    if (!targetId || targetId === '#') targetId = 'about';

    let cleanId = targetId.replace('#', '').trim();

    // Alias mapping: matches 'socials' <-> 'contact' automatically
    let targetSection = document.getElementById(cleanId);
    if (!targetSection && cleanId === 'socials') {
        targetSection = document.getElementById('contact');
        if (targetSection) cleanId = 'contact';
    }
    if (!targetSection && cleanId === 'contact') {
        targetSection = document.getElementById('socials');
        if (targetSection) cleanId = 'socials';
    }

    if (!targetSection) return false;

    // 1. Hide all sections
    document.querySelectorAll('.card-section').forEach(card => {
        card.classList.remove('active-card');
    });

    // 2. Update active nav links (checks data-target, data-tab, and href)
    document.querySelectorAll('.nav-link, nav a').forEach(link => {
        link.classList.remove('active');
        const rawTarget = link.getAttribute('data-target') || link.getAttribute('data-tab') || link.getAttribute('href') || '';
        const linkClean = rawTarget.replace('#', '').trim();

        if (linkClean === cleanId || (cleanId === 'contact' && linkClean === 'socials') || (cleanId === 'socials' && linkClean === 'contact')) {
            link.classList.add('active');
        }
    });

    // 3. Show target section
    targetSection.classList.add('active-card');

    // 4. Trigger de-hash animation
    targetSection.querySelectorAll('h1, h2, p, li').forEach(el => dehashElement(el));

    return true;
}


// ==========================================
// 3. MULTI-STAGE SUDO INTRO SCRIPT
// ==========================================
const commandText = "sudo ./portfolio.sh";
const passwordLength = 11;

const typedCmdElement = document.getElementById("typed-cmd");
const typedPassElement = document.getElementById("typed-pass");
const sudoContainer = document.getElementById("sudo-container");
const cursorCmd = document.getElementById("cursor-cmd");
const cursorPass = document.getElementById("cursor-pass");
const introHint = document.getElementById("intro-hint");
const introOverlay = document.getElementById("terminal-intro");

let cmdIndex = 0;
let passIndex = 0;

function typeCommand() {
    if (cmdIndex < commandText.length) {
        typedCmdElement.textContent += commandText.charAt(cmdIndex);
        cmdIndex++;
        setTimeout(typeCommand, 65);
    } else {
        setTimeout(() => {
            if (cursorCmd) cursorCmd.classList.add("hidden");
            if (sudoContainer) sudoContainer.classList.remove("hidden");
            if (cursorPass) cursorPass.classList.remove("hidden");
            if (introHint) introHint.classList.add("show");
            
            setTimeout(typePassword, 300);
        }, 200);
    }
}

function typePassword() {
    if (passIndex < passwordLength) {
        typedPassElement.textContent += "*";
        passIndex++;
        const randomDelay = Math.floor(Math.random() * 80) + 50;
        setTimeout(typePassword, randomDelay);
    } else {
        setTimeout(launchSite, 500);
    }
}

// Replace your launchSite function with this:
function launchSite() {
    if (!introOverlay || introOverlay.classList.contains("slide-up")) return;
    
    introOverlay.classList.add("slide-up");
    document.body.classList.add("site-loaded");
    
    
    const activeSection = document.querySelector('.card-section.active-card');
    if (activeSection) {
        activeSection.querySelectorAll('h1, h2, p, li').forEach(el => dehashElement(el));
    }
}


// ==========================================
// 4. INTERACTIVE CLI TERMINAL
// ==========================================
function initCLI() {
    const cliInput = document.getElementById("cli-input");
    const cliOutput = document.getElementById("cli-output");

    if (!cliInput || !cliOutput) return;

    const COMMANDS = {
        help: `Available commands:
  <br>
  <span class="cli-success">help</span>      - Show list of available commands
  <br>
  <span class="cli-success">whoami</span>    - Print user identity & profile
  <br>
  <span class="cli-success">ls</span>        - List available portfolio sections
  <br>
  <span class="cli-success">cat &lt;sec&gt;</span> - Switch tab (about, certs, portfolio, contact)
  <br>
  <span class="cli-success">status</span>    - View target certification status
  <br>
  <span class="cli-success">matrix</span>    - Toggle terminal color theme
  <br>
  <span class="cli-success">clear</span>     - Clear terminal screen history
  <br>
  <span class="cli-success">sudo</span>      - Request administrative access`,

        whoami: "Danilo Milašević | IT Student @ JU SMŠ 'Mladost' | Tivat, Montenegro",

        ls: "sections: about  certs  portfolio  contact",

        status: "Current Focus: HTB Academy - Certified Web Exploitation Specialist (CWES)",

        sudo: '<span class="cli-error">Permission denied: danilo is not in the sudoers file. This incident will be reported.</span>'
    };

    cliInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const rawInput = cliInput.value.trim();
            cliInput.value = "";

            if (!rawInput) return;

            appendOutput(`danilo@tivat:~$ ${rawInput}`, "cli-command-echo");

            const args = rawInput.toLowerCase().split(" ");
            const cmd = args[0];

            if (cmd === "clear") {
                cliOutput.innerHTML = "";
                return;
            }

            if (cmd === "cat") {
                const targetTab = args[1];
                const validTabs = ["about", "certs", "portfolio", "contact"];

                if (validTabs.includes(targetTab)) {
                    if (switchSection(targetTab)) {
                        history.pushState(null, null, `#${targetTab}`);
                        appendOutput(`Switched to section: [${targetTab}]`, "cli-success");
                    }
                } else {
                    appendOutput(`cat: ${targetTab || 'missing argument'}: No such section. Valid sections: about, certs, portfolio, contact`, "cli-error");
                }
                return;
            }

            if (cmd === "matrix") {
                document.body.classList.toggle("matrix-mode");
                appendOutput("Matrix green color mode toggled.", "cli-success");
                return;
            }

            if (COMMANDS[cmd]) {
                appendOutput(COMMANDS[cmd], "cli-response");
            } else {
                appendOutput(`bash: command not found: ${cmd}. Type 'help' for available commands.`, "cli-error");
            }
        }
    });

    function appendOutput(htmlContent, className) {
        const line = document.createElement("div");
        line.className = `cli-line ${className}`;
        line.innerHTML = htmlContent;
        cliOutput.appendChild(line);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }
}


// ==========================================
// 5. DOM INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Interactive CLI Terminal
    initCLI();

    // Attach Click Events to Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target') || this.getAttribute('data-tab') || this.getAttribute('href');
            if (switchSection(targetId)) {
                history.pushState(null, null, `#${targetId.replace('#', '')}`);
            }
        });
    });

    // Handle initial page load with URL hash (defaults to #about)
    const initialHash = window.location.hash || '#about';
    switchSection(initialHash);

    // Handle browser Back / Forward buttons
    window.addEventListener('popstate', () => {
        const currentHash = window.location.hash || '#about';
        switchSection(currentHash);
    });

    // Instant intro overlay bypass handlers
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") launchSite();
    });

    if (introOverlay) {
        introOverlay.addEventListener("click", launchSite);
    }

    // Start auto-typer sequence
    setTimeout(typeCommand, 300);
});
