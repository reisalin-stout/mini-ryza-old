const url = "https://discord.com/api/v10/applications/1213208038698262678/commands/1213223549385318492";

// For authorization, you can use either your bot token
const headers = {
  Authorization: "",
};

fetch(url, {
  method: "DELETE",
  headers: headers,
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to delete command");
    }
    console.log("Command deleted successfully");
  })
  .catch((error) => {
    console.error("Error deleting command:", error);
  });
