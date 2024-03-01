const url = "https://discord.com/api/v10/applications/1213208038698262678/commands";

const json = {
  name: "blep",
  type: 1,
  description: "Send a random adorable animal photo",
  options: [
    {
      name: "animal",
      description: "The type of animal",
      type: 3,
      required: true,
      choices: [
        {
          name: "Dog",
          value: "animal_dog",
        },
        {
          name: "Cat",
          value: "animal_cat",
        },
        {
          name: "Penguin",
          value: "animal_penguin",
        },
      ],
    },
    {
      name: "only_smol",
      description: "Whether to show only baby animals",
      type: 5,
      required: false,
    },
  ],
};

// For authorization, you can use either your bot token
const headers = {
  Authorization: "Bot MTIxMzIwODAzODY5ODI2MjY3OA.GNaqah.lNS3iiWurqIbMCFhaWRZJl-S45ch4eJOetxlFY",
};

// or a client credentials token for your app with the applications.commands.update scope
// const headers = {
//     "Authorization": "Bearer <my_credentials_token>"
// };

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify(json),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to send request");
    }
    console.log("Request sent successfully");
  })
  .catch((error) => {
    console.error("Error sending request:", error);
  });
