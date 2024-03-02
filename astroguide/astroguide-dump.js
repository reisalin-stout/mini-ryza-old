const fsp = require("fs/promises");

const staticQuery = "https://astroguide.xyz/page-data/index/page-data.json";
const baseUrl = "https://astroguide.xyz/page-data/sq/d/";
const rootFolder = process.cwd() + "/astroguide/download/";
const astromonFilePath = "2443588729.json";
const skillsFilePath = "2961989819.json";

async function getURL(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    throw new Error(`Error fetching URL: ${error.message}`);
  }
}

async function writeToFile(data, path) {
  try {
    await fsp.writeFile(path, JSON.stringify(data));
    console.log(`Data successfully written to ${path}`);
  } catch (error) {
    console.error(`Error writing to file ${path}: ${error.message}`);
  }
}

async function readFromFile(path) {
  try {
    const jsonData = await fsp.readFile(path, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    throw new Error(`Error reading JSON file: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let finalDatabase = {
  astromons: [],
  effects: [],
};

function removePatterns(inputString) {
  const patterns = ["[FFD428]", "[-]"];
  let outputString = inputString;
  patterns.forEach((pattern) => {
    outputString = outputString.replace(new RegExp("\\" + pattern, "g"), "");
  });
  return outputString;
}

function findUidByString(str, arr) {
  const cleanedString = str.replace(/\([^)]*\)/g, "");
  const foundObject = arr.find((obj) => {
    const cleanedDescription = obj.description.replace(/\([^)]*\)/g, "");
    return cleanedDescription === cleanedString;
  });
  return foundObject ? foundObject : null;
}

function printUidOrString(str) {
  if (str === null) {
    return null;
  }
  const uid = findUidByString(str, finalDatabase.effects);
  if (uid === null) {
    console.log("Couldn't find uid for string:", str);
  }
  return uid;
}

async function main(download = false) {
  if (download) {
    let hashes = await getURL(staticQuery).then((data) => {
      return data.staticQueryHashes;
    });
    for (let h = 0; h < hashes.length; h++) {
      let url = baseUrl + hashes[h] + ".json";
      let location = rootFolder + hashes[h] + ".json";
      let data = await getURL(url);
      await writeToFile(data, location);
      await sleep(500);
    }
  }

  const astromonJSON = await readFromFile(rootFolder + astromonFilePath);
  const skillsJSON = await readFromFile(rootFolder + skillsFilePath);
  const astromonArray = astromonJSON.data.allAstromonsJson.edges;
  const effectsArray = skillsJSON.data.allEffectsJson.edges;

  for (let a = 0; a < astromonArray.length; a++) {
    let node = astromonArray[a].node;
    if (node.evolution >= 3) {
      finalDatabase.astromons.push(new newAstromon(node));
    }
  }
  await writeToFile(finalDatabase, "./astroguide/download/database.json");
}

main();

class newAstromon {
  constructor(node) {
    this.family_name = node.family_name;
    this.name = node.name;
    this.element = node.element;
    this.max_hp = node.hp;
    this.max_attack = node.attack;
    this.max_defence = node.defence;
    this.max_recovery = node.recovery;
  }
}
