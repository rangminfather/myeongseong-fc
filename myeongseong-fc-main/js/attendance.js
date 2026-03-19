console.log("attendance.js 로드됨");

function initAttendance() {
  // members 최신 반영 (회원관리에서 추가/수정/삭제해도 바로 반영)
  if (typeof refreshMembersGlobal === "function") refreshMembersGlobal();

  const youthList = document.getElementById("youth-list");
  const youngList = document.getElementById("young-list");
  const adultList = document.getElementById("adult-list");

  youthList.innerHTML = "";
  youngList.innerHTML = "";
  adultList.innerHTML = "";

  const dateStr = getViewDate();

  // ✅ 과거/삭제된 회원 id가 출석데이터에 남아 있으면
  // 카운트가 부풀어 보이므로, 현재 members 기준으로 정리한다.
  sanitizeAttendanceFor(dateStr, getSelectedRound());
  updateTodayCount();

  // 그룹별 렌더
  members.forEach(member => {
    if (member.group === "youth") createMemberButton(member, youthList);
    if (member.group === "young") createMemberButton(member, youngList);
    if (member.group === "adult") createMemberButton(member, adultList);
  });
}

// ✅ 현재 members에 존재하지 않는 id / 중복 id를 정리
function sanitizeAttendanceFor(dateStr, round) {
  const data = getTodayAttendance();
  const day = data[dateStr];
  if (!day) return;

  day.rounds = day.rounds || {};
  day.rounds[round] = day.rounds[round] || [];

  const valid = new Set((Array.isArray(members) ? members : []).map(m => m.id));
  const seen = new Set();
  const cleaned = [];

  for (const id of day.rounds[round]) {
    if (typeof id !== "string") continue;
    if (!valid.has(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    cleaned.push(id);
  }

  if (cleaned.length !== day.rounds[round].length) {
    day.rounds[round] = cleaned;
    saveAttendanceData(data);
  }
}

// 현재 회차
function getSelectedRound() {
  const sel = document.getElementById("round-select");
  return sel ? Number(sel.value) : 1;
}

// 회원 버튼 생성 + 토글 (id 기반)
function createMemberButton(member, listEl) {
  const li = document.createElement("li");
  li.className = "member-item";

  li.innerHTML = `
    <span class="member-name">${member.name}</span>
    <span class="member-status">결석</span>
  `;

  const dateStr = getViewDate();
  const round = getSelectedRound();

  // 렌더 시점에도 한번 더 정리(회차 변경/멤버 변경 직후 안전)
  sanitizeAttendanceFor(dateStr, round);

  const data = getTodayAttendance();

  data[dateStr].rounds = data[dateStr].rounds || {};
  data[dateStr].rounds[round] = data[dateStr].rounds[round] || [];

  const presentIds = data[dateStr].rounds[round];

  if (presentIds.includes(member.id)) markPresent(li);
  else markAbsent(li);

  li.addEventListener("click", () => toggleAttendance(member.id, li));
  listEl.appendChild(li);
}

// 출석 토글 로직 (id 기반)
function toggleAttendance(memberId, el) {
  const data = getTodayAttendance();
  const dateStr = getViewDate();
  const round = getSelectedRound();

  // 토글 전에도 유효하지 않은 값 정리
  sanitizeAttendanceFor(dateStr, round);

  data[dateStr].rounds = data[dateStr].rounds || {};
  data[dateStr].rounds[round] = data[dateStr].rounds[round] || [];
  const presentIds = data[dateStr].rounds[round];

  if (presentIds.includes(memberId)) {
    data[dateStr].rounds[round] = presentIds.filter(id => id !== memberId);
    markAbsent(el);
  } else {
    presentIds.push(memberId);
    markPresent(el);
  }

  data[dateStr].activeRound = round;
  saveAttendanceData(data);

  updateTodayCount();
}

// UI 상태 변경
function markPresent(el) {
  el.classList.add("present");
  const s = el.querySelector(".member-status");
  if (s) s.textContent = "출석";
}

function markAbsent(el) {
  el.classList.remove("present");
  const s = el.querySelector(".member-status");
  if (s) s.textContent = "결석";
}

// 카운트 업데이트 (현재 viewDate + round 기준)
function updateTodayCount() {
  const data = getTodayAttendance();
  const dateStr = getViewDate();
  const round = getSelectedRound();

  // 카운트 직전에도 정리(혹시 다른 화면/코드에서 데이터가 꼬여도 방어)
  sanitizeAttendanceFor(dateStr, round);

  data[dateStr].rounds = data[dateStr].rounds || {};
  const list = data[dateStr].rounds[round] || [];

  const el = document.getElementById("today-count");
  if (el) el.textContent = `${dateStr} 출석 ${list.length}명`;
}

// round-select 변경 시 재렌더
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("round-select");
  if (sel) {
    sel.addEventListener("change", () => {
      initAttendance();
    });
  }

  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      // ✅ 제출시간 저장 (제출 버튼 기준)
      const data = getTodayAttendance();
      const dateStr = getViewDate();
      const round = getSelectedRound();

      data[dateStr] = data[dateStr] || { activeRound: 1, rounds: {} };
      data[dateStr].submittedAt = data[dateStr].submittedAt || {};
      data[dateStr].submittedAt[round] = Date.now();

      saveAttendanceData(data);

      // 토스트 + 메뉴
      if (typeof showToastAndGoMenu === "function") {
        showToastAndGoMenu("저장되었습니다 ✓");
      } else {
        alert("저장되었습니다");
        showScreen("menu-screen");
      }
    });
  }
});
