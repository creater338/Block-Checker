
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, runTransaction }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPvN6gfVH6sm_5YLEdoXGAO6pJ8aL01RU",
  authDomain: "databasetensou.firebaseapp.com",
  databaseURL: "https://databasetensou-default-rtdb.firebaseio.com",
  projectId: "databasetensou",
  storageBucket: "databasetensou.firebasestorage.app",
  messagingSenderId: "40117637115",
  appId: "1:40117637115:web:fabb94b785626b3519455e",
};

const DB_PATH = "entries";

const NUMBER_MIN = 0;
const NUMBER_MAX = 5;

const CHANGE_PROBABILITY = 0.025;

// ■ 表示メッセージ
const MSG_EMPTY = "両方の欄を入力してください。";
const MSG_ERROR = "送信に失敗しました。時間をおいて再度お試しください。";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("entry-form");
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("submit-button");
const thanks = document.getElementById("thanks");
const myNumber = document.getElementById("my-number");

function generateNumber() {
  return Math.floor(Math.random() * (NUMBER_MAX - NUMBER_MIN + 1)) + NUMBER_MIN;
}

async function makePairKey(value1, value2) {
  const bytes = new TextEncoder().encode(JSON.stringify([value1, value2]));
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


function nextNumber(saved) {

  if (Math.random() >= CHANGE_PROBABILITY) return saved;


  const goUp = Math.random() < 0.5;

  if (saved <= 0) return goUp ? saved + 1 : saved;

  return goUp ? saved + 1 : saved - 1;
}


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const value1 = input1.value.trim();
  const value2 = input2.value.trim();

  if (!value1 || !value2) {
    errorMessage.textContent = MSG_EMPTY;
    return;
  }

  errorMessage.textContent = "";
  submitButton.disabled = true;

  try {
    const key = await makePairKey(value1, value2);

    const result = await runTransaction(ref(db, `${DB_PATH}/${key}`), (current) => {
      if (current === null || !Number.isInteger(current.number)) {
        return {
          input1: value1,
          input2: value2,
          number: generateNumber(),
          createdAt: Date.now(),
        };
      }

      const newNumber = nextNumber(current.number);
      if (newNumber === current.number) return current;
      return { ...current, number: newNumber, updatedAt: Date.now() };
    });

    myNumber.textContent = result.snapshot.val().number;
    form.hidden = true;
    thanks.hidden = false;
  } catch (error) {
    console.error(error);
    errorMessage.textContent = MSG_ERROR;
    submitButton.disabled = false;
  }
});
