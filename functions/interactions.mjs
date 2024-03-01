const { validateRequest } = require("discord-interactions");

exports.handler = async (event) => {
  // Validate the incoming request
  const isValidRequest = validateRequest(event);

  if (!isValidRequest) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid request" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ type: 1 }),
  };
};
