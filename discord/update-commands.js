import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const COMMANDS = JSON.parse(fs.readFileSync("discord/commands.json", "utf-8")).commands;
const active_commands = COMMANDS.map((item) => item.name);

const url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPID}/commands`;

// For authorization, you can use either your bot token
const auth_header = {
  Authorization: `Bot ${process.env.DISCORD_AUTHTOKEN}`,
  "Content-Type": "application/json",
};

async function updateCommands() {
  let old_command_list = [];
  //Fetch registered commands
  await fetch(url, {
    method: "GET",
    headers: auth_header,
  })
    .then((response) => response.json())
    .then((commands) => {
      for (const command of commands) {
        old_command_list.push({ name: command.name, id: command.id });
      }
    })
    .catch((error) => {
      console.error("Error deleting command:", error);
    });
  //Compare with local commands and delete unused ones
  old_command_list.forEach((item) => {
    if (!active_commands.includes(item.name)) {
      let delete_url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPID}/commands/${item.id}`;
      fetch(delete_url, {
        method: "DELETE",
        headers: auth_header,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to delete command ${item.name}`);
          }
          console.log(`Command deleted successfully: ${item.name}`);
        })
        .catch((error) => {
          console.error(`Error deleting command ${item.name} :`, error);
        });
    }
  });
  //Update with local commands

  for (const command of COMMANDS) {
    let update_url = `https://discord.com/api/v10/applications/${process.env.DISCORD_APPID}/commands`;

    fetch(update_url, {
      method: "POST",
      headers: auth_header,
      body: JSON.stringify(command),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send request");
        }
        console.log(`Command registered: "${command.name}"`);
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  }
}
