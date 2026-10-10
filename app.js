// Firebase SDK modülleri (v13.0.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-database.js";

// Senin Firebase yapılandırman
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

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const modal = document.getElementById("name-modal");
const usernameInput = document.getElementById("username-input");
const saveNameBtn = document.getElementById("save-name-btn");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const messagesBox = document.getElementById("messages-box");

let currentUsername = localStorage.getItem("chat_username") || "";

if (currentUsername) {
  modal.style.display = "none";
}

saveNameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    currentUsername = name;
    localStorage.setItem("chat_username", name);
    modal.style.display = "none";
  }
});

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

onChildAdded(ref(database, "messages"), (snapshot) => {
  const data = snapshot.val();
  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card");
  
  if (data.sender === currentUsername) {
    messageCard.classList.add("my-message");
  }
  
  messageCard.innerHTML = `<span class="sender-name">${data.sender}</span>${data.text}`;
  messagesBox.appendChild(messageCard);
  messagesBox.scrollTop = messagesBox.scrollHeight;
});
