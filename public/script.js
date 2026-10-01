const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

const messagesEl = document.getElementById("messages");
const welcomeEl = document.getElementById("welcome");
const sendButton = document.getElementById("send-button");
const headerStatus = document.getElementById("header-status");
const suggestionButtons = document.querySelectorAll(".suggestion");

const DEFAULT_STATUS = "Your food delivery assistant";

let isProcessing = false;
let stickToBottom = true;

/* ==========================================================
   API layer
   Same contract as before: POST /api/chat with { message },
   response streamed as plain text and read with
   response.body.getReader().
   ========================================================== */

async function streamChat(message, onChunk) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }

  // Flush any bytes the decoder is still holding
  const tail = decoder.decode();
  if (tail) onChunk(tail);
}

/* ==========================================================
   Sending messages
   ========================================================== */

async function sendMessage(message) {
  if (!message || isProcessing) return;

  welcomeEl.hidden = true;
  addUserMessage(message);

  stickToBottom = true;
  scrollToBottom(true);

  await requestReply(message);
}

async function requestReply(message) {
  setProcessing(true);

  const bot = addBotMessage();
  showTyping(bot);

  let fullText = "";

  try {
    await streamChat(message, (chunk) => {
      fullText += chunk;
      bot.bubble.innerHTML = renderRichText(fullText);
      scrollToBottom();
    });

    if (!fullText.trim()) {
      throw new Error("Empty response");
    }
  } catch (error) {
    console.error(error);
    showError(bot, fullText, message);
  } finally {
    setProcessing(false);
    scrollToBottom();
  }
}

/* ==========================================================
   Message DOM helpers
   ========================================================== */

const USER_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path>
  </svg>`;

const BOT_ICON = `<svg aria-hidden="true"><use href="#potato"></use></svg>`;

function createMessage(sender) {
  const row = document.createElement("div");
  row.classList.add("message", sender);

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.innerHTML = sender === "bot" ? BOT_ICON : USER_ICON;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  row.append(avatar, bubble);
  messagesEl.appendChild(row);

  return { row, bubble };
}

function addUserMessage(text) {
  const msg = createMessage("user");
  msg.bubble.textContent = text;
  return msg;
}

function addBotMessage() {
  return createMessage("bot");
}

function showTyping(bot) {
  bot.bubble.innerHTML =
    '<span class="typing" role="status" aria-label="Potato is typing">' +
    "<span></span><span></span><span></span></span>";
  scrollToBottom();
}

function showError(bot, partialText, originalMessage) {
  const note = document.createElement("div");
  note.className = "error-note";

  const text = document.createElement("span");
  text.textContent = "Something went wrong. Check your connection and try again.";

  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "retry-btn";
  retry.textContent = "Try again";
  retry.addEventListener("click", () => {
    if (isProcessing) return;
    bot.row.remove();
    requestReply(originalMessage);
  });

  note.append(text, retry);

  if (partialText.trim()) {
    // Keep what already streamed in, and add the error under it
    bot.bubble.innerHTML = renderRichText(partialText);
  } else {
    bot.bubble.innerHTML = "";
    bot.bubble.classList.add("error");
  }

  bot.bubble.appendChild(note);
}

/* ==========================================================
   Light formatting for bot replies
   Text is escaped first, so nothing from the stream can inject HTML.
   Supports: paragraphs, - / * / 1. lists, # headings, **bold**, `code`
   ========================================================== */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(text) {
  return escapeHtml(text)
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
}

function renderRichText(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  let html = "";
  let listType = null;
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html += "<p>" + paragraph.join("<br>") + "</p>";
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      html += "</" + listType + ">";
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (heading) {
      flushParagraph();
      closeList();
      html += '<p class="bubble-heading">' + formatInline(heading[1]) + "</p>";
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";

      if (listType !== type) {
        closeList();
        html += "<" + type + ">";
        listType = type;
      }

      html += "<li>" + formatInline((bullet || numbered)[1]) + "</li>";
    } else if (line.trim() === "") {
      // Blank lines inside a list keep the list open (numbering stays intact)
      flushParagraph();
    } else {
      closeList();
      paragraph.push(formatInline(line));
    }
  }

  flushParagraph();
  closeList();

  return html;
}

/* ==========================================================
   UI state
   ========================================================== */

function setProcessing(value) {
  isProcessing = value;

  sendButton.classList.toggle("is-loading", value);
  headerStatus.textContent = value ? "Potato is typing..." : DEFAULT_STATUS;
  suggestionButtons.forEach((btn) => (btn.disabled = value));

  updateSendButton();

  if (!value) messageInput.focus();
}

function updateSendButton() {
  const hasText = messageInput.value.trim().length > 0;
  sendButton.disabled = isProcessing || !hasText;
}

function resizeInput() {
  messageInput.style.height = "auto";
  messageInput.style.height = messageInput.scrollHeight + "px";
}

function scrollToBottom(force = false) {
  if (force || stickToBottom) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

/* ==========================================================
   Events
   ========================================================== */

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();

  if (!message || isProcessing) return;

  messageInput.value = "";
  resizeInput();
  updateSendButton();

  sendMessage(message);
});

// Enter sends, Shift + Enter adds a new line
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

messageInput.addEventListener("input", () => {
  resizeInput();
  updateSendButton();
});

// Only auto-scroll while the user is near the bottom,
// so they can scroll up and read during a long reply.
chatBox.addEventListener("scroll", () => {
  const distanceFromBottom =
    chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
  stickToBottom = distanceFromBottom < 80;
});

suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    sendMessage(btn.dataset.prompt);
  });
});

messageInput.focus();