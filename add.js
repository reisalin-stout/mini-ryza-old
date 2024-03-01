exports.handler = async (event, context) => {
  const { text } = JSON.parse(event.body);
  const numbers = text.split(" ").map(Number);
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const message = `The sum is ${numbers.join("+")} = ${sum}`;

  return {
    statusCode: 200,
    body: JSON.stringify({ text: message }),
  };
};
