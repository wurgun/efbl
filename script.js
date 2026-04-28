const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-tabs]").forEach((tabs) => {
  const buttons = Array.from(tabs.querySelectorAll("[data-tab]"));
  const panels = Array.from(tabs.querySelectorAll("[data-panel]"));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === target);
      });
    });
  });
});

const chatWidget = document.querySelector(".chat-widget");
const chatLauncher = document.querySelector(".chat-launcher");
const chatClose = document.querySelector(".chat-close");
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector("#chat-question");
const chatMessages = document.querySelector(".chat-messages");
const chatPrompts = document.querySelectorAll(".chat-prompts button");

function setChatOpen(open) {
  if (!chatWidget || !chatLauncher) return;
  chatWidget.classList.toggle("open", open);
  chatLauncher.setAttribute("aria-expanded", String(open));
  if (open && chatInput) {
    chatInput.focus();
  }
}

function addChatMessage(content, role = "assistant", citations = []) {
  if (!chatMessages) return null;

  const message = document.createElement("article");
  message.className = `chat-message ${role}`;
  message.textContent = content;

  if (citations.length > 0) {
    const list = document.createElement("div");
    list.className = "chat-citations";
    citations.slice(0, 4).forEach((citation) => {
      const item = document.createElement("span");
      item.textContent = `Kaynak: ${citation.title}, sayfa ${citation.page}`;
      list.appendChild(item);
    });
    message.appendChild(list);
  }

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

async function askAssistant(question) {
  addChatMessage(question, "user");
  const loading = addChatMessage("PDF rehberinde ilgili bölümler aranıyor...", "assistant loading");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Asistan yanıt veremedi.");
    }

    loading.remove();
    addChatMessage(data.answer, "assistant", data.citations || []);
  } catch (error) {
    loading.textContent =
      "Asistan şu anda çalışmıyor. Yayın ortamında OPENAI_API_KEY ve PDF indeksi tanımlı olmalı.";
  }
}

if (chatLauncher) {
  chatLauncher.addEventListener("click", () => setChatOpen(true));
}

if (chatClose) {
  chatClose.addEventListener("click", () => setChatOpen(false));
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;
    chatInput.value = "";
    askAssistant(question);
  });
}

chatPrompts.forEach((prompt) => {
  prompt.addEventListener("click", () => {
    setChatOpen(true);
    askAssistant(prompt.textContent.trim());
  });
});
