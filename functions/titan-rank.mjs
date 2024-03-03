async function findClan(clan_name, app_id, token) {
  console.log(clan_name);
  function rankUrl(map) {
    return `http://v-g-msl-rank.p-msl.com:10831/rank/top/?board_id=${map}&meta_key=rank_${map}`;
  }
  let regions = [
    { name: "Phantom Forest", id: 40, ranking: [] },
    { name: "Lunar Valley", id: 41, ranking: [] },
    { name: "Aria Lake", id: 42, ranking: [] },
    { name: "Mirage Ruins", id: 43, ranking: [] },
    { name: "Pagos Coast", id: 44, ranking: [] },
    { name: "Seabed Caves", id: 45, ranking: [] },
    { name: "Magma Crags", id: 46, ranking: [] },
    { name: "Star Sanctuary", id: 47, ranking: [] },
    { name: "Sky Falls", id: 70, ranking: [] },
    { name: "Slumbering City", id: 71, ranking: [] },
    { name: "Glacial Plains", id: 72, ranking: [] },
    { name: "Aurora Plateau", id: 73, ranking: [] },
    { name: "Deserted Battlefield", id: 74, ranking: [] },
    { name: "Terrestrial Rift", id: 75, ranking: [] },
    { name: "Aotea Island", id: 76, ranking: [] },
  ];

  for (const region of regions) {
    const targetUrl = rankUrl(region.id);
    try {
      const response = await fetch(targetUrl);
      const data = await response.json();
      for (const [entry, entry_data] of Object.entries(data.results)) {
        try {
          let rank_data = entry_data[`rank_${region.id}`];
          if (rank_data.name === clan_name) {
            console.log("Found Something");
            console.log(entry_data);
            patchMessage(
              {
                region: region.name,
                rank: parseInt(entry) + 1,
                clan: rank_data.name,
                level: rank_data.boss_level,
                score: entry_data.score,
                phases: rank_data.join_phase_count,
              },
              app_id,
              token
            );
          }
        } catch (error) {
          patchMessage("Couldn't Find Clan", app_id, token);

          console.log(`Error in board ${JSON.stringify(region.name)}`);
        }
      }
    } catch (error) {
      patchMessage("Couldn't Find Clan", app_id, token);

      console.error(`Error fetching data for region ${region.name}: ${error}`);
    }
  }
  console.log(`Clan '${clan_name}' not found.`);
  return null;
}

async function patchMessage(content, app_id, token) {
  try {
    const response = await fetch(`https://discord.com/api/webhooks/${app_id}/${token}/messages/@original`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to patch message: ${response.status} ${response.statusText}`);
    }

    console.log("Message patched successfully");
  } catch (error) {
    console.error("Error patching message:", error);
  }
}

async function tryout(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Array.isArray(data)) {
        fetch(`http://v-g-msl-rank.p-msl.com:10831/rank/top/?board_id=40&meta_key=rank_40`)
          .then((response) => response.json())
          .then((data) => resolve(data));

        //resolve(data.join(" - "));
      } else {
        resolve(String(data));
      }
    }, 2000);
  });
}

export const handler = async function (event) {
  console.log(event.queryStringParameters);
  const { clan_name, app_id, token } = event.queryStringParameters;
  try {
    //const result = await findClan(clan_name, app_id, token);
    const result = await tryout([clan_name, app_id, token]);
    console.log(result);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
