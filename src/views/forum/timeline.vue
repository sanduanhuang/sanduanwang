<template>
  <div class="timeline-page">
    <div class="page-bg"></div>

    <div class="page-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">时</span><span class="title-rest">间轴</span>
        </h1>
      </div>
    </div>

    <div class="page-body">
      <div class="timeline-layout">
        <!-- 左侧目录 -->
        <aside class="tl-sidebar">
          <div class="tl-directory">
            <div v-for="year in timelineYears" :key="year.year" class="dir-year">
              <div class="dir-year-label">{{ year.year }}</div>
              <div
                v-for="month in year.months"
                :key="month.month"
                class="dir-month"
              >
                <div class="dir-month-label">{{ month.month }} 月</div>
                <div
                  v-for="day in month.days"
                  :key="day.date"
                  class="dir-day"
                  @click="scrollToDate(day.date)"
                >
                  {{ day.day }} 日
                  <span class="dir-count">{{ day.count }}</span>
                </div>
              </div>
            </div>
            <div v-if="timelineYears.length === 0" class="dir-empty">暂无记录</div>
          </div>
        </aside>

        <!-- 右侧内容 -->
        <div class="content-wrap">
        <div v-if="loading" class="state-box"><span class="spinner"></span></div>
        <div v-else-if="error" class="state-box"><el-empty :description="error" /></div>
        <div v-else-if="posts.length === 0" class="state-box"><el-empty description="暂无记录" /></div>
        <div v-else class="tl-container">
          <div
            v-for="(post, index) in posts"
            :key="post.id || index"
            :data-date="formatDate(post.创建时间)"
            class="tl-row"
            :class="{ right: index % 2 === 1 }"
          >
            <!-- 左侧：卡片（只有封面） -->
            <div class="tl-card" @click="goToPost(post)">
              <img :src="post.封面 || 'https://free.picui.cn/free/2026/05/26/6a152a9a6176e.jpg'" :alt="post.标题" />
            </div>
            <!-- 右侧：文字信息 -->
            <div class="tl-info" @click="goToPost(post)">
              <h3 class="tl-title">{{ post.标题 }}</h3>
              <div v-if="post.标签 && post.标签.length" class="tl-tags">
                <span v-for="tag in post.标签" :key="getTagName(tag)" class="tl-tag">{{ getTagName(tag) }}</span>
              </div>
              <time class="tl-date">{{ formatTime(post.创建时间) }}</time>
            </div>
            <!-- 序号 -->
            <span class="tl-num">{{ posts.length - index }}</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBackgrounds, getForumPosts } from '@/api/data';
import type { Forum } from '@/types';

interface TimelineDay {
  date: string;
  day: number;
  count: number;
}
interface TimelineMonth {
  month: number;
  days: TimelineDay[];
}
interface TimelineYear {
  year: number;
  months: TimelineMonth[];
}

const router = useRouter();
const posts = ref<Forum[]>([]);
const loading = ref(true);
const error = ref('');
const backgroundUrl = ref('');

const timelineYears = computed<TimelineYear[]>(() => {
  const map = new Map<number, Map<number, Map<number, number>>>();
  for (const post of posts.value) {
    const d = new Date(post.创建时间);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    if (!map.has(y)) map.set(y, new Map());
    const monthMap = map.get(y)!;
    if (!monthMap.has(m)) monthMap.set(m, new Map());
    const dayMap = monthMap.get(m)!;
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }
  const years: TimelineYear[] = [];
  for (const [year, monthMap] of [...map.entries()].sort((a, b) => b[0] - a[0])) {
    const months: TimelineMonth[] = [];
    for (const [month, dayMap] of [...monthMap.entries()].sort((a, b) => b[0] - a[0])) {
      const days: TimelineDay[] = [];
      for (const [day, count] of [...dayMap.entries()].sort((a, b) => b[0] - a[0])) {
        days.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          day,
          count,
        });
      }
      months.push({ month, days });
    }
    years.push({ year, months });
  }
  return years;
});

