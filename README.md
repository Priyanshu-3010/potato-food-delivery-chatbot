# 🥔 Potato — AI Food Delivery Chatbot

Potato is an AI-powered food delivery chatbot built using **Node.js, Express.js, and Google Gemini**. It provides a simple conversational interface where users can ask food-related questions and receive AI-generated responses in real time through streaming.

## ✨ Features

- 🤖 **AI-Powered Chatbot:** Uses Google Gemini to generate responses to food delivery-related queries.
- 🍔 **Food-Focused Conversations:** Handles questions about food, menu items, restaurant recommendations, orders, delivery, payments, refunds, and cancellations.
- ⚡ **Streaming Responses:** Displays responses incrementally as the AI generates them.
- 💬 **Conversation Context:** Maintains conversational context through a Gemini chat session.
- 🎯 **Topic Restriction:** Configures the AI to focus on food delivery-related queries.
- 🌐 **Simple Web Interface:** Built with HTML, CSS, and vanilla JavaScript.
- 🔐 **Environment Variables:** Keeps API credentials outside the frontend code.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend server and API |
| Google Gemini API | AI-powered conversations |
| `@google/genai` | Gemini API integration |
| HTML5 | Web page structure |
| CSS3 | User interface styling |
| JavaScript | Frontend interactions and streaming |
| dotenv | Environment variable management |
| Supertest | HTTP endpoint testing |
| Node.js Test Runner | Automated testing |

## 📂 Project Structure

```text
potato-food-delivery-chatbot/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── src/
│   ├── app.js
│   └── chatService.js
├── test/
│   └── app.test.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Priyanshu-3010/potato-food-delivery-chatbot.git
```

### 2. Navigate to the Project Directory

```bash
cd potato-food-delivery-chatbot
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Replace `your_gemini_api_key` with your actual Gemini API key.

**Important:** Never commit your `.env` file or expose your API key in client-side JavaScript.

### 5. Start the Server

```bash
node server.js
```

By default, the application runs on port `3000`, unless another port is configured through the `PORT` environment variable.

### 6. Open the Application

Visit:

```text
http://localhost:3000
```

You can now interact with the Potato chatbot through the web interface.

## 🔌 API Documentation

### `POST /api/chat`

Accepts a user's message and returns an AI-generated response as streamed plain text.

**Request Headers**

```http
Content-Type: application/json
```

**Request Body**

```json
{
  "message": "Suggest some vegetarian dinner options."
}
```

**Example Using cURL**

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Suggest some vegetarian dinner options."}'
```

**Response Behavior**

- Returns a `400 Bad Request` response if the message is missing or contains only whitespace.
- Streams generated text to the client as the response becomes available.
- Uses `text/plain; charset=utf-8` for the response body.

## 🔄 Application Workflow

1. The user enters a message in the web chat interface.
2. The frontend sends the message to the Express backend.
3. The backend passes it to the chat service.
4. The chat service communicates with Google Gemini.
5. Gemini generates a response in streaming chunks.
6. The frontend reads and displays the chunks incrementally.

## 🔒 Security Considerations

- Store the Gemini API key in environment variables.
- Never expose API credentials in frontend code.
- Configure environment variables securely when deploying.
- Consider adding rate limiting, input-size limits, and production-grade error handling before public deployment.

## 🚧 Current Limitations

Potato is an AI chatbot prototype rather than a complete food ordering platform.

- Restaurant and menu data are not backed by a dedicated database.
- Cart management, checkout, and payment processing are not implemented.
- Live order tracking is not implemented.
- AI-generated responses may occasionally be inaccurate.
- The current chat implementation does not provide isolated, authenticated conversations for individual users.

## 🧪 Testing

Run the project's test command:

```bash
npm test
```

**Note:** Ensure the tests in `test/app.test.js` match the current `/api/chat` endpoint before relying on the test results.

## 🚀 Future Improvements

- Integrate a restaurant and menu database.
- Add cart and order management.
- Implement secure checkout and payment integration.
- Add user authentication and individual chat sessions.
- Introduce persistent conversation history.
- Improve error handling, logging, and API rate limiting.
- Deploy the application with production-ready configuration.

## 👨‍💻 Author

**Priyanshu Singh Shekhawat**

- GitHub: [@Priyanshu-3010](https://github.com/Priyanshu-3010)
- Project: [Potato — Food Delivery Chatbot](https://github.com/Priyanshu-3010/potato-food-delivery-chatbot)

---

⭐ If you find this project interesting, consider giving the repository a star.
