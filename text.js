fetch("https://5535-5-90-197-124.ngrok-free.app/mini-ryza", {
  method: "GET",
  headers: {
    "ngrok-skip-browser-warning": "true", // Make sure the value is a string
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text(); // or response.json() if expecting JSON response
  })
  .then((data) => {
    console.log(data); // log the response data to the console
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });
