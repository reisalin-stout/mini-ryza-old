import { sendDiscordMessage, patchDiscordMessageById } from "../discord/messages.js";
import dotenv from "dotenv";
dotenv.config();

let titan_index = "defaultIndex";
let titan_hitters = { defaultIndex: [] };

const titan_images = {
  Fire: "https://astroguide-assets.s3.amazonaws.com/BossTitanR_large.png",
  Dark: "https://astroguide-assets.s3.amazonaws.com/BossTitanD_large.png",
  Water: "https://astroguide-assets.s3.amazonaws.com/BossTitanB_large.png",
  Wood: "https://astroguide-assets.s3.amazonaws.com/BossTitanG_large.png",
  Light: "https://astroguide-assets.s3.amazonaws.com/BossTitan_large.png",
};

export async function chatNotify(content) {
  console.log(content);
}

export async function processMessage(content) {
  if (typeof content.metadata.type === "undefined") {
  }
  if (content.metadata.type == "test-message") {
  }

  /*Datas
    join_by_user_ship
      -ship name
    find_friend_dungeon
    rare_monster_capture
      -monster_uid
    monster_super_beyond
    rune_max_upgrade
    cvc_attack_result
    cvd_battle_result (apophis)
     */

  switch (content.metadata.type) {
    case "clan_battle_start":
      let battle_start_message = [
        {
          type: "rich",
          title: "Clan Battle",
          description: `${content.name} entered Clan Battle`,
          color: 0xfce205,
          thumbnail: {
            url: ``,
            height: 64,
            width: 64,
          },
          author: {
            name: `AttkOnTitan`,
          },
        },
      ];
      let response = await sendDiscordMessage(process.env.TITAN_CHANNEL_ID, "Clan Battle Notice", battle_start_message);
      titan_hitters[titan_index].push({ name: content.name, msg_id: response.id });
      return;
    case "clan_battle_result":
      let battle_result_message = [
        {
          type: "rich",
          title: "Clan Battle",
          description: `${content.name} entered Clan Battle\n${
            content.name
          } dealt **${content.metadata.clan_score.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}** damage (contribution: ${
            Math.round(content.metadata.contribution * 100) / 100
          }%)`,
          color: 0xfce205,
          thumbnail: {
            url: ``,
            height: 64,
            width: 64,
          },
          author: {
            name: `AttkOnTitan`,
          },
        },
      ];
      for (let titan_levels of Object.values(titan_hitters)) {
        let foundIndex = titan_levels.findIndex((obj) => obj.name === content.name);
        const foundObject = titan_levels[foundIndex];
        if (foundObject) {
          patchDiscordMessageById(
            process.env.TITAN_CHANNEL_ID,
            foundObject.msg_id,
            "Clan Battle Notice",
            battle_result_message
          );
          titan_levels.splice(foundIndex, 1);
          return;
        }
      }
      return;
    case "clan_battle_kill_boss":
      let elements = ["Fire", "Dark", "Water", "Wood", "Light"];
      let oldTitan = elements[parseInt(content.metadata.battle_lvl) % 5];
      let titan = elements[(1 + parseInt(content.metadata.battle_lvl)) % 5];
      let battle_kill_message = [
        {
          type: "rich",
          title: "Clan Battle",
          description: `${content.name} killed ${oldTitan} Titan level ${
            content.metadata.battle_lvl
          }, good job!\n${titan} Titan level ${parseInt(content.metadata.battle_lvl) + 1} appears.`,
          color: 0xfce205,
          thumbnail: {
            url: titan_images[titan],
            height: 64,
            width: 64,
          },
          author: {
            name: `AttkOnTitan`,
          },
        },
      ];
      let key = `${titan}-${parseInt(content.metadata.battle_lvl) + 1}`;
      titan_hitters[key] = [];
      titan_index = key;
      await sendDiscordMessage(process.env.TITAN_CHANNEL_ID, "Clan Battle Notice", battle_kill_message);
      return;
    case "cvc_attack_result":
      return [null, null];
      let cvc_result = ["null", "1W - 1L", "0W - 2L", "2W - 0L"];
      let cvc_custom = ["null", "Must have been a difficult battle!", "Happens to the best!", "You make me proud!"];
      let cvc_result_message = [
        {
          type: "rich",
          title: "Clan vs Clan",
          description: `${content.name} fought in CvC, result: ${cvc_result[content.metadata.battle_result]}\n${
            cvc_custom[content.metadata.battle_result]
          }`,
          color: 0xb22222,
          thumbnail: {
            url: ``,
            height: 64,
            width: 64,
          },
          author: {
            name: `AttkOnTitan`,
          },
        },
      ];
      return ["Clan vs Clan Notice", cvc_result_message];
    case "rare_monster_summon":
    case "join_by_user_ship":
    default:
      return [null, null];
  }
}
