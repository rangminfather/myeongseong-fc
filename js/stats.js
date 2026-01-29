// =========================
// 통계 (연도별 / YTD) FINAL
// - 월별 출석 추이(막대), 개인별 참석횟수(전체, 스크롤), 월별요약(그룹 분해)
// - 1~3등: 🏆 트로피(금/은/동), 4등부터: 4,5,6… 숫자
// =========================

let STATS_YEAR = new Date().getFullYear();

const GROUP_LABEL = { youth: "청소년", young: "청년", adult: "장년" };
const GROUPS = ["youth", "young", "adult"];

function clampYear(y) {
  const current = new Date().getFullYear();
  if (y < 2000) return 2000;
  if (y > current) return current;
  return y;
}
function setStatsYear(y) { STATS_YEAR = clampYear(y); }
function getStatsYear() { return STATS_YEAR; }

function safeNum(n) { return Number.isFinite(n) ? n : 0; }
function formatInt(n) { return String(Math.round(safeNum(n))); }

function monthIndex(dateStr) {
  // YYYY-MM-DD
  const m = parseInt(String(dateStr).slice(5, 7), 10);
  if (!Number.isFinite(m)) return null;
  return m; // 1..12
}

function sanitizeIds(arr, validIds) {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.filter(id => validIds.has(id))));
}

