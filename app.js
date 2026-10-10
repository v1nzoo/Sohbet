import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, remove } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

// Firebase Yapılandırması
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

// Moderatör İsim Tanımı
const MODERATOR_NAME = "canz";

// Firebase Başlatma
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elemanları
const modal = document.getElementById("name-modal");
const usernameInput = document.getElementById("username-input");
const saveNameBtn = document.getElementById("save-name-btn");
const changeNameBtn = document.getElementById("change-name-btn");
const userBadge = document.getElementById("current-user-badge");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const messagesBox = document.getElementById("messages-box");

let currentUsername = localStorage.getItem("chat_username") || "";

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

// İsim Kaydetme
saveNameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    currentUsername = name;
    localStorage.setItem("chat_username", name);
    usernameInput.value = "";
    updateUI();
  }
});

// İsim Değiştirme Butonu
changeNameBtn.addEventListener("click", () => {
  usernameInput.value = currentUsername;
  modal.style.display = "flex";
});

// Mesaj Gönderme
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text && currentUsername) {
    push(ref(database, "messages"), {
      sender: currentUsername,
      text: text,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
});

// Yeni Mesaj Geldiğinde
onChildAdded(ref(database, "messages"), (snapshot) => {
  const msgKey = snapshot.key;
  const data = snapshot.val();
  
  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card");
  messageCard.id = `msg-${msgKey}`;
  
  if (data.sender === currentUsername) {
    messageCard.classList.add("my-message");
  }
  
  const isMod = currentUsername.trim().toLowerCase() === MODERATOR_NAME.toLowerCase();
  
  let deleteButtonHTML = "";
  if (isMod) {
    deleteButtonHTML = `<button class="delete-btn" title="Mesajı Sil" data-id="${msgKey}">🗑️</button>`;
  }

  messageCard.innerHTML = `
    <div class="message-header">
      <span class="sender-name">${data.sender}</span>
      ${deleteButtonHTML}
    </div>
    <div class="message-text">${escapeHTML(data.text)}</div>
  `;
  
  messagesBox.appendChild(messageCard);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Moderatör silme tıklaması
  if (isMod) {
    const delBtn = messageCard.querySelector(".delete-btn");
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        remove(ref(database, `messages/${msgKey}`));
      });
    }
  }
});

// Mesaj Silindiğinde Canlı Olarak Ekrandan Kaldır
onChildRemoved(ref(database, "messages"), (snapshot) => {
  const msgKey = snapshot.key;
  const card = document.getElementById(`msg-${msgKey}`);
  if (card) {
    card.remove();
  }
});

// Güvenlik için HTML Escape Fonksiyonu
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
