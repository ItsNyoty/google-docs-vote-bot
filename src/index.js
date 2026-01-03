"use strict";

// Imports
require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const { fetchBelgianUser } = require("./generator");

// Environment const
const formURL = process.env.FORM_URL;
const minWaitTime = process.env.MIN_WAIT_TIME !== undefined ? parseInt(process.env.MIN_WAIT_TIME) : 1;
const maxWaitTime = process.env.MAX_WAIT_TIME !== undefined ? parseInt(process.env.MAX_WAIT_TIME) : 2;

// Global variables
let entryCounter = 0;
let saveInterval = undefined;

(async () => {

	// Environment validation
	if(!formURL) {
		log("The FORM_URL environment variable is missing.");
		console.log("Please create a .env file with FORM_URL=your_google_form_url");
		return;
	}

	log("I get starting with the voting and you have a happy day :3");

	process.on("exit", () => {
		clearInterval(saveInterval);
		saveEntryCounter();
		log("Good bye :3 I hope your vote has won :)");
	});

	loadEntryCounter();
	saveInterval = setInterval(saveEntryCounter, 60 * 1000);

	// eslint-disable-next-line no-constant-condition
	while(true) {
		const browser = await puppeteer.launch({ headless: false }); // Run headless: false to see what happens
		const page = await browser.newPage();
		
        try {
            await page.goto(formURL, { waitUntil: 'networkidle2' });
            await setViewport(page);

			for(let i = 0; i <= 50; i++) { // Run 50 times per browser session then restart browser to be safe
				entryCounter++;

				const waitTime = random(minWaitTime, maxWaitTime);
				log(`Wait ${waitTime} seconds for entry #${entryCounter}`);
				
                // Generate Data
                const userData = await fetchBelgianUser();
                log(`Generated User: ${userData.fullName} (${userData.email})`);

                // Fill Form
                await fillForm(page, userData);

				await submitEntry(page);
                
                // Wait for confirmation page
                await wait(2);
                
				await anotherEntry(page);
                await wait(waitTime);
			}
		} catch (error) {
			log("Something went wrong (probably found the end or an error), restarting browser...");
			logError(error);
		}
		
        await page.close();
		await browser.close();
        await wait(2);
	}

})();

async function setViewport(page) {
	await page.setViewport({ width: 1280, height: 800 });
}

async function fillForm(page, data) {
    await fillInput(page, "E-mailadres", data.email);

    await fillInput(page, "Naam + voornaam", data.fullName);

    await fillInput(page, "Adres", data.address);

    await fillInput(page, "Gsm-/telefoonnummer", data.phone);
}

async function fillInput(page, labelText, value) {
    // Strategy: Find the question container first, then find the input WITHIN that container.
    
    let input = null;

    // 0. Special simplified check for Email which acts differently often
    if (labelText.toLowerCase().includes("mail")) {
        // Try standard email input first
        input = await page.$('input[type="email"]');
        if (input) {
             // Check if it's visible
             const isVisible = await input.boundingBox();
             if (isVisible) {
                 await focusAndType(input, value);
                 return;
             }
        }
    }

    if (!input) input = await page.$(`textarea[aria-label="${labelText}"]`);
    if (!input) input = await page.$(`input[aria-label*="${labelText}"]`);
    if (!input) input = await page.$(`textarea[aria-label*="${labelText}"]`);

    if (input) {
        await focusAndType(input, value);
        return;
    }

    if (!input) {
        input = await page.evaluateHandle((text) => {
            function isVisible(elem) {
                if (!(elem instanceof Element)) return false;
                const style = getComputedStyle(elem);
                if (style.display === 'none') return false;
                if (style.visibility !== 'visible') return false;
                return true;
            }

            const allElements = Array.from(document.querySelectorAll('div, span, label, p, h1, h2, h3, h4, h5, h6'));
            const matches = allElements.filter(el => 
                el.innerText && 
                el.innerText.toLowerCase().includes(text.toLowerCase()) &&
                isVisible(el)
            );

            matches.sort((a, b) => a.innerText.length - b.innerText.length);

            for (let match of matches.slice(0, 5)) {
                let parent = match;
                let foundInput = null;
                
                for (let i = 0; i < 8; i++) {
                    if (!parent) break;
                    
                    foundInput = parent.querySelector('input:not([type="hidden"])') || parent.querySelector('textarea');
                    
                    if (foundInput) {
                        return foundInput;
                    }
                    parent = parent.parentElement;
                }
            }
            return null;
        }, labelText);
        
        if (input.asElement() === null) input = null;
    }

    if (input) {
        await focusAndType(input, value);
    } else {
        log(`Warning: Could not find input for '${labelText}'`);
        throw new Error(`Could not find input for: ${labelText}`);
    }
}

