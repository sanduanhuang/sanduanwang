const common = {
  isEmpty(obj: unknown): boolean {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === "string") return obj.trim() === "";
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === "object") return Object.keys(obj).length === 0;
    return false;
  },

  isNotEmpty(obj: unknown): boolean {
    return !this.isEmpty(obj);
  },

  /**
   * 格式化日期为指定格式的字符串
   * @param date - 日期对象或日期字符串
   * @param format - 输出格式，默认 "YYYY-MM-DD HH:mm:ss"
   *                 支持的占位符:
   *                 - YYYY: 四位年份
   *                 - MM: 两位月份 (01-12)
   *                 - DD: 两位日期 (01-31)
   *                 - HH: 两位小时 (00-23)
   *                 - mm: 两位分钟 (00-59)
   *                 - ss: 两位秒数 (00-59)
   * @returns 格式化后的日期字符串
   * @example
   * // 返回 "2024-01-15 14:30:00"
   * formatDate(new Date(2024, 0, 15, 14, 30, 0));
   * 
   * // 返回 "2024/01/15"
   * formatDate("2024-01-15", "YYYY/MM/DD");
   */
  formatDate(date: Date | string, format = "YYYY-MM-DD HH:mm:ss"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  },

  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function (this: unknown, ...args: Parameters<T>) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let previous = 0;
    return function (this: unknown, ...args: Parameters<T>) {
      const now = Date.now();
      if (!previous) previous = now;
      const remaining = wait - (now - previous);
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  },
};

export default common;