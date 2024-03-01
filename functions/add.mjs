export default async (req, context) => {
  // Parse the request body
  const body = await req.json();

  // Check if it's a PING message
  if (body.type === 1) {
    // Respond with a PONG message
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    // Handle other types of requests or return an error
    return new Response("Invalid request type", { status: 400 });
  }
};
