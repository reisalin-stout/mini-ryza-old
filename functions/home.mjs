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

async function interact(command) {
  let response;
  switch (command.name) {
    case "ehp":
      response = ehp(command.options);
      break;
    case "reverse-ehp":
      response = reverseEhp(command.options);
      break;
    case "titan-rank":
      let url = `http://v-g-msl-rank.p-msl.com:10831/rank/top/?board_id=${command.options[1].value}&meta_key=rank_${command.options[1].value}`;
      let hof = `http://v-g-msl-rank.p-msl.com:10831/halloffame/?board_id=${command.options[1].value}&meta_key=rank_${command.options[1].value}`;
      let dimdef = `http://v-g-msl-rank.p-msl.com:10831/rank/top?board_id=110&meta_key=rank_${command.options[1].value}`;
      console.log(url);
      response = "No clan found";
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(data.results);
          let clans = data.results;
          if (clans.length > 0) {
            clans.forEach((element) => {
              console.log(element[`rank_${command.options[1].value}`]);
              if (element[`rank_${command.options[1].value}`] == command.options[0].value) {
                response = element;
              }
            });
          }
        });
      console.log(response);
      break;
    case "bye":
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
  console.log(`Command received: ${command.name} (${command.type})`);

  try {
    /*
    //Uncomment if it suddenly breaks and needs to be re-validated by discord
    if (command.type == 1) {
      res.send({ type: 1 });
      return;
    }
    */
    let result = await interact(command);
    console.log(result);
    res.send({
      type: 4,
      data: { content: result },
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    res.status(400).json({ error: "Bad request" });
  }
});

app.use("/.netlify/functions/interact", router);
export const handler = serverless(app);