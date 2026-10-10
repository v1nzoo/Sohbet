import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, remove } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1sabf2vO_5YOnk5R3wK9gJYHE68Oh5rM",
  authDomain: "sohbet-8f84b.firebaseapp.com",
  databaseURL: "https://sohbet-8f84b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sohbet-8f84b",
  storageBucket: "sohbet-8f84b.firebasestorage.app",
  messagingSenderId: "575596736774",
  appId: "1:575596736774:web:8d33136ef085acb73a6e87",
  measurementId: "G-QWCF8B2F6R"
};

const MODERATOR_NAME = "Mehmed Emin";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const modal = document.getElementById("name-modal");
const usernameInput = document.getElementById("username-input");
const ppInput = document.getElementById("pp-input");
const saveNameBtn = document.getElementById("save-name-btn");
const changeNameBtn = document.getElementById("change-name-btn");
const userBadge = document.getElementById("current-user-badge");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const messagesBox = document.getElementById("messages-box");

let currentUsername = localStorage.getItem("chat_username") || "";
let currentPP = localStorage.getItem("chat_pp") || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function updateUI() {
  if (currentUsername) {
    modal.style.display = "none";
    const isMod = currentUsername.trim().toLowerCase() === MODERATOR_NAME.toLowerCase();
    userBadge.textContent = isMod ? `👑 ${currentUsername}` : currentUsername;
  } else {
    modal.style.display = "flex";
  }
}

updateUI();

saveNameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const pp = ppInput.value.trim();
  if (name) {
    currentUsername = name;
    localStorage.setItem("chat_username", name);
    if (pp) {
      currentPP = pp;
      localStorage.setItem("chat_pp", pp);
    }
    usernameInput.value = "";
    ppInput.value = "";
    updateUI();
  }
});

changeNameBtn.addEventListener("click", () => {
  usernameInput.value = currentUsername;
  ppInput.value = currentPP;
  modal.style.display = "flex";
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && currentUsername) {
    push(ref(database, "messages"), {
      sender: currentUsername,
      pp: currentPP,
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
});

onChildAdded(ref(database, "messages"), (snapshot) => {
  const msgKey = snapshot.key;
  const data = snapshot.val();
  
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper");
  messageWrapper.id = `msg-${msgKey}`;
  
  const isMyMessage = data.sender === currentUsername;
  if (isMyMessage) {
    messageWrapper.classList.add("my-message");
  }
  
  const isMod = currentUsername.trim().toLowerCase() === MODERATOR_NAME.toLowerCase();
  let deleteButtonHTML = isMod ? `<button class="delete-btn" data-id="${msgKey}">Sil</button>` : "";

  messageWrapper.innerHTML = `
    <img src="${data.pp || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}" class="message-pp" alt="PP">
    <div class="message-card">
      <div class="message-header">
        <span class="sender-name">${data.sender}</span>
        ${deleteButtonHTML}
      </div>
      <div class="message-text">${escapeHTML(data.text)}</div>
    </div>
  `;
  
  messagesBox.appendChild(messageWrapper);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  if (isMod) {
    const delBtn = messageWrapper.querySelector(".delete-btn");
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        remove(ref(database, `messages/${msgKey}`));
      });
    }
  }
});

onChildRemoved(ref(database, "messages"), (snapshot) => {
  const msgKey = snapshot.key;
  const wrapper = document.getElementById(`msg-${msgKey}`);
  if (wrapper) wrapper.remove();
});

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
