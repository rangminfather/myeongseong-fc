const APP_VERSION = "1.0.2";

// 화면 전환 공통 함수
function showScreen(screenId) {
  document
    .querySelectorAll(
      "#splash, #menu-screen, #attendance-screen, #manage-screen, #members-screen, #stats-screen"
    )
    .forEach((s) => s?.classList.add("hidden"));

  const target = document.getElementById(screenId);
  if (target) target.classList.remove("hidden");

  if (screenId === "attendance-screen" && typeof initAttendance === "function") initAttendance();
  if (screenId === "manage-screen" && typeof initManage === "function") initManage();
  if (screenId === "members-screen" && typeof renderMembers === "function") renderMembers();
  if (screenId === "stats-screen" && typeof initStats === "function") initStats();
}

function goAttendance() {
  setViewDate(getToday());
  showScreen("attendance-screen");
}

function goManage() {
  showScreen("manage-screen");
}

function goMembers() {
  showScreen("members-screen");
}

function goStats() {
  if (typeof setStatsYear === "function") setStatsYear(new Date().getFullYear());
  showScreen("stats-screen");
}

const BIBLE_VERSES = [
  "여호와는 나의 목자시니 내게 부족함이 없으리로다 (시편 23:1)",
  "주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시편 119:105)",
  "너는 마음을 다하여 여호와를 신뢰하라 (잠언 3:5)",
  "너희는 먼저 그의 나라와 그의 의를 구하라 (마태복음 6:33)",
  "내 은혜가 네게 족하도다 (고린도후서 12:9)",
  "두려워하지 말라 내가 너와 함께 함이라 (이사야 41:10)",
  "항상 기뻐하라 쉬지 말고 기도하라 (데살로니가전서 5:16-17)",
  "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라 (베드로전서 5:7)",
  "여호와를 기뻐하라 그가 네 마음의 소원을 이루어 주시리로다 (시편 37:4)",
  "수고하고 무거운 짐 진 자들아 다 내게로 오라 (마태복음 11:28)",

  "내가 너희에게 평안을 주노니 곧 나의 평안을 너희에게 주노라 (요한복음 14:27)",
  "하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 (로마서 8:28)",
  "너희는 가만히 있어 내가 하나님 됨을 알지어다 (시편 46:10)",
  "너희는 강하고 담대하라 두려워하지 말라 (여호수아 1:9)",
  "오직 성령이 너희에게 임하시면 너희가 권능을 받고 (사도행전 1:8)",
  "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다 (시편 136:1)",
  "주를 의지하는 자는 시온 산이 흔들리지 아니하고 영원히 있음 같도다 (시편 125:1)",
  "너희는 서로 사랑하라 내가 너희를 사랑한 것 같이 (요한복음 13:34)",
  "새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 (이사야 40:31)",
  "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까 (시편 121:1)",

  "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 (시편 27:1)",
  "주의 인자하심이 생명보다 나으므로 내 입술이 주를 찬양할 것이라 (시편 63:3)",
  "주의 뜻을 이루어지이다 (마태복음 6:10)",
  "내가 세상 끝날까지 너희와 항상 함께 있으리라 (마태복음 28:20)",
  "하나님은 사랑이시라 (요한일서 4:8)",
  "진리를 알지니 진리가 너희를 자유롭게 하리라 (요한복음 8:32)",
  "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라 (빌립보서 4:13)",
  "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 (빌립보서 4:6)",
  "평안을 너희에게 끼치노니 (요한복음 14:27)",
  "너희 마음에 근심하지 말라 하나님을 믿으니 또 나를 믿으라 (요한복음 14:1)",

  "나는 길이요 진리요 생명이니 (요한복음 14:6)",
  "사람이 떡으로만 살 것이 아니요 (마태복음 4:4)",
  "심령이 가난한 자는 복이 있나니 (마태복음 5:3)",
  "온유한 자는 복이 있나니 (마태복음 5:5)",
  "화평하게 하는 자는 복이 있나니 (마태복음 5:9)",
  "구하라 그러면 너희에게 주실 것이요 (마태복음 7:7)",
  "너희는 세상의 빛이라 (마태복음 5:14)",
  "너희는 세상의 소금이라 (마태복음 5:13)",
  "내가 너희를 친구라 하였노니 (요한복음 15:15)",
  "나는 포도나무요 너희는 가지라 (요한복음 15:5)",

  "하나님의 나라는 너희 안에 있느니라 (누가복음 17:21)",
  "여호와는 선하시며 환난 날에 산성이시라 (나훔 1:7)",
  "주께서 너를 지키시는 이시라 (시편 121:5)",
  "주의 이름은 견고한 망대라 (잠언 18:10)",
  "의인은 믿음으로 말미암아 살리라 (로마서 1:17)",
  "보라 내가 새 일을 행하리라 (이사야 43:19)",
  "너희는 마음을 새롭게 함으로 변화를 받으라 (로마서 12:2)",
  "그가 찔림은 우리의 허물 때문이요 (이사야 53:5)",
  "주의 은혜는 아침마다 새로우니 (예레미야애가 3:23)",
  "주께서 너를 위하여 싸우시리니 너희는 가만히 있을지니라 (출애굽기 14:14)"
];

let REMOTE_VERSION = APP_VERSION;
let REMOTE_UPDATES = [];

