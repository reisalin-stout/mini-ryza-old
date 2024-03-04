import { findalldevs, createSession, decode } from "npcap";
import { sendDiscordMessage } from "../discord/messages.js";
import dotenv from "dotenv";
dotenv.config();

const titan_images = {
  fire: "https://astroguide-assets.s3.amazonaws.com/BossTitanR_large.png",
  water: "https://astroguide-assets.s3.amazonaws.com/BossTitanB_large.png",
  tree: "https://astroguide-assets.s3.amazonaws.com/BossTitanG_large.png",
  light: "https://astroguide-assets.s3.amazonaws.com/BossTitan_large.png",
  dark: "https://astroguide-assets.s3.amazonaws.com/BossTitanD_large.png",
};

function customEmbed(data) {
  let content = null;
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
  if (typeof data.meta.type === "undefined") {
    /*
    content = [
      {
        type: "rich",
        title: data.user,
        description: data.message,
        color: 0x00ffff,
        thumbnail: {
          url: ``,
          height: 32,
          width: 32,
        },
        author: {
          name: `Clan ${data.room_id}`,
        },
      },
    ];*/
  } else {
    switch (data.meta.type) {
      case "clan_battle_start":
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} entered Battle`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan`,
            },
          },
        ];
        break;
      case "clan_battle_result":
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} dealt ${data.meta.clan_score} damage (contribution: ${data.meta.contribution})`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan`,
            },
          },
        ];
        break;

      case "clan_battle_kill_boss":
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} killed Titan level *${data.meta.battle_lvl}*`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan`,
            },
          },
        ];
        break;
      case "cvc_attack_result":
        let cvcresult;
        switch (data.meta.battle_result) {
          case "3":
            cvcresult = "2W - 0L";
            break;
          case "2":
            cvcresult = "0W - 2L";
            break;
          case "1":
            cvcresult = "1W - 1L";
            break;
        }
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} fought in CvC, result: ${cvcresult}`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan`,
            },
          },
        ];
        break;
      case "rare_monster_summon":
        break;
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} summoned monster ${data.meta.monster_uid}`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan (${data.room_id})`,
            },
          },
        ];
        break;
      case "join_by_user_ship":
        break;
        content = [
          {
            type: "rich",
            title: data.user,
            description: `${data.user} entered`,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 32,
              width: 32,
            },
            author: {
              name: `AttkOnTitan (${data.room_id})`,
            },
          },
        ];
        break;
      default:
        break;
        content = [
          {
            type: "rich",
            title: data.user,
            description: data.meta.type,
            color: 0x00ffff,
            thumbnail: {
              url: ``,
              height: 0,
              width: 0,
            },
            author: {
              name: `Clan ${data.room_id}`,
            },
          },
        ];
    }
  }

  return content;
}

export async function startListener() {
  const devices = findalldevs();

  const adapter = devices.find((device) => device.description.includes("Intel"));

  const pcapSession = createSession(adapter.name, {
    filter: "tcp",
    buffer_timeout: 0,
  });

  pcapSession.on("packet", async (rawPacket) => {
    try {
      const packet = decode.packet(rawPacket);
      let raw_buffer = packet.payload.payload.payload.data;
      if (raw_buffer != null) {
        let buffer = Buffer.from(raw_buffer);
        let str = buffer.toString();
        if (str.includes("tamagorpg")) {
          let arraystart = str.indexOf("[");
          let arrayend = str.lastIndexOf("]");
          const arrayString = str.substring(arraystart, arrayend + 1);
          const jsonResult = JSON.parse(arrayString);
          if (str.includes("group")) {
            console.log("clan related packet");
          }
          const result = {
            type: jsonResult[0],
            user: jsonResult[1].name,
            room: jsonResult[1].room.split("::")[1],
            room_id: jsonResult[1].room.split("::")[3],
            message: jsonResult[1].msg,
            meta: jsonResult[1].metadata,
          };
          if (result.room == "group") {
            console.log(result);
            const embed = customEmbed(result);
            if (embed) {
              await sendDiscordMessage(process.env.TITAN_CHANNEL_ID, "Clan Message", embed);
            }
          }
        }
      }
    } catch (error) {
      //console.error("Error decoding packet:", error);
    }
  });

  pcapSession.on("error", (err) => {
    console.error("Session error:", err);
  });
}
