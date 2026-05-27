/**
 * @提及功能 composable
 * 按下 @ 键时弹出可提及列表
 */
import { ref } from "vue";

export interface AtAccount {
  id: number;
  账号: string;
}

export function useAtMention() {
  const showAtDropdown = ref(false);
  const filteredAtList = ref<AtAccount[]>([
    { id: 1, 账号: "智谱AI-对话" },
    { id: 2, 账号: "智谱AI-文生图" },
    { id: 3, 账号: "智谱AI-翻译" },
  ]);
  const atDropdownTop = ref(0);
  const atDropdownLeft = ref(0);
  let atStartPos = -1;
  let currentEl: HTMLTextAreaElement | HTMLInputElement | null = null;
  let currentModel: { value: string } | null = null;

  function bind(el: HTMLTextAreaElement | HTMLInputElement, model: { value: string }) {
    currentEl = el;
    currentModel = model;
    el.addEventListener("keyup", onKeyUp);
    el.addEventListener("blur", () => { setTimeout(hideDropdown, 200); });
  }

  function unbind(el: HTMLTextAreaElement | HTMLInputElement) {
    el.removeEventListener("keyup", onKeyUp);
    el.removeEventListener("blur", hideDropdown);
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key !== "@") {
      if (showAtDropdown.value && currentEl) {
        const val = currentEl.value;
        const cursorPos = currentEl.selectionStart ?? 0;
        const afterAt = val.slice(atStartPos + 1, cursorPos);
        if (afterAt.includes(" ") || afterAt.includes("\n") || afterAt.includes("@")) {
          hideDropdown();
        }
      }
      return;
    }

    const el = currentEl;
    if (!el) return;
    atStartPos = (el.selectionStart ?? 1) - 1;
    const rect = el.getBoundingClientRect();
    const pos = getCursorPosition(el, atStartPos);
    atDropdownTop.value = pos.top - rect.top + 24;
    atDropdownLeft.value = pos.left - rect.left;
    showAtDropdown.value = true;
  }

  function selectAccount(account: AtAccount) {
    if (!currentEl || !currentModel || atStartPos < 0) return;
    const el = currentEl;
    const value = currentModel.value;
    const cursorPos = el.selectionStart ?? value.length;
    const beforeAt = value.slice(0, atStartPos);
    const afterCursor = value.slice(cursorPos);
    currentModel.value = beforeAt + "@" + account.账号 + " " + afterCursor;
    hideDropdown();
    const newPos = beforeAt.length + account.账号.length + 2;
    el.focus();
    el.setSelectionRange(newPos, newPos);
  }

  function hideDropdown() {
    showAtDropdown.value = false;
    atStartPos = -1;
  }

  function getCursorPosition(el: HTMLTextAreaElement | HTMLInputElement, pos: number) {
    const lines_arr = el.value.split("\n");
    let lineNum = 0, count = 0;
    for (let i = 0; i < lines_arr.length; i++) {
      if (count + lines_arr[i].length >= pos) { lineNum = i; break; }
      count += lines_arr[i].length + 1;
    }
    const mirror = document.createElement("div");
    const style = window.getComputedStyle(el);
    mirror.style.cssText = `position:absolute;top:-9999px;left:-9999px;white-space:pre-wrap;word-wrap:break-word;font-size:${style.fontSize};font-family:${style.fontFamily};line-height:${style.lineHeight};padding:${style.padding};width:${el.clientWidth}px`;
    let prefix = "";
    for (let i = 0; i < lineNum; i++) prefix += lines_arr[i] + "\n";
    mirror.textContent = prefix + "|";
    document.body.appendChild(mirror);
    const span = document.createElement("span");
    span.textContent = "|";
    mirror.appendChild(span);
    const r = span.getBoundingClientRect();
    document.body.removeChild(mirror);
    return { top: r.top, left: r.left };
  }

  return { showAtDropdown, filteredAtList, atDropdownTop, atDropdownLeft, bind, unbind, selectAccount };
}
