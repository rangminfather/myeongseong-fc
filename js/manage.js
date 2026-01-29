function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(ts) {
  if (!ts) return "--:--";
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function getMonthKey(dateStr) {
  // "2026-01-07" -> "2026-01"
  return dateStr.slice(0, 7);
}

function monthTitle(monthKey) {
  // "2026-01" -> "1월"
  const m = Number(monthKey.slice(5, 7));
  return `${m}월`;
}

function initManage() {
  const container = document.getElementById("manage-list");
  if (!container) return;

  const data = loadAttendanceData();

  // 날짜 내림차순 정렬
  const dates = Object.keys(data).sort((a, b) => b.localeCompare(a));

  // 월별 그룹핑: { "2026-01": [ {date, round, ts} ... ] }
  const grouped = {};

  dates.forEach(dateStr => {
    const day = data[dateStr];
    if (!day || !day.rounds) return;

    const rounds = day.rounds;
    const submittedAt = day.submittedAt || {}; // round별 마지막 제출시간

    Object.keys(rounds).forEach(rKey => {
      const r = Number(rKey);
      const list = rounds[r];
      // ✅ "기록이 있는 월만": rounds가 존재하면 기록으로 간주
      // (필요하면 list.length===0인 회차는 숨기도록 바꿀 수 있음)
      if (!Array.isArray(list)) return;

      const mk = getMonthKey(dateStr);
      grouped[mk] = grouped[mk] || [];
      grouped[mk].push({
        date: dateStr,
        round: r,
        ts: submittedAt[r] || null
      });
    });
  });

  // 월 내림차순 정렬
  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // 렌더
  container.innerHTML = "";

  if (monthKeys.length === 0) {
    container.innerHTML = `<div style="opacity:0.8; padding:12px;">아직 기록이 없습니다.</div>`;
    return;
  }

  monthKeys.forEach(mk => {
    const sec = document.createElement("div");
    sec.className = "month-section";

    const title = document.createElement("div");
    title.className = "month-title";
    title.textContent = monthTitle(mk);
    sec.appendChild(title);

    // 같은 날짜 내에서 1회차, 2회차 순 / 최신순 유지
    const rows = grouped[mk].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.round - b.round;
    });

    rows.forEach(row => {
      const line = document.createElement("div");
      line.className = "record-row";

      const left = document.createElement("div");
      left.className = "record-left";
      left.innerHTML = `
        <div class="record-main">${row.date} ${formatTime(row.ts)} · ${row.round}회차</div>
        <div class="record-sub">마지막 제출시간</div>
      `;

      const actions = document.createElement("div");
      actions.className = "record-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn-mini";
      editBtn.textContent = "수정";
      editBtn.onclick = () => {
        // ✅ 출석체크 화면 재사용: 날짜/회차를 세팅하고 화면 이동
        setViewDate(row.date);

        // 회차 셀렉트가 있으면 값 세팅 (attendance 화면 열릴 때 반영)
        const sel = document.getElementById("round-select");
        if (sel) sel.value = String(row.round);

        showScreen("attendance-screen");
        // attendance-screen 진입 시 initAttendance()가 자동 호출되게 되어 있으면 OK
        // (혹시 자동 호출이 없다면 아래 한 줄 유지)
        if (typeof initAttendance === "function") initAttendance();
      };

      const delBtn = document.createElement("button");
      delBtn.className = "btn-mini btn-danger";
      delBtn.textContent = "삭제";
      delBtn.onclick = () => {
        const ok = confirm(`${row.date} ${row.round}회차 기록을 삭제할까요?`);
        if (!ok) return;

        const data2 = loadAttendanceData();
        if (!data2[row.date] || !data2[row.date].rounds) return;

        delete data2[row.date].rounds[row.round];
        if (data2[row.date].submittedAt) delete data2[row.date].submittedAt[row.round];

        // rounds가 비면 날짜 자체 삭제
        const remainRounds = Object.keys(data2[row.date].rounds || {});
        if (remainRounds.length === 0) {
          delete data2[row.date];
        } else {
          // activeRound가 삭제된 회차면 1로 복귀
          if (data2[row.date].activeRound === row.round) data2[row.date].activeRound = 1;
        }

        saveAttendanceData(data2);
        initManage(); // 리스트 갱신
      };

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      line.appendChild(left);
      line.appendChild(actions);
      sec.appendChild(line);
    });

    container.appendChild(sec);
  });
}
