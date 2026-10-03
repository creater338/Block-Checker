
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFunctions, httpsCallable }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPvN6gfVH6sm_5YLEdoXGAO6pJ8aL01RU",
  authDomain: "databasetensou.firebaseapp.com",
  projectId: "databasetensou",
  storageBucket: "databasetensou.firebasestorage.app",
  messagingSenderId: "40117637115",
  appId: "1:40117637115:web:fabb94b785626b3519455e",
};

const FUNCTIONS_REGION = "asia-northeast1";
const FUNCTION_NAME = "submitEntry";


const MSG_EMPTY = "両方の欄を入力してください。";
const MSG_ERROR = "送信に失敗しました。時間をおいて再度お試しください。";

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, FUNCTIONS_REGION);
const submitEntry = httpsCallable(functions, FUNCTION_NAME);

const form = document.getElementById("entry-form");
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("submit-button");
const thanks = document.getElementById("thanks");
const myNumber = document.getElementById("my-number");

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
   
    const result = await submitEntry({ input1: value1, input2: value2 });

    myNumber.textContent = result.data.number;
    form.hidden = true;
    thanks.hidden = false;
  } catch (error) {
    console.error(error);
    errorMessage.textContent = MSG_ERROR;
    submitButton.disabled = false;
  }
});