function computeYearStats(year) {
  const data = loadAttendanceData();
  const membersList = getMembers();

  const validIds = new Set(membersList.map(m => m.id));
  const idToName = {};
  const idToGroup = {};
  membersList.forEach(m => {
    idToName[m.id] = m.name;
    idToGroup[m.id] = m.group || "young";
  });

  let totalSessions = 0;      // 시행횟수
  let totalAttendance = 0;    // 총 출석수(누적)
  const uniqueYear = new Set(); // 참여인원(1회이상/누적)

  // 월별 집계
  const sessionsByMonth = Array.from({ length: 12 }, () => 0);
  const attTotalByMonth = Array.from({ length: 12 }, () => 0);
  const attGroupByMonth = Array.from({ length: 12 }, () => ({ youth: 0, young: 0, adult: 0 }));
  const uniqueSetsByMonth = Array.from({ length: 12 }, () => ({
    youth: new Set(),
    young: new Set(),
    adult: new Set()
  }));

  // 개인별 참석 횟수(연도)
  const memberCount = {}; // id -> count(회)

  Object.keys(data).forEach(dateStr => {
    if (!dateStr || dateStr.slice(0, 4) !== String(year)) return;

    const day = data[dateStr];
    if (!day || !day.rounds) return;

    const mIdx = monthIndex(dateStr);
    if (!mIdx) return;
    const mi = mIdx - 1;

    Object.keys(day.rounds).forEach(roundKey => {
      const cleaned = sanitizeIds(day.rounds[roundKey], validIds);

      // 출석자 없는 회차는 시행으로 치지 않음
      if (cleaned.length === 0) return;

      totalSessions += 1;
      sessionsByMonth[mi] += 1;

      totalAttendance += cleaned.length;
      attTotalByMonth[mi] += cleaned.length;

      cleaned.forEach(id => {
        uniqueYear.add(id);
        memberCount[id] = (memberCount[id] || 0) + 1;

        const g = idToGroup[id] || "young";
        if (GROUPS.includes(g)) {
          attGroupByMonth[mi][g] += 1;
          uniqueSetsByMonth[mi][g].add(id);
        }
      });
    });
  });

  const avg = totalSessions > 0 ? totalAttendance / totalSessions : 0;

  // 개인별 전체 랭킹(출석 기록 있는 사람만)
  const allRank = Object.keys(memberCount)
    .map(id => ({
      id,
      name: idToName[id] || "(알 수 없음)",
      group: idToGroup[id] || "young",
      count: memberCount[id]
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));

  return {
    year,
    totalSessions,
    totalAttendance,
    avg,
    uniqueCount: uniqueYear.size,
    sessionsByMonth,
    attTotalByMonth,
    attGroupByMonth,
    uniqueSetsByMonth,
    allRank
  };
}

function renderMonthlyBars(attTotalByMonth) {
  const wrap = document.getElementById("monthly-bars");
  if (!wrap) return;

  wrap.innerHTML = "";
  const maxVal = Math.max(1, ...attTotalByMonth);

  attTotalByMonth.forEach((v, i) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = `${i + 1}월`;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${Math.round((v / maxVal) * 100)}%`;

    const value = document.createElement("div");
    value.className = "bar-value";
    value.textContent = formatInt(v);

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);

    wrap.appendChild(row);
  });
}

function trophyClass(idx) {
  if (idx === 0) return "gold";
  if (idx === 1) return "silver";
  if (idx === 2) return "bronze";
  return "";
}

function renderAllRank(allRank) {
  const wrap = document.getElementById("top-members");
  if (!wrap) return;

  if (!allRank || allRank.length === 0) {
    wrap.innerHTML = `<div class="empty">아직 출석 데이터가 없어요.</div>`;
    return;
  }

  wrap.innerHTML = "";

  allRank.forEach((m, idx) => {
    const item = document.createElement("div");
    item.className = "rank-item";

    const left = document.createElement("div");
    left.className = "rank-left";

    const icon = document.createElement("span");
    if (idx <= 2) {
      icon.className = `rank-trophy ${trophyClass(idx)}`;
      icon.textContent = "🏆";
    } else {
      icon.className = "rank-trophy rank-number";
      icon.textContent = String(idx + 1);
    }

    const name = document.createElement("span");
    name.className = "rank-name";
    const gLabel = GROUP_LABEL[m.group] || "미분류";
    name.textContent = `${m.name} (${gLabel})`;

    left.appendChild(icon);
    left.appendChild(name);

    const right = document.createElement("div");
    right.className = "rank-right";
    right.textContent = `${m.count}회`;

    item.appendChild(left);
    item.appendChild(right);

    wrap.appendChild(item);
  });
}

function renderMonthlyTable(stats) {
  const tbody = document.getElementById("stats-monthly-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const sessions = stats.sessionsByMonth[i];
    const attTotal = stats.attTotalByMonth[i];
    const attG = stats.attGroupByMonth[i];

    const uniqY = stats.uniqueSetsByMonth[i].youth.size;
    const uniqN = stats.uniqueSetsByMonth[i].young.size;
    const uniqA = stats.uniqueSetsByMonth[i].adult.size;
    const uniqTotal = uniqY + uniqN + uniqA;

    const avg = sessions > 0 ? attTotal / sessions : 0;

    // 컬럼 순서: 합계 / 청소년 / 청년 / 장년
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-center">${i + 1}월</td>
      <td class="td-center">${formatInt(sessions)}</td>

      <td class="td-center td-strong">${formatInt(attTotal)}</td>
      <td class="td-center">${formatInt(attG.youth)}</td>
      <td class="td-center">${formatInt(attG.young)}</td>
      <td class="td-center">${formatInt(attG.adult)}</td>

      <td class="td-center">${sessions > 0 ? avg.toFixed(1) : "-"}</td>

      <td class="td-center td-strong">${formatInt(uniqTotal)}</td>
      <td class="td-center">${formatInt(uniqY)}</td>
      <td class="td-center">${formatInt(uniqN)}</td>
      <td class="td-center">${formatInt(uniqA)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function updateStatsNavButtons() {
  const prev = document.getElementById("stats-prev");
  const next = document.getElementById("stats-next");
  const currentYear = new Date().getFullYear();

  if (prev) prev.disabled = (STATS_YEAR <= 2000);
  if (next) next.disabled = (STATS_YEAR >= currentYear);
}

function applyStatsLabelsAndTitles() {
  const l1 = document.getElementById("stat-label-1");
  const l2 = document.getElementById("stat-label-2");
  const l3 = document.getElementById("stat-label-3");
  const l4 = document.getElementById("stat-label-4");
  const rankTitle = document.getElementById("panel-rank-title");

  if (l1) l1.textContent = "총 출석수(누적/명)";
  if (l2) l2.textContent = "시행횟수";
  if (l3) l3.textContent = "평균출석(누적/명)";
  if (l4) l4.textContent = "참여인원(1회이상/누적)";

  if (rankTitle) rankTitle.textContent = "개인별 참석횟수";
}

function initStats() {
  applyStatsLabelsAndTitles();

  // 연도 표시
  const yearEl = document.getElementById("stats-year");
  if (yearEl) yearEl.textContent = String(getStatsYear());

  updateStatsNavButtons();

  // 집계 + 렌더
  const stats = computeYearStats(getStatsYear());

  const totalEl = document.getElementById("stat-total-att");
  const sessionsEl = document.getElementById("stat-sessions");
  const avgEl = document.getElementById("stat-avg");
  const uniqueEl = document.getElementById("stat-unique");

  if (totalEl) totalEl.textContent = formatInt(stats.totalAttendance);
  if (sessionsEl) sessionsEl.textContent = formatInt(stats.totalSessions);
  if (avgEl) avgEl.textContent = stats.totalSessions > 0 ? stats.avg.toFixed(1) : "0";
  if (uniqueEl) uniqueEl.textContent = formatInt(stats.uniqueCount);

  renderMonthlyBars(stats.attTotalByMonth);
  renderAllRank(stats.allRank);
  renderMonthlyTable(stats);

  // 연도 이동 버튼 바인딩(중복 방지)
  const prev = document.getElementById("stats-prev");
  const next = document.getElementById("stats-next");

  if (prev && !prev.dataset.bound) {
    prev.dataset.bound = "1";
    prev.addEventListener("click", () => {
      setStatsYear(getStatsYear() - 1);
      initStats();
    });
  }

  if (next && !next.dataset.bound) {
    next.dataset.bound = "1";
    next.addEventListener("click", () => {
      setStatsYear(getStatsYear() + 1);
      initStats();
    });
  }
}
