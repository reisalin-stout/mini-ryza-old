"use strict";
import express, { Router } from "express";
import serverless from "serverless-http";
import { verifyKeyMiddleware } from "discord-interactions";
import fetch from "node-fetch";

const app = express();
const router = Router();

function ehp(values) {
  let hp = values[0].value;
  let def = values[1].value;
  let result = hp / (1 - def / (def + 1200));
  return `HP: ${hp} - Defense: ${def} => eHP ${result}`;
}

function reverseEhp(values) {
  let target = values[0].value * values[1].value;
  let base_hp = values[2].value;
  let base_def = values[3].value;
  let trinket_hp = 15000 + 6000;
  let trinket_def = 1500 + 600;

  let percent = 200;
  let max = 0;
  let spread = [0, 0];
  for (var a = 0; a < percent; a++) {
    let perc_hp = a;
    let perc_def = percent - perc_hp;
    var HP = trinket_hp + (base_hp * (100 + perc_hp)) / 100;
    var DEF = trinket_def + (base_def * (100 + perc_def)) / 100;

    var eHP = Math.round(HP / (1 - DEF / (DEF + 1200)));

    if (eHP > max) {
      max = eHP;
      spread[0] = perc_hp;
      spread[1] = perc_def;
    }
  }

  let ratio = spread[0] - spread[1];
  for (let a = 0; ; a++) {
    let perc_hp = a + ratio;
    let perc_def = a;
    var HP = trinket_hp + (base_hp * (100 + perc_hp)) / 100;
    var DEF = trinket_def + (base_def * (100 + perc_def)) / 100;
    var eHP = Math.round(HP / (1 - DEF / (DEF + 1200)));

    if (eHP >= target) {
      console.log(`eHP => ${eHP}`);
      console.log(`Ratio at ${HP} - ${DEF}`);
      console.log(`Ratio at ${100 + perc_hp} - ${100 + perc_def}`);
      return `eHP: ${eHP} => 
      - HP ${HP} (+${perc_hp}% +${trinket_hp}f)
      Defense: ${DEF} (+${perc_def}% +${trinket_def}f)`;
    }
  }
}

async function callExternal(function_name, options) {
  let url = `https://mini-ryza.netlify.app/.netlify/functions/${function_name}`;

  if (options) {
    let queryString = Object.entries(options)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  console.log(`Fetching External: ${url}`);

  try {
    const promise = fetch(url);
    console.log("Request sent successfully");
    return promise;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function interact(command, app_id, token) {
  let response;
  switch (command.name) {
    case "ehp":
      response = ehp(command.options);
      break;
    case "reverse-ehp":
      response = reverseEhp(command.options);
      break;
    case "titan-rank":
      console.log(JSON.stringify({ clan_name: command.options[0].value, app_id: app_id, token: token }));
      let promise = callExternal("titan-rank", { clan_name: command.options[0].value, app_id: app_id, token: token });
      response = "Looking for clan";
      console.log("Trying to find clan");
      console.log(promise);
      break;
    case "bye":
      res.status(200).send("Initial response");

      // Update data asynchronously after 5 seconds
      setTimeout(() => {
        // Simulate updated data
        const updatedData = { message: "Updated data" };

        // Send updated data to the client
        res.write(`data: ${JSON.stringify(updatedData)}\n\n`);
      }, 5000);

      response = "Goodbye!";
      break;
    case "echo":
      let original_message = command.options[0].value;
      response = `Echoing: ${original_message}`;
      break;
    default:
      response = "Command not found";
  }
  return response;
}

router.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  const command = req.body.data;
  const app_id = req.body.application_id;
  const token = req.body.token;
  console.log(`Command received: ${command.name} (${command.type}) t:${token}`);

  try {
    /*
    //Uncomment if it suddenly breaks and needs to be re-validated by discord
    if (command.type == 1) {
      res.send({ type: 1 });
      return;
    }
    */
    console.log("sending response");
    res.send({
      type: 4,
      data: { content: "Loading..." },
    });

    console.log("still in the serverless function");
    try {
      const response = await fetch(`https://discord.com/api/webhooks/${app_id}/${token}/messages/@original`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { content: "Updated Message" },
      });
      console.log("sent request");
      if (!response.ok) {
        throw new Error(`Failed to patch message: ${response.status} ${response.statusText}`);
      }

      console.log("Message patched successfully");
    } catch (error) {
      console.error("Error patching message:", error);
    }
    //let result = await interact(command, app_id, token);
    //console.log(result);
  } catch (error) {
    console.error("Error parsing request:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

app.use("/.netlify/functions/interact", router);
export const handler = serverless(app);
