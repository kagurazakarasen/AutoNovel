"use strict";

/* ===========================
   State
=========================== */
let currentIndex = 0;
let answers = {};
let novelText = "";

/* ===========================
   DOM References
=========================== */
const startBtn    = document.getElementById("start-btn");
const prevBtn     = document.getElementById("prev-btn");
const copyBtn     = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");
const restartBtn  = document.getElementById("restart-btn");

/* ===========================
   Event Listeners
=========================== */
startBtn.addEventListener("click", startQuiz);
prevBtn.addEventListener("click", prevQuestion);
copyBtn.addEventListener("click", copyNovel);
downloadBtn.addEventListener("click", downloadNovel);
restartBtn.addEventListener("click", restartApp);

/* ===========================
   Screen Management
=========================== */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ===========================
   Quiz Flow
=========================== */
function startQuiz() {
  currentIndex = 0;
  answers = {};
  showScreen("question-screen");
  renderQuestion(currentIndex);
}

function renderQuestion(index) {
  const q = QUESTIONS[index];

  document.getElementById("question-step").textContent = `質問 ${index + 1}`;
  document.getElementById("question-text").textContent = q.question;
  document.getElementById("progress-text").textContent = `${index + 1} / ${QUESTIONS.length}`;
  document.getElementById("progress-fill").style.width =
    `${(index / QUESTIONS.length) * 100}%`;

  prevBtn.style.visibility = index > 0 ? "visible" : "hidden";

  const grid = document.getElementById("options-grid");
  grid.innerHTML = "";

  // 3択のときは3カラムに
  grid.className = "options-grid" + (q.options.length === 3 ? " cols-3" : "");

  q.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn" + (answers[q.id] === option ? " selected" : "");
    btn.textContent = option;
    btn.addEventListener("click", () => handleOptionClick(q.id, option, btn));
    grid.appendChild(btn);
  });
}

function handleOptionClick(questionId, value, clickedBtn) {
  answers[questionId] = value;

  // 選択状態を更新
  document.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("selected"));
  clickedBtn.classList.add("selected");

  // 少し間を置いて次へ
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < QUESTIONS.length) {
      renderQuestion(currentIndex);
    } else {
      generateNovel();
    }
  }, 280);
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion(currentIndex);
  }
}

/* ===========================
   Generation
=========================== */
async function generateNovel() {
  showScreen("loading-screen");
  novelText = "";

  const statuses = [
    "AIが物語を構想しています...",
    "キャラクターを作り上げています...",
    "情景を描写しています...",
    "クライマックスを執筆中...",
    "物語を完成させています...",
  ];
  let statusIdx = 0;
  const statusEl = document.getElementById("loading-status");
  const statusTimer = setInterval(() => {
    statusEl.textContent = statuses[statusIdx % statuses.length];
    statusIdx++;
  }, 2000);

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    clearInterval(statusTimer);

    if (!res.ok) {
      // JSONエラーレスポンスを処理
      const err = await res.json().catch(() => ({ error: "生成に失敗しました。" }));
      alert(err.error || "生成に失敗しました。");
      showScreen("start-screen");
      return;
    }

    showScreen("result-screen");

    const novelContent = document.getElementById("novel-content");
    novelContent.innerHTML = "";

    // カーソル要素
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    novelContent.appendChild(cursor);

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      novelText += decoder.decode(value, { stream: true });
      novelContent.innerHTML = formatNovelHtml(novelText) + '<span class="cursor"></span>';
      novelContent.parentElement.scrollTop = novelContent.parentElement.scrollHeight;
    }

    // 完了時：カーソル除去・最終レンダリング
    novelContent.innerHTML = formatNovelHtml(novelText);

    // プログレスバーを100%に
    document.getElementById("progress-fill").style.width = "100%";

  } catch (e) {
    clearInterval(statusTimer);
    alert("エラーが発生しました: " + e.message);
    showScreen("start-screen");
  }
}

/* ===========================
   Novel Formatting
=========================== */
/**
 * テキストをHTML用に安全にエスケープしつつ、
 * "# タイトル" 行をタグで装飾する
 */
function formatNovelHtml(text) {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      const escaped = escapeHtml(line);
      if (line.startsWith("# ")) {
        return `<span class="novel-title-line">${escapeHtml(line.slice(2))}</span>`;
      }
      return escaped;
    })
    .join("\n");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ===========================
   Actions
=========================== */
function copyNovel() {
  if (!novelText) return;
  navigator.clipboard.writeText(novelText).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = "✅ コピーしました";
    setTimeout(() => (copyBtn.textContent = original), 2000);
  });
}

function downloadNovel() {
  if (!novelText) return;

  // ファイル名にタイトルを使用（あれば）
  const titleMatch = novelText.match(/^#\s+(.+)/m);
  const baseName = titleMatch ? titleMatch[1].trim().slice(0, 30) : "novel";
  const fileName = `${baseName}.txt`;

  const blob = new Blob([novelText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function restartApp() {
  answers = {};
  novelText = "";
  currentIndex = 0;
  showScreen("start-screen");
}
