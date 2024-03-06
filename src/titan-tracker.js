import { sendDiscordMessage, patchDiscordMessageById } from "../discord/messages.js";
import dotenv from "dotenv";
dotenv.config();

const titan_images = {
  Fire: "https://astroguide-assets.s3.amazonaws.com/BossTitanR_large.png",
  Dark: "https://astroguide-assets.s3.amazonaws.com/BossTitanD_large.png",
  Water: "https://astroguide-assets.s3.amazonaws.com/BossTitanB_large.png",
  Wood: "https://astroguide-assets.s3.amazonaws.com/BossTitanG_large.png",
  Light: "https://astroguide-assets.s3.amazonaws.com/BossTitan_large.png",
};

class TitanBattle {
  constructor(level) {
    this.level = level;
    this.element = ["Fire", "Dark", "Water", "Wood", "Light"][this.level % 5];
    this.image = titan_images[this.element];
    this.partecipants = [];
    this.trailingText = "";
    this.msgId = "";
  }

  joined(name) {
    const participant = this.partecipants.find((partecipant) => partecipant.name == name);
    console.log(`Someone joined: ${name}`);
    if (typeof participant === "undefined") {
      this.partecipants.push({ name: name, damage: 0, contribution: 0 });
      this.updateMessage();
    }
    console.log(`Tried adding another partecipation on same titan for ${name}`);
  }

  isAwaiting(name) {
    const participant = this.partecipants.find((partecipant) => partecipant.name === name && partecipant.damage === 0);
    if (typeof participant === "undefined") {
      return false;
    }
    return true;
  }

  finished(name, damage, contribution) {
    const participant = this.partecipants.find((participant) => participant.name === name);
    if (typeof participant === "undefined") {
      console.log(`Participant '${name}' not found.`);
    } else {
      participant.damage = damage;
      participant.contribution = contribution;
    }
    this.updateMessage();
  }

  kill(name) {
    this.trailingText = `\n${name} was the one dealing the killing blow!`;
    this.updateMessage();
  }

  message() {
    let textMessage = `${this.element} Titan level ${this.level} appeared!`;
    if (this.partecipants.length > 0) {
      textMessage += this.partecipants.reduce((acc, user) => {
        console.log(user);
        const formattedDamage = `**${user.damage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}**`;
        const formattedContribution = `${Math.round(user.contribution * 100) / 100}`;
        let firstPart = `\n**${user.name}** `;
        let secondPart =
          user.damage > 0
            ? `dealt ${formattedDamage} damage (Contribution: ${formattedContribution}%)`
            : "entered battle!";

        return acc + firstPart + secondPart;
      }, "");
    }
    textMessage += this.trailingText;
    return new ClanBattleMessage(textMessage, this.image);
  }
  async createMessage() {
    let battleStartMessage = this.message();
    let response = await sendDiscordMessage(
      process.env.TITAN_CHANNEL_ID,
      battleStartMessage.message,
      battleStartMessage.embed
    );
    this.msgId = response.id;
  }
  async updateMessage() {
    let battleContinueMessage = this.message();
    await patchDiscordMessageById(
      process.env.TITAN_CHANNEL_ID,
      this.msgId,
      battleContinueMessage.message,
      battleContinueMessage.embed
    );
  }
}

class ClanBattleMessage {
  constructor(description, image = "") {
    this.message = "Clan Battle Notice";
    this.embed = [
      {
        type: "rich",
        title: "Clan Battle",
        description: description,
        color: 0xfce205,
        thumbnail: {
          url: image,
          height: 64,
          width: 64,
        },
        author: {
          name: `AttkOnTitan`,
        },
      },
    ];
  }
}

class ClanBattle {
  constructor() {
    this.battles = [];
  }

  onClanBattleStart(message) {
    if (this.battles.length > 0) {
      this.battles[this.battles.length - 1].joined(message.name);
    } else {
      sendDiscordMessage(
        process.env.TITAN_CHANNEL_ID,
        `${message.name} Joined Clan Battle but I don't know what level`,
        []
      );
    }
  }

  onClanBattleResult(message) {
    if (this.battles.length > 0) {
      for (let i = this.battles.length - 1; i >= 0; i--) {
        if (this.battles[i].isAwaiting(message.name)) {
          this.battles[i].finished(
            message.name,
            parseInt(message.metadata.clan_score),
            parseFloat(message.metadata.contribution)
          );
          break;
        }
      }
    }
  }

  onClanBattleEnd(message) {
    if (this.battles.length > 0) {
      this.battles[this.battles.length - 1].kill(message.name);
    }
    this.battles.push(new TitanBattle(parseInt(message.metadata.battle_lvl) + 1));
    this.battles[this.battles.length - 1].createMessage();
  }
}

export async function chatNotify(content) {
  console.log(content);
}

const AttkOnTitan = new ClanBattle();
export async function processMessage(content) {
  if (typeof content.metadata.type === "undefined") {
    return;
  }
  switch (content.metadata.type) {
    case "clan_battle_start":
      AttkOnTitan.onClanBattleStart(content);
      break;
    case "clan_battle_result":
      AttkOnTitan.onClanBattleResult(content);
      break;
    case "clan_battle_kill_boss":
      AttkOnTitan.onClanBattleEnd(content);
      break;
    case "cvc_attack_result":
      console.log(`${content.name} battled in CvC!`);
      break;
    case "cvd_battle_result":
      console.log(`${content.name} battled versus Apophis!`);
      break;
    case "rare_monster_summon":
      console.log(`${content.name} summoned a rare Astromon (${content.metadata.monster_uid})!`);
      break;
    case "join_by_user_ship":
      console.log(`${content.name} on ${content.metadata.ship_name} joined!`);
      break;
    case "find_friend_dungeon":
      console.log(`${content.name} found a friend dungeon!`);
      break;
    case "rune_max_upgrade":
      console.log(`${content.name} upgraded a gem to +15!`);
      break;
    case "monster_super_beyond":
      console.log(`${content.name} Super Ascended an Astromon!`);
      break;
    default:
      console.log(`${content.name} triggered ${content.metadata.type}`);
      break;
  }
}