const scrollToDate = (dateStr: string) => {
  const el = document.querySelector(`[data-date="${dateStr}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDate = (timeStr: string): string => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function getTagName(tag: unknown): string {
  return typeof tag === 'string' ? tag : ((tag as Record<string, unknown>)?.名称 as string) || '';
}

const goToPost = (post: Forum) => {
  const id = post.id || post.标题;
  if (id) router.push(`/forum/${encodeURIComponent(String(id))}`);
};

onMounted(async () => {
  loading.value = true;
  try {
    const bgData = await getBackgrounds('时间轴') as { url: string };
    if (bgData?.url) backgroundUrl.value = bgData.url;
  } catch { /* ignore */ }
  try {
    const data = await getForumPosts();
    const all = data as unknown as Forum[];
    posts.value = all
      .filter(p => p.用户信息?.账号 === '三段荒')
      .sort((a, b) => new Date(b.创建时间).getTime() - new Date(a.创建时间).getTime());
  } catch {
    error.value = '获取失败，请稍后重试';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.timeline-page {
  min-height: 100vh;
  position: relative;
}

.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #1a1a2e;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

.page-hero {
  height: 40vh;
  min-height: 280px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-title {
  font-size: 3em;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
  letter-spacing: 4px;
}

.title-red {
  color: #e74c3c;
  font-size: 1.4em;
}

.title-rest {
  font-size: 0.75em;
  position: relative;
  top: -0.15em;
}

.page-body {
  position: relative;
  z-index: 1;
  padding: 40px 16px 60px;
  background: rgba(18,18,40,0.88);
  min-height: 50vh;
}

.timeline-layout {
  display: flex;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

.tl-sidebar {
  position: sticky;
  top: 80px;
  width: 160px;
  flex-shrink: 0;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
}

.tl-sidebar::-webkit-scrollbar {
  width: 3px;
}

.tl-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.tl-directory {
  position: relative;
  padding-left: 16px;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
}

.dir-year {
  margin-bottom: 16px;
}

.dir-year-label {
  font-size: 15px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 6px;
  position: relative;
}

.dir-year-label::before {
  content: '';
  position: absolute;
  left: -22px;
  top: 50%;
  width: 10px;
  height: 10px;
  margin-top: -5px;
  border-radius: 50%;
  background: #e74c3c;
  border: 2px solid #1a1a2e;
}

.dir-month {
  padding-left: 14px;
  margin-bottom: 6px;
  position: relative;
}

.dir-month-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 2px;
  position: relative;
  cursor: default;
}

.dir-month-label::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 6px;
  height: 6px;
  margin-top: -3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
}

.dir-day {
  padding: 3px 8px 3px 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  position: relative;
}

.dir-day::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 4px;
  height: 4px;
  margin-top: -2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.dir-day:hover {
  color: #f7971e;
  background: rgba(255, 255, 255, 0.06);
}

.dir-day:hover::before {
  background: #f7971e;
}

.dir-count {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.06);
  padding: 0 5px;
  border-radius: 8px;
  line-height: 16px;
}

.dir-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  padding: 20px 0;
  text-align: center;
}

.content-wrap {
  flex: 1;
  min-width: 0;
}

/* ── 时间轴容器 ── */
.tl-container {
  position: relative;
  padding: 20px 0;
}

/* 中间竖线（虚线） */
.tl-container::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.2) 0px,
    rgba(255,255,255,0.2) 6px,
    transparent 6px,
    transparent 12px
  );
}

/* ── 每一行 ── */
.tl-row {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  position: relative;
}

.tl-row.right {
  flex-direction: row-reverse;
}

/* ── 圆点（中轴线上） ── */
.tl-row::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 28px;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: #e74c3c;
  border: 3px solid #1a1a2e;
  box-shadow: 0 0 0 2px #e74c3c;
  z-index: 2;
}

/* ── 卡片（只有封面） ── */
.tl-card {
  width: 180px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.25s;
  position: relative;
}

.tl-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.tl-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.25);
}

.tl-card:hover img {
  transform: scale(1.06);
}

/* 连接线：卡片到中轴线 */
.tl-card::after {
  content: '';
  position: absolute;
  top: 50%;
  height: 2px;
  background: rgba(255,255,255,0.15);
}

.tl-row .tl-card::after {
  right: -24px;
  width: 24px;
}

.tl-row.right .tl-card::after {
  left: -24px;
  width: 24px;
}

/* ── 文字信息区 ── */
.tl-info {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tl-info:hover {
  opacity: 0.8;
}

.tl-row .tl-info {
  padding-left: 28px;
  padding-right: 40px;
  text-align: left;
}

.tl-row.right .tl-info {
  padding-right: 28px;
  padding-left: 40px;
  text-align: right;
}

.tl-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tl-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.tl-row.right .tl-tags {
  justify-content: flex-end;
}

.tl-tag {
  padding: 2px 10px;
  font-size: 11px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.12);
}

.tl-date {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
}

/* ── 序号（中轴线上方） ── */
.tl-num {
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  font-weight: 600;
  z-index: 1;
}

/* ── 状态 ── */
.state-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #e74c3c;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .page-hero {
    height: 30vh;
    min-height: 200px;
  }
  .hero-title { font-size: 2.2em; }

  .timeline-layout {
    flex-direction: column;
  }

  .tl-sidebar {
    position: static;
    width: 100%;
    max-height: none;
    overflow-y: visible;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tl-directory {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    border-left: none;
    padding-left: 0;
  }

  .dir-year {
    margin-bottom: 0;
  }

  .dir-year-label::before,
  .dir-month-label::before,
  .dir-day::before {
    display: none;
  }

  .tl-container::before {
    left: 24px;
  }

  .tl-row::before {
    left: 24px;
    margin-left: -7px;
  }

  .tl-num {
    left: 24px;
    transform: translateX(-50%);
    top: -18px;
  }

  .tl-row,
  .tl-row.right {
    flex-direction: row;
    padding-left: 56px;
  }

  .tl-card {
    width: 100px;
    height: 80px;
    flex-shrink: 0;
  }

  .tl-card::after {
    right: -14px !important;
    left: auto !important;
    width: 14px !important;
  }

  .tl-row .tl-info {
    padding-left: 20px !important;
    padding-right: 0 !important;
    text-align: left !important;
  }

  .tl-row.right .tl-tags {
    justify-content: flex-start;
  }
}
</style>
