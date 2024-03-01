export default async (req, context) => {
  return new Response(`Message: ${req.body}`);
};
