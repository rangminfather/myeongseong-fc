function groupLabel(key) {
  if (key === "youth") return "청소년";
  if (key === "young") return "청년";
  return "장년";
}

function renderMembers() {
  refreshMembersGlobal();
  const root = document.getElementById("members-list");
  if (!root) return;

  // 그룹별로 분리
  const byGroup = { youth: [], young: [], adult: [] };
  members.forEach(m => {
    (byGroup[m.group] || byGroup.adult).push(m);
  });

  // 그룹 내 이름 정렬(가독성)
  Object.keys(byGroup).forEach(g => {
    byGroup[g].sort((a, b) => a.name.localeCompare(b.name));
  });

  root.innerHTML = "";

  ["youth", "young", "adult"].forEach(g => {
    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = groupLabel(g);
    root.appendChild(title);

    byGroup[g].forEach(m => {
      root.appendChild(renderMemberRow(m));
    });
  });
}

function renderMemberRow(member) {
  const row = document.createElement("div");
  row.className = "member-row";

  const left = document.createElement("div");
  left.className = "member-left";

  const nameText = document.createElement("div");
  nameText.className = "member-name-text";
  nameText.textContent = member.name;

  const hint = document.createElement("div");
  hint.className = "hint-text hidden";

  left.appendChild(nameText);
  left.appendChild(hint);

  const actions = document.createElement("div");
  actions.className = "member-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn-mini";
  editBtn.textContent = "수정";

  const delBtn = document.createElement("button");
  delBtn.className = "btn-mini btn-danger";
  delBtn.textContent = "삭제";

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  row.appendChild(left);
  row.appendChild(actions);

  // 편집 UI
  let editing = false;
  let editBox = null;

  editBtn.onclick = () => {
    if (!editing) {
      editing = true;
      editBtn.textContent = "완료";

      hint.textContent = "이름이나 소속을 바꾸어도 최종 수정된 상태로 기록이 남습니다.";
      hint.classList.remove("hidden");

      editBox = document.createElement("div");
      editBox.className = "edit-box";
      editBox.innerHTML = `
        <input type="text" value="${escapeHtml(member.name)}" />
        <select>
          <option value="youth">청소년</option>
          <option value="young">청년</option>
          <option value="adult">장년</option>
        </select>
      `;

      const sel = editBox.querySelector("select");
      sel.value = member.group;

      left.appendChild(editBox);
    } else {
      // 제출
      const newName = editBox.querySelector("input").value;
      const newGroup = editBox.querySelector("select").value;

      // 빈 값 방지(최소)
      if (!newName.trim()) {
        hint.textContent = "이름은 비워둘 수 없습니다.";
        hint.classList.remove("hidden");
        return;
      }

      // members 업데이트
      const list = getMembers();
      const idx = list.findIndex(x => x.id === member.id);
      if (idx >= 0) {
        list[idx].name = newName;
        list[idx].group = newGroup;
        saveMembers(list);
        refreshMembersGlobal();
      }

      // UI 종료
      editing = false;
      editBtn.textContent = "수정";
      hint.classList.add("hidden");
      if (editBox) editBox.remove();

      if (typeof showToastAndGoMenu === "function") {
        // stays on members screen; just show toast without leaving
        const toast = document.getElementById("toast");
        if (toast) {
          toast.textContent = "수정 완료 ✓";
          toast.classList.remove("hidden");
          toast.classList.add("show");
          setTimeout(() => { toast.classList.remove("show"); toast.classList.add("hidden"); }, 900);
        }
      }

      renderMembers(); // 전체 리렌더 (깔끔)
    }
  };

  delBtn.onclick = () => {
    hint.classList.remove("hidden");
    hint.classList.add("warn-text");
    hint.textContent = "주의! 기존 기록은 모두 삭제됩니다!";

    const ok = confirm("주의! 기존 기록은 모두 삭제됩니다!\n정말 삭제할까요?");
    if (!ok) {
      hint.classList.add("hidden");
      hint.classList.remove("warn-text");
      return;
    }

    // 1) members에서 삭제
    let list = getMembers().filter(x => x.id !== member.id);
    saveMembers(list);
    refreshMembersGlobal();

    // 2) 출석 기록에서 해당 id 제거
    const data = loadAttendanceData();
    Object.keys(data).forEach(dateStr => {
      const day = data[dateStr];
      if (!day || !day.rounds) return;
      Object.keys(day.rounds).forEach(rk => {
        const arr = day.rounds[rk];
        if (!Array.isArray(arr)) return;
        day.rounds[rk] = arr.filter(id => id !== member.id);
      });
    });
    saveAttendanceData(data);

    renderMembers();
  };

  return row;
}

// 회원 추가
function bindAddMember() {
  const nameEl = document.getElementById("add-name");
  const groupEl = document.getElementById("add-group");
  const btn = document.getElementById("add-btn");
  const hint = document.getElementById("add-hint");

  if (!btn) return;

  btn.onclick = () => {
    const name = (nameEl?.value || "").trim();
    const group = groupEl?.value || "youth";

    if (!name) {
      hint.textContent = "이름을 입력하세요.";
      hint.classList.remove("hidden");
      return;
    }

    // members 추가
    let list = getMembers();
    const newMember = { id: genMemberId(), name, group };
    list.push(newMember);
    saveMembers(list);
    refreshMembersGlobal();

    // 입력 초기화
    if (nameEl) nameEl.value = "";
    hint.classList.add("hidden");

    if (typeof showToastAndGoMenu === "function") {
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "회원 추가 ✓";
        toast.classList.remove("hidden");
        toast.classList.add("show");
        setTimeout(() => { toast.classList.remove("show"); toast.classList.add("hidden"); }, 900);
      }
    }

    renderMembers();
  };
}

// HTML escape (간단)
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  bindAddMember();
});
