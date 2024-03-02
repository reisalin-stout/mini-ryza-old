import * as fs from "fs";

const { TOKEN, APPLICATION_ID, URL } = JSON.parse(fs.readFileSync("discord/config.json", "utf-8"));
const COMMANDS = JSON.parse(fs.readFileSync("discord/commands.json", "utf-8")).commands;

for (const index in COMMANDS) {
  let command = COMMANDS[index];
  register(command);
}

function register(command) {
  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${TOKEN}`,
    },
    body: JSON.stringify(command),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send request");
      }
      console.log(`Command registered: ${command.name}`);
    })
    .catch((error) => {
      console.error("Error sending request:", error);
    });
}
