// 회원 목록 (초기 데이터)
let members = [
  { name: "김철수", group: "youth" },     // 청소년
  { name: "이영희", group: "young" },     // 청년
  { name: "박민수", group: "young" },     // 청년
  { name: "정성헌", group: "adult" }      // 장년
];



/* =========================
   2. 출석 저장 관련 (추가)
========================= */

const STORAGE_KEY = "myeongseong_fc_attendance";

// 오늘 날짜 (YYYY-MM-DD)
function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// 전체 출석 데이터 불러오기
function loadAttendanceData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

// 저장
function saveAttendanceData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Attendance data for a specific date (default: current VIEW_DATE)
function getTodayAttendance(dateStr = getViewDate()) {
  const data = loadAttendanceData();
  const key = dateStr || getToday();

  if (!data[key]) {
    data[key] = {
      activeRound: 1,
      rounds: { 1: [] }
    };
    saveAttendanceData(data);
    return data;
  }

  // ✅ 예전 구조(present)를 새 구조로 자동 변환 (호환)
  if (Array.isArray(data[key].present)) {
    data[key] = {
      activeRound: 1,
      rounds: { 1: data[key].present }
    };
    saveAttendanceData(data);
  }

  // ✅ rounds 기본 보장
  if (!data[key].rounds) data[key].rounds = { 1: [] };
  if (!data[key].activeRound) data[key].activeRound = 1;
  if (!Array.isArray(data[key].rounds[1])) data[key].rounds[1] = [];

  return data;
}

// “현재 보고 있는 날짜(viewDate)” 상태 추가

// =========================
// 현재 화면에서 보고 있는 날짜(출석체크 재사용용)
// =========================
let VIEW_DATE = getToday();

function setViewDate(dateStr) {
  VIEW_DATE = dateStr;
}

function getViewDate() {
  return VIEW_DATE;
}


// =========================
// members id 부여 + 출석데이터 이름->id 마이그레이션
// =========================

const MEMBERS_KEY = "myeongseong_fc_members";
const MIGRATION_FLAG_KEY = "myeongseong_fc_migrated_to_ids_v1";

// members 저장/로드 (이제부터는 이걸 쓰게 될 것)
function loadMembers() {
  const raw = localStorage.getItem(MEMBERS_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveMembers(list) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(list));
}

// 간단한 id 생성기 (중복 확률 낮음)
function genMemberId() {
  return "m_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

// members 배열에 id 없으면 부여
function ensureMemberIds(membersList) {
  return membersList.map(m => {
    if (!m.id) return { ...m, id: genMemberId() };
    return m;
  });
}

// 이름->id 매핑 생성 (동명이인 있으면 첫 번째가 우선됨)
function buildNameToIdMap(membersList) {
  const map = {};
  membersList.forEach(m => {
    if (!map[m.name]) map[m.name] = m.id;
  });
  return map;
}

// ✅ 기존 출석 데이터(이름배열)를 id배열로 변환
function migrateAttendanceNamesToIds() {
  // 이미 마이그레이션 했으면 중복 실행 방지
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === "1") {
    console.log("[migrate] already migrated");
    return;
  }

  // 1) members 가져오기: (A) localStorage에 저장된 members 우선, (B) 전역 members fallback
  let list = loadMembers();
  if (!Array.isArray(list)) {
    // 전역 members가 있다면 그걸 사용
    if (typeof members !== "undefined" && Array.isArray(members)) {
      list = members;
    } else {
      alert("members 데이터를 찾을 수 없습니다. data.js의 members 선언을 확인하세요.");
      return;
    }
  }

  // 2) members에 id 부여 후 저장
  list = ensureMemberIds(list);
  saveMembers(list);

  const nameToId = buildNameToIdMap(list);

  // 3) 출석 데이터 로드 + 백업
  const data = loadAttendanceData();
  const backupKey = STORAGE_KEY + "_backup_before_id_migration_" + new Date().toISOString();
  localStorage.setItem(backupKey, JSON.stringify(data));
  console.log("[migrate] backup saved:", backupKey);

  // 4) 데이터 변환
  Object.keys(data).forEach(dateStr => {
    const day = data[dateStr];
    if (!day || !day.rounds) return;

    Object.keys(day.rounds).forEach(roundKey => {
      const arr = day.rounds[roundKey];
      if (!Array.isArray(arr)) return;

      // 이름 배열이면 id로 변환
      // (이미 id처럼 생긴 값이면 그대로 유지)
      const converted = arr
        .map(x => {
          if (typeof x !== "string") return null;
          if (x.startsWith("m_")) return x; // 이미 id면 유지
          return nameToId[x] || null;       // 이름->id 변환, 없으면 null
        })
        .filter(Boolean);

      day.rounds[roundKey] = converted;
    });
  });

  // 5) 저장 + 플래그 기록
  saveAttendanceData(data);
  localStorage.setItem(MIGRATION_FLAG_KEY, "1");

  console.log("[migrate] done");
  alert("마이그레이션 완료! (이름 기반 출석기록 → id 기반)");
}


// =========================
// 앱에서 사용할 members 전역 갱신
// =========================
function getMembers() {
  const list = loadMembers();
  // 혹시나 null이면(처음 실행 등) 기존 전역 members를 저장해버림
  if (!Array.isArray(list)) {
    if (typeof members !== "undefined" && Array.isArray(members)) {
      const withIds = ensureMemberIds(members);
      saveMembers(withIds);
      return withIds;
    }
    return [];
  }
  return list;
}

// 다른 파일에서 members를 계속 쓰고 있으니 전역 members를 최신으로 유지
function refreshMembersGlobal() {
  // NOTE: other files reference global identifier `members` directly,
  // so we must update `members` itself (not only window.members).
  members = getMembers();
  window.members = members;
}


refreshMembersGlobal();
