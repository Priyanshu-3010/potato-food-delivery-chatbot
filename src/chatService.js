import { GoogleGenAI } from "@google/genai";
import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

function needsWebSearch(message) {
  const lowerMessage = message.toLowerCase();

  const searchKeywords = [
    "latest",
    "current",
    "today",
    "now",
    "recent",
    "price",
    "prices",
    "offer",
    "offers",
    "deal",
    "deals",
    "discount",
    "discounts",
    "near me",
    "nearby",
    "open now",
    "available now",
    "rating",
    "ratings",
    "review",
    "reviews",
    "restaurant near",
    "restaurants near",
    "in jaipur",
    "in delhi",
    "in mumbai",
    "in bangalore",
  ];

  return searchKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );
}

async function webSearch(query) {
  try {
    const response = await tvly.search(query, {
      searchDepth: "advanced",
      maxResults: 5,
    });

    return response.results || [];
  } catch (error) {
    console.error("Tavily search error:", error);
    return [];
  }
}

function formatSearchResults(results) {
  if (!results.length) {
    return "No useful web search results were found.";
  }

  return results
    .map(
      (result, index) => `
SOURCE ${index + 1}
Title: ${result.title || "Unknown"}
URL: ${result.url || "Unknown"}
Content: ${result.content || "No content available"}
`
    )
    .join("\n");
}

export function createChatService({
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  }),
} = {}) {
  const chat = ai.chats.create({
    model: "gemini-3.5-flash-lite",

    config: {
      systemInstruction: `
You are Potato, a food delivery chatbot.

You can only answer questions related to:

- Food and restaurants
- Menu items
- Food recommendations
- Orders
- Order status
- Delivery
- Payments related to food orders
- Refunds and cancellations

If the user asks something unrelated to food delivery, politely refuse.

For example, if the user asks:
"What is Docker?"

Respond:
"Sorry, I can only help with food delivery related questions."

IMPORTANT WEB SEARCH RULES:

Sometimes web search results will be provided to you.

When web search results are provided:

- Use them as factual context.
- Prefer the provided web information for current information.
- Do not invent facts that are not supported by the search results.
- If the search results are insufficient, clearly say that you could not find enough reliable information.
- Do not mention Tavily or the internal search process to the user.
- Do not claim that information is current unless the provided search results support it.
- Keep the answer relevant to food delivery.

Give concise and useful answers.
      `,
    },
  });

  return {
    async *chatStream(message) {
      let messageToSend = message;

      // Search the web only when the query appears to
      // require current/external information.
      if (needsWebSearch(message)) {
        console.log("🌐 Web search:", message);

        const results = await webSearch(message);

        if (results.length > 0) {
          const searchContext = formatSearchResults(results);

          messageToSend = `
User question:
${message}

Here are web search results that may contain relevant information:

${searchContext}

Answer the user's question using the relevant information from these search results.
If the search results do not contain enough information, say so instead of making something up.
`;
        } else {
          console.log("⚠️ No useful Tavily results found.");
        }
      }

      const stream = await chat.sendMessageStream({
        message: messageToSend,
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    },
  };
}