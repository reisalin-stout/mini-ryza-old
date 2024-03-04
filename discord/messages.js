import dotenv from "dotenv";
dotenv.config();

const url = `https://discord.com/api/v10/channels/${process.env.TITAN_CHANNEL_ID}/messages`;

const auth_header = {
  Authorization: `Bot ${process.env.DISCORD_AUTHTOKEN}`,
  "Content-Type": "application/json",
};

async function patchDiscordMessageById(channelId, messageId, newMessage) {
  let url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

  fetch(url, {
    method: "PATCH",
    headers: auth_header,
    body: JSON.stringify({ content: newMessage }),
  })
    .then(console.log("Message Patched"))
    .catch((error) => console.error("Error:", error));
}

export async function sendDiscordMessage(channelId, message, embeds = []) {
  let url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  let payload = {};
  payload.content = message;
  if (embeds.length > 0) {
    payload.embeds = embeds;
  }
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_AUTHTOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Sent:", JSON.stringify(payload.content));
    })
    .catch((error) => {
      console.error(error);
    });
}

async function updateCommands() {
  await fetch(url, {
    method: "GET",
    headers: auth_header,
  })
    .then((response) => response.json())
    .then(async (messages) => {
      const storedMessage = messages.find((element) => element.content.startsWith("TITAN"));
      let messageId;
      if (typeof storedMessage === "undefined") {
        messageId = await sendDiscordMessage(process.env.TITAN_CHANNEL_ID, "TITAN STATUS:");
      } else {
        messageId = storedMessage.id;
      }
      patchDiscordMessageById(process.env.TITAN_CHANNEL_ID, messageId, "TITAN STATUS: Loading status");
    })
    .catch((error) => {
      console.error("Error deleting command:", error);
    });
}
