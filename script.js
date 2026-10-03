// ==========================================================
// script.js : Firebase Realtime Database への保存処理
// ==========================================================

// ---- Firebase SDK の読み込み(ES Modules 形式) ----
// バージョン(12.19.0)は Firebase コンソールで発行されたコードに合わせている
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase, ref, push, set }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

// ==========================================================
// ★ 設定エリア(ここだけ書き換えれば動作を変えられる)
// ==========================================================

// ■ Firebase の接続設定
// 「プロジェクトの設定 > マイアプリ」に表示されるコードをそのまま貼る。
// ※ Realtime Database を使うには databaseURL が必須。
//    Firebaseコンソール > Realtime Database のデータ画面の上部に表示されるURLをコピーすること。
const firebaseConfig = {
  apiKey: "AIzaSyBPvN6gfVH6sm_5YLEdoXGAO6pJ8aL01RU",
  authDomain: "databasetensou.firebaseapp.com",
  databaseURL: "https://databasetensou-default-rtdb.firebaseio.com", // ★必ず書き換える
  projectId: "databasetensou",
  storageBucket: "databasetensou.firebasestorage.app",
  messagingSenderId: "40117637115",
  appId: "1:40117637115:web:fabb94b785626b3519455e",
};

// ■ DB上の保存先(パス)。フォルダのようなもの。自由に変更OK
const DB_PATH = "entries";

// ■ 保存方式の切り替え
//   false : 自動ID方式  → entries/(自動ID)/ { input1: "...", input2: "..." }
//           同じ文字を何度送っても上書きされず、全部残る。おすすめ。
//   true  : 辞書方式   → entries/(入力欄①の文字) = "入力欄②の文字"
//           Pythonの dict[key] = value と同じ。同じキーを送ると上書きされる。
//           ※キーに . $ # [ ] / は使えないので、下の sanitizeKey で除去している。
const USE_INPUT1_AS_KEY = false;

// ■ 表示メッセージ
const MSG_EMPTY = "両方の欄を入力してください。";
const MSG_ERROR = "送信に失敗しました。時間をおいて再度お試しください。";

// ==========================================================
// 以下は処理本体(基本的に触らなくてOK)
// ==========================================================

// Firebase を初期化し、DB への接続を取得
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// HTML の要素を取得(index.html の id と対応)
const form = document.getElementById("entry-form");
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");
const errorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("submit-button");
const thanks = document.getElementById("thanks");

// Firebase のキーに使えない文字を取り除く(辞書方式のときだけ使用)
function sanitizeKey(text) {
  return text.replace(/[.$#\[\]/]/g, "");
}

// フォーム送信時の処理
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // ページの再読み込みを防ぐ

  // 前後の空白を除去して取得
  const value1 = input1.value.trim();
  const value2 = input2.value.trim();

  // 未入力チェック
  if (!value1 || !value2) {
    errorMessage.textContent = MSG_EMPTY;
    return;
  }

  errorMessage.textContent = "";
  submitButton.disabled = true; // 二重送信を防ぐ

  try {
    if (USE_INPUT1_AS_KEY) {
      // ---- 辞書方式: 入力欄①をキー、入力欄②を値として保存 ----
      const key = sanitizeKey(value1);
      if (!key) throw new Error("キーとして使える文字がありません");
      await set(ref(db, `${DB_PATH}/${key}`), value2);
    } else {
      // ---- 自動ID方式: 1回の送信を1レコード(2項目セット)として保存 ----
      // push() が一意のIDを自動生成するので、データが上書きされない
      await set(push(ref(db, DB_PATH)), {
        input1: value1,          // ★ DB上の項目名は自由に変更可(例: word)
        input2: value2,          // ★ 同上(例: meaning)
        createdAt: Date.now(),   // 送信日時(ミリ秒)。不要なら削除OK
      });
    }

    // ---- 成功: 入力フォームを閉じて、お礼メッセージを表示 ----
    form.hidden = true;
    thanks.hidden = false;
  } catch (error) {
    console.error(error); // 原因の確認用(ブラウザの開発者ツールのコンソールに出る)
    errorMessage.textContent = MSG_ERROR;
    submitButton.disabled = false; // 再送信できるようにボタンを戻す
  }
});