async function selectOption(page, optionText) {
    const option = await page.evaluateHandle((text) => {
        const allElements = Array.from(document.querySelectorAll('div, span, label'));
        const matches = allElements.filter(el => el.innerText && el.innerText.trim() === text);
        
        for (let match of matches) {
            return match;
        }
        return null;
    }, optionText);

    if (option.asElement()) {
        await option.click();
        await wait(0.5);
    } else {
        throw new Error(`Option '${optionText}' not found`);
    }
}

async function focusAndType(input, value) {
    try {
        await input.evaluate(el => el.scrollIntoView({block: "center"}));
    } catch(e) {} 
    await wait(0.5); 
    
    await input.focus();
    
    await input.click({ clickCount: 3 });
    await wait(0.1); 
    
    await input.evaluate(el => el.value = '');
    
    await input.type(value);
}

async function submitEntry(page) {
    const selectors = [
        ".freebirdFormviewerViewNavigationSubmitButton",
        "div[role='button'][aria-label='Submit']",
        "div[role='button'][aria-label='Verzenden']",
        "span.NPEfkd" // Common class for button text
    ];

    let btn;
    for (let s of selectors) {
        btn = await page.$(s);
        if (btn) break;
    }

    // Fallback: find by text
    if (!btn) {
        const [element] = await page.$x("//span[contains(text(), 'Verzenden')] | //span[contains(text(), 'Submit')]");
        if (element) btn = element;
    }

	if (btn) {
        await btn.click();
	    log(`Submitted entry #${entryCounter}`);
    } else {
        throw new Error("Submit button not found");
    }
}

async function anotherEntry(page) {
    // Wait for "Submit another response" link
    // Selector often: a[href*='form'] or text "Nog een antwoord verzenden"
    
    const [link] = await page.$x("//a[contains(text(), 'Nog een antwoord verzenden')] | //a[contains(text(), 'Submit another response')]");
    
	if (link) {
        await link.click();
	    log("Return for another entry.");
    } else {
         const oldLink = await page.$(".freebirdFormviewerViewResponseLinksContainer a");
         if(oldLink) {
             await oldLink.click();
         } else {
             log("Could not find 'Submit another' link, reloading page...");
             await page.goto(formURL, { waitUntil: 'networkidle2' });
         }
    }
}

async function wait(seconds) {
	return new Promise((res) => {
		setTimeout(() => res(1), seconds * 1000);
	});
}

function log(message) {
	console.log(`${getTimestamp()}: ${message}`);
}

function logError(message) {
	console.error(`${getTimestamp()}: ${message}`);
}

function getTimestamp() {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-DE", {
		day: "2-digit", month: "short", year: "numeric",
		hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
	});
	return formatter.format(now);
}

function random(start, end) {
	return Math.floor(Math.random() * (end - start)) + start;
}

function saveEntryCounter() {
	if(!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}
	log("Save entry counter.");
	const data = { counter: entryCounter };
	fs.writeFileSync("./data/datastore.json", JSON.stringify(data), { encoding: "utf-8" });
}

function loadEntryCounter() {
	if(fs.existsSync("./data/datastore.json")) {
		log("Load entry counter.");
		let data = fs.readFileSync("./data/datastore.json", { encoding: "utf-8" });
		data = JSON.parse(data);
		entryCounter = data.counter;
	}
}