const url = "https://discord.com/api/v10/applications/1213208038698262678/commands/1213223549385318492";

let mytoken1 = "MTIxMzIwODAzODY5ODI2MjY3OA.GJnu9I";
let mytoken2 = ".KPCvRJBUttrb4mFtivY4JA3Fo4ssv3fvtlqhGk";

let mytoken = "Bot " + mytoken1 + mytoken2;
// For authorization, you can use either your bot token
const headers = {
  Authorization: mytoken,
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