function compareVersion(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const av = pa[i] || 0;
    const bv = pb[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

async function loadRemoteVersionInfo() {
  try {
    const versionRes = await fetch(`./version.json?t=${Date.now()}`, { cache: "no-store" });
    if (versionRes.ok) {
      const versionData = await versionRes.json();
      REMOTE_VERSION = versionData.version || APP_VERSION;
    }
  } catch (e) {
    console.warn("version.json 로드 실패", e);
  }

  try {
    const updatesRes = await fetch(`./updates.json?t=${Date.now()}`, { cache: "no-store" });
    if (updatesRes.ok) {
      REMOTE_UPDATES = await updatesRes.json();
    }
  } catch (e) {
    console.warn("updates.json 로드 실패", e);
  }
}

function renderUpdateNotice() {
  const noticeEl = document.getElementById("update-notice");
  if (!noticeEl) return;

  if (compareVersion(REMOTE_VERSION, APP_VERSION) > 0) {
    noticeEl.textContent = `새 업데이트(${REMOTE_VERSION})가 있습니다. 업데이트 확인 버튼을 눌러주세요.`;
    noticeEl.classList.remove("hidden");
  } else {
    noticeEl.classList.add("hidden");
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function closeUpdateHistoryModal() {
  const modal = document.getElementById("update-history-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function showUpdateHistory() {
  const modal = document.getElementById("update-history-modal");
  const body = document.getElementById("update-history-body");

  if (!modal || !body) return;

  if (!Array.isArray(REMOTE_UPDATES) || REMOTE_UPDATES.length === 0) {
    body.innerHTML = `<div class="update-comment">업데이트 내역이 없습니다.</div>`;
  } else {
    body.innerHTML = REMOTE_UPDATES.map((item) => {
      const changes = Array.isArray(item.changes)
        ? item.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join("")
        : "";

      return `
        <section class="update-entry">
          <div class="update-entry-top">
            <span class="update-version-chip">v${escapeHtml(item.version)}</span>
            <span class="update-date">${escapeHtml(item.date)}</span>
          </div>

          <h4 class="update-entry-title">${escapeHtml(item.title || "")}</h4>

          ${changes ? `<ul class="update-change-list">${changes}</ul>` : ""}

          ${
            item.comment
              ? `<div class="update-comment">${escapeHtml(item.comment)}</div>`
              : ""
          }
        </section>
      `;
    }).join("");
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function applyWaitingWorker(reg) {
  if (reg && reg.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
    return true;
  }
  return false;
}

async function checkForUpdate() {
  if (!("serviceWorker" in navigator)) {
    alert("이 기기에서는 업데이트 확인을 지원하지 않습니다.");
    return;
  }

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    alert("서비스워커가 아직 등록되지 않았습니다.");
    return;
  }

  if (applyWaitingWorker(reg)) {
    alert("업데이트를 적용합니다.");
    return;
  }

  let handled = false;

  const watchInstalling = (worker) => {
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && applyWaitingWorker(reg)) {
        handled = true;
        alert("업데이트를 적용합니다.");
      }
    });
  };

  if (reg.installing) {
    watchInstalling(reg.installing);
  }

  reg.addEventListener(
    "updatefound",
    () => {
      if (reg.installing) {
        watchInstalling(reg.installing);
      }
    },
    { once: true }
  );

  await reg.update();

  if (applyWaitingWorker(reg)) {
    alert("업데이트를 적용합니다.");
    return;
  }

  setTimeout(async () => {
    await loadRemoteVersionInfo();
    renderUpdateNotice();

    if (!handled && !reg.waiting) {
      if (compareVersion(REMOTE_VERSION, APP_VERSION) > 0) {
        alert(`새 버전(${REMOTE_VERSION})이 감지됐지만 아직 적용 대기 중입니다. 앱을 완전히 닫았다가 다시 열어보세요.`);
      } else {
        alert("현재 최신 버전입니다.");
      }
    }
  }, 1500);
}

function bindUpdateUI() {
  const checkBtn = document.getElementById("check-update");
  const historyBtn = document.getElementById("show-update-history");

  if (checkBtn && !checkBtn.dataset.bound) {
    checkBtn.dataset.bound = "1";
    checkBtn.addEventListener("click", checkForUpdate);
  }

  if (historyBtn && !historyBtn.dataset.bound) {
    historyBtn.dataset.bound = "1";
    historyBtn.addEventListener("click", showUpdateHistory);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }

  if (!document.body.dataset.updateModalEscBound) {
    document.body.dataset.updateModalEscBound = "1";
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeUpdateHistoryModal();
      }
    });
  }
}

window.onload = async () => {
  console.log("앱 로드됨");

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }

  const vEl = document.getElementById("app-version");
  if (vEl) vEl.textContent = `v${APP_VERSION}`;

  const verseEl = document.getElementById("splash-verse");
  if (verseEl) {
    const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
    verseEl.textContent = verse;

    const menuVerseEl = document.getElementById("menu-verse");
    if (menuVerseEl) menuVerseEl.textContent = verse;
  }

  bindUpdateUI();
  await loadRemoteVersionInfo();
  renderUpdateNotice();

  setTimeout(() => showScreen("menu-screen"), 3000);
};

function showToastAndGoMenu(message = "저장되었습니다 ✓") {
  const toast = document.getElementById("toast");
  if (!toast) {
    showScreen("menu-screen");
    return;
  }

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show", "flash");

  setTimeout(() => toast.classList.remove("flash"), 200);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 200);
    showScreen("menu-screen");
  }, 900);
}