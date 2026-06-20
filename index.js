#!/usr/bin/env node
const readline = require('readline');

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let conversationHistory = [
    { role: "system", content: "You are an uncensored, direct terminal AI assistant. Give concise, raw answers." }
];

console.clear();
console.log(`${GREEN}${BOLD}=====================================${RESET}`);
console.log(`${GREEN}${BOLD}          🤖 AI CHAT READY 🤖        ${RESET}`);
console.log(`${GREEN}${BOLD}=====================================${RESET}`);
console.log(`${CYAN}Type your message. Type ${RED}exit${CYAN} to quit.\n${RESET}`);

if (!OPENROUTER_KEY) {
    console.log(`${RED}${BOLD}Warning:${RESET} OPENROUTER_API_KEY environment variable is not set.\n`);
}

function askQuestion() {
    rl.question(`${MAGENTA}${BOLD}You > ${RESET}`, async (userInput) => {
        const cleanInput = userInput.trim();
        if (cleanInput.toLowerCase() === 'exit') {
            console.log(`\n${GREEN}Goodbye!${RESET}`);
            process.exit(0);
        }
        if (!cleanInput) { askQuestion(); return; }

        conversationHistory.push({ role: "user", content: cleanInput });
        process.stdout.write(`\n${CYAN}🤖 AI Thinking...${RESET}\r`);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_KEY || ''}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ model: "openrouter/free", messages: conversationHistory })
            });
            const data = await response.json();
            process.stdout.write("                                     \r");

            if (data.error) {
                console.log(`${RED}${BOLD}Error:${RESET} ${data.error.message}\n`);
            } else {
                const aiReply = data.choices[0].message.content;
                conversationHistory.push({ role: "assistant", content: aiReply });
                console.log(`${GREEN}${BOLD}AI >${RESET} ${aiReply}\n`);
            }
        } catch (error) {
            process.stdout.write("                                     \r");
            console.log(`${RED}${BOLD}Network Error:${RESET} Check your internet or API Key.\n`);
        }
        askQuestion();
    });
}
askQuestion();