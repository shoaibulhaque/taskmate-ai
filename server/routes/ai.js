import express from "express";
// Import ChatGroq instead of ChatOpenAI
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Apply our existing authentication middleware to all AI routes.
router.use(authenticateToken);

/**
 * @route   POST /api/ai/breakdown-task
 * @desc    Breaks down a complex task into smaller sub-tasks using AI.
 * @access  Private
 */
router.post("/breakdown-task", async (req, res) => {
  const { taskTitle } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ message: "Task title is required." });
  }

  try {
    // Initialize the Groq model inside the handler to ensure env is loaded
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-8b-8192",
      temperature: 0.5,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a world-class project manager AI. Your goal is to break down a user's task into a simple, actionable list of 3-5 sub-tasks. Respond ONLY with a numbered list. Do not add any introductory text, concluding remarks, or other formatting.",
      ],
      ["human", "Break down this task: {task}"],
    ]);

    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke({ task: taskTitle });

    const subtasks = result.content
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    res.json({
      message: "Task broken down successfully",
      subtasks: subtasks,
    });
  } catch (error) {
    console.error("Groq Task Breakdown Error:", error);
    res.status(500).json({ message: "Failed to get AI suggestion." });
  }
});

/**
 * @route   POST /api/ai/ask-question
 * @desc    Provides a general Q&A on productivity topics.
 * @access  Private
 */
router.post("/ask-question", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "A question is required." });
  }

  try {
    // Initialize the Groq model inside the handler to ensure env is loaded
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama3-8b-8192",
      temperature: 0.5,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are TaskMate AI, a helpful and concise productivity assistant. Answer the user's question about productivity, time management, or focus in a friendly and direct manner.",
      ],
      ["human", "{question}"],
    ]);

    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke({ question: question });

    res.json({
      message: "Answer retrieved successfully",
      answer: result.content,
    });
  } catch (error) {
    console.error("Groq Q&A Error:", error);
    res.status(500).json({ message: "Failed to get AI answer." });
  }
});

export default router;
