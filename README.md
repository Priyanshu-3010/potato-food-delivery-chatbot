# 🥔 Potato — AI Food Delivery Assistant

Potato is an AI-powered food delivery assistant built with **Node.js, Express.js, Google Gemini and Retrieval-Augmented Generation (RAG)**.

It is designed to handle food-delivery related conversations such as restaurant queries, orders, delivery, cancellations and refunds while maintaining conversational context across messages.

The project is continuously evolving as I experiment with **LLM application architecture, embeddings, semantic search, RAG and web search integration**.

---

## 🚀 Key Features

- 💬 **Context-aware conversational AI**
  - Maintains conversation context across multiple messages
  - Provides responses based on previous interactions

- 🤖 **Gemini-powered LLM**
  - Uses Google Gemini for natural-language understanding and response generation
  - Custom system instructions restrict the assistant to food-delivery related conversations

- 🧠 **Semantic Search with Embeddings**
  - Generates vector embeddings for relevant information
  - Uses **cosine similarity** to identify semantically relevant content

- 🔎 **RAG Pipeline**
  - Retrieves relevant information before generating responses
  - Helps ground LLM responses using retrieved context

- 🌐 **Web Search Integration**
  - Uses web search when external/current information is required
  - Integrated with Tavily for search capabilities

- ⚡ **Streaming Responses**
  - Streams AI-generated responses to the client instead of waiting for the complete response
  - Improves the conversational experience

- 🍕 **Food Delivery Domain**
  - Restaurant-related queries
  - Food recommendations
  - Order-related questions
  - Delivery information
  - Cancellation and refund queries

- 🚫 **Domain Restriction**
  - Politely rejects unrelated queries instead of acting as a general-purpose chatbot

- 🔐 **Secure API Configuration**
  - API credentials are stored using environment variables
  - Secrets are excluded from version control

- 🧪 **Automated Backend Testing**
  - Backend functionality tested using Node.js Test Runner and Supertest

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Potato Frontend  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Express REST    │
                         │      API         │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Chat Service   │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
             ┌───────────┐ ┌───────────┐ ┌────────────┐
             │ Embeddings│ │  Tavily   │ │  Gemini    │
             │  / Search │ │ Web Search│ │    LLM     │
             └─────┬─────┘ └─────┬─────┘ └─────┬──────┘
                   │             │              │
                   └─────────────┼──────────────┘
                                 │
                                 ▼
                         ┌──────────────────┐
                         │ Grounded /       │
                         │ Contextual Reply │
                         └────────┬─────────┘
                                  │
                                  ▼
                              User
