const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cors = require("cors");
// For config.env file
dotenv.config({ path: "./config.env" });

const app = express();

// Access your API key as an environment variable
const api_key = process.env.API_KEY;

if (!api_key) {
  console.error("Please set the API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(api_key);

app.use(bodyParser.json());

app.use(cors());

// Updated route to accept prompt as a parameter
app.get("/", async (req, res) => {
  res.status(200).json({
    status: "success",
    data: "Welcome to Gemini API by Akarsh Rajput",
  });
});
app.post("/generate-text", async (req, res) => {
  try {
    // Initialize the generative model
    const modelName = "gemini-pro"; // Replace with the desired model name
    const model = genAI.getGenerativeModel({ model: modelName });

    // Extract prompt from URL parameter
    const prompt = req.body.prompt || "Write a story about a magic backpack.";

    // Generate text from text-only input
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res
      .status(200)
      .json({ status: "success", generatedText: text, by: "Akarsh Rajput" });
  } catch (error) {
    if (
      error.name === "GoogleGenerativeAIResponseError" &&
      error.response.promptFeedback.safetyRatings.some(
        (rating) => rating.label === "LIKELY" || rating.label === "VERY_LIKELY"
      )
    ) {
      // Handle safety-related error
      console.error("Safety-related error:", error);
      res.status(403).json({
        success: false,
        error: "Content blocked due to safety concerns",
      });
    } else {
      // Handle other errors
      console.error("Error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
