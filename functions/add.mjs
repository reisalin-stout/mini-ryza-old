export default async (req, context) => {
  const body = await req.json();
  const message = body.message || "No message provided";
  return new Response(`Message: ${message}`);
};
