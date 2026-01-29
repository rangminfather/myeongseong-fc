const APP_VERSION = "1.0.0";


// 화면 전환 공통 함수
function showScreen(screenId) {
  document.querySelectorAll(
    "#splash, #menu-screen, #attendance-screen, #manage-screen, #members-screen, #stats-screen"
  ).forEach(s => s?.classList.add("hidden"));

  const target = document.getElementById(screenId);
  if (target) target.classList.remove("hidden");

  if (screenId === "attendance-screen" && typeof initAttendance === "function") initAttendance();
  if (screenId === "manage-screen" && typeof initManage === "function") initManage();
  if (screenId === "members-screen" && typeof renderMembers === "function") renderMembers();
  if (screenId === "stats-screen" && typeof initStats === "function") initStats();
}

// 메뉴 이동 함수들
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
  // 기본: 현재 연도
  if (typeof setStatsYear === "function") setStatsYear(new Date().getFullYear());
  showScreen("stats-screen");
}

/// 앱 시작
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

  "우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 (로마서 5:8)",
  "내가 너희에게 평안을 주노니 곧 나의 평안을 너희에게 주노라 (요한복음 14:27)",
  "하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 (로마서 8:28)",
  "너희는 가만히 있어 내가 하나님 됨을 알지어다 (시편 46:10)",
  "너희는 강하고 담대하라 두려워하지 말라 (여호수아 1:9)",
  "오직 성령이 너희에게 임하시면 너희가 권능을 받고 (사도행전 1:8)",
  "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다 (시편 136:1)",
  "주를 의지하는 자는 시온 산이 흔들리지 아니하고 영원히 있음 같도다 (시편 125:1)",
  "너희는 서로 사랑하라 내가 너희를 사랑한 것 같이 (요한복음 13:34)",
  "새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 (이사야 40:31)",

  "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 (시편 27:1)",
  "주께서 내 길을 인도하시리로다 (잠언 3:6)",
  "여호와는 마음이 상한 자를 가까이 하시고 (시편 34:18)",
  "주 여호와는 나의 힘이시라 (하박국 3:19)",
  "너희 마음을 새롭게 함으로 변화를 받으라 (로마서 12:2)",
  "나는 포도나무요 너희는 가지라 (요한복음 15:5)",
  "진리가 너희를 자유롭게 하리라 (요한복음 8:32)",
  "여호와의 이름은 견고한 망대라 (잠언 18:10)",
  "주는 나의 반석이시요 나의 요새시요 (시편 18:2)",
  "주께 가까이 함이 내게 복이라 (시편 73:28)",

  "내가 네 길을 가르쳐 보이고 너를 주목하여 훈계하리로다 (시편 32:8)",
  "여호와께서 너를 지키시리라 (시편 121:7)",
  "주의 인자하심이 생명보다 나으므로 (시편 63:3)",
  "나의 하나님이 그리스도 예수 안에서 너희 모든 쓸 것을 채우시리라 (빌립보서 4:19)",
  "주 안에서 항상 기뻐하라 (빌립보서 4:4)",
  "아무 것도 염려하지 말고 (빌립보서 4:6)",
  "우리는 믿음으로 행하고 보는 것으로 행하지 아니함이로다 (고린도후서 5:7)",
  "내가 세상 끝날까지 너희와 항상 함께 있으리라 (마태복음 28:20)",
  "너희는 세상의 빛이라 (마태복음 5:14)",
  "여호와는 은혜로우시며 긍휼이 많으시며 (시편 145:8)",

  "주의 말씀은 순결함이여 (시편 12:6)",
  "주께서 나를 붙드심으로 내가 안전하리이다 (시편 3:5)",
  "여호와는 나의 힘과 방패시니 (시편 28:7)",
  "여호와께 소망을 두는 자는 복이 있도다 (예레미야 17:7)",
  "너희는 세상에서 환난을 당하나 담대하라 (요한복음 16:33)",
  "주의 은혜가 아침마다 새로우니 (예레미야애가 3:23)",
  "주께서 주신 평강이 너희 마음을 지키시리라 (빌립보서 4:7)",
  "하나님은 사랑이시라 (요한일서 4:8)",
  "주를 의뢰함이 사람을 의뢰함보다 나으니이다 (시편 118:8)",
  "여호와의 선하심을 맛보아 알지어다 (시편 34:8)",

  // ↓ 여기까지 약 100개
  // 실제 프로젝트에서는 이 아래도 그대로 사용 가능

  "주께서 너를 축복하시고 지키시기를 원하며 (민수기 6:24)",
  "주께서 그의 얼굴을 네게 비추사 은혜 베푸시기를 원하며 (민수기 6:25)",
  "주께서 그 얼굴을 네게로 향하여 드사 평강 주시기를 원하노라 (민수기 6:26)",
  "여호와를 경외하는 것이 지혜의 근본이니라 (잠언 9:10)",
  "주의 말씀은 영원히 하늘에 굳게 섰사오며 (시편 119:89)",
  "여호와는 나의 기업이시니 (시편 16:5)",
  "주께서 내 앞에 길을 여시리라 (이사야 45:2)",
  "하나님은 우리의 피난처시요 힘이시니 (시편 46:1)",
  "주께서 내 손을 붙드심이로다 (시편 73:23)",
  "여호와의 인자하심은 영원하도다 (시편 136:26)"
];

window.onload = () => {
  console.log("앱 로드됨");

  // 메뉴 버전 표기
  const vEl = document.getElementById("app-version");
  if (vEl) vEl.textContent = `v${APP_VERSION}`;

  // 스플래시: 말씀 랜덤 출력
  const verseEl = document.getElementById("splash-verse");
  if (verseEl) {
  const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  verseEl.textContent = verse;

  // ✅ 메뉴에도 같은 말씀 유지
  const menuVerseEl = document.getElementById("menu-verse");
  if (menuVerseEl) menuVerseEl.textContent = verse;
  }

  // 2초 뒤 메뉴로 전환
  setTimeout(() => showScreen("menu-screen"), 3000);
};

// 토스트
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
