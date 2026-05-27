<template>
  <div class="website-page">
    <!-- 顶部：半高背景区 -->
    <div class="website-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">网站</span><span class="title-rest">推荐</span>
        </h1>
        <p class="hero-subtitle">收录实用的网站与工具</p>
      </div>
    </div>

    <!-- 底部：内容区 -->
    <div class="content-wrapper" :style="{ backgroundImage: `url(https://free.picui.cn/free/2026/05/25/6a13a4c5aa38f.png)` }">
        <div v-if="loading" class="loading-state">加载中...</div>

        <div v-else-if="groupedWebsites.length === 0" class="empty-state">暂无网站推荐</div>

        <div v-else class="website-body">
          <!-- 分类目录 -->
          <div class="category-directory">
            <div class="directory-title">分类</div>
            <div
              v-for="group in groupedWebsites"
              :key="'dir-' + group.category"
              class="directory-item"
              :class="{ active: activeCategory === group.category }"
              @click="scrollToCategory(group.category)"
            >
              <span class="dir-dot"></span>
              <span class="dir-name">{{ group.category }}</span>
              <span class="dir-count">{{ group.sites.length }}</span>
            </div>
          </div>

          <!-- 滚动内容 -->
          <div class="website-scroll" ref="scrollRef" @scroll="onScroll">
          <div
            v-for="group in groupedWebsites"
            :key="group.category"
            :id="'cat-' + group.category"
            class="category-section"
            :ref="el => setSectionRef(group.category, el as HTMLElement | null)"
          >
          <div class="category-header">
            <h2 class="category-title">{{ group.category }} <span class="header-line"></span> <span class="category-count">{{ group.sites.length }} 个</span></h2>
          </div>
          <div class="website-grid">
            <a
              v-for="site in group.sites"
              :key="site.id"
              :href="site.网站url"
              target="_blank"
              rel="noopener noreferrer"
              class="website-card"
            >
              <div class="card-icon-wrap">
                <img
                  v-if="site.图标"
                  :src="site.图标"
                  class="card-icon"
                  alt=""
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <template v-else>
                  <img
                    :src="'https://www.google.com/s2/favicons?domain=' + getDomain(site.网站url) + '&sz=64'"
                    class="card-icon"
                    alt=""
                    @error="onIconError"
                  />
                </template>
                <span class="card-fallback">{{ site.名字?.charAt(0) || '?' }}</span>
              </div>
              <div class="card-name">{{ site.名字 }}</div>
              <div class="card-desc">{{ site.介绍 }}</div>
              <button
                v-if="userStore.isAdmin"
                class="delete-btn"
                @click.prevent="deleteSite(site)"
                title="删除"
              >×</button>
            </a>
            <div
              v-if="userStore.isAdmin"
              class="website-card add-card"
              @click="showAddDialog = true"
            >
              <div class="add-icon">+</div>
              <div class="card-name" style="color:#667eea">添加网站</div>
              <div class="card-desc">点击添加新的推荐网站</div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>

    <!-- 添加网站弹窗 -->
    <el-dialog title="添加网站" v-model="showAddDialog" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="网站名称">
          <el-input v-model="addForm.名字" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站URL">
          <el-input v-model="addForm.网站url" placeholder="https://...">
            <template #append>
              <el-button @click="autoFetchIcon" :disabled="!addForm.网站url.trim()">获取图标</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="图标URL">
          <el-input v-model="addForm.图标" placeholder="点击右侧「获取图标」自动填充" />
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="addForm.介绍" type="textarea" :rows="3" placeholder="简短介绍" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="addForm.所属分类" placeholder="如：工具、博客、设计..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addSite" :loading="adding">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { query, insert, deleteData } from '@/api/data';
import { useUserStore } from '@/stores/user';
interface Website {
  id: number;
  名字: string;
  图标: string;
  网站url: string;
  介绍: string;
  所属分类: string;
}

const userStore = useUserStore();
const backgroundUrl = ref('https://free.picui.cn/free/2026/05/22/6a0fdf484a47c.png');
const websites = ref<Website[]>([]);
const loading = ref(true);
const showAddDialog = ref(false);
const adding = ref(false);
const addForm = ref({ 名字: '', 网站url: '', 图标: '', 介绍: '', 所属分类: '' });

const getDomain = (url: string) => {
  try { return new URL(url).hostname; } catch { return url; }
};

const autoFetchIcon = () => {
  const url = addForm.value.网站url.trim();
  if (!url) return;
  const domain = getDomain(url);
  addForm.value.图标 = '';
  ElMessage.info('正在获取图标...');

  const sources = [
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://api.qqsuu.cn/api/favicon?url=${domain}`,
  ];

  let settled = false;

  for (const iconUrl of sources) {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; }, 2000);
    img.onload = () => {
      if (settled) return;
      clearTimeout(timer);
      settled = true;
      addForm.value.图标 = iconUrl;
      ElMessage.success('已自动获取图标');
    };
    img.onerror = () => clearTimeout(timer);
    img.src = iconUrl;
  }

  // 2.5 秒后备
  setTimeout(() => {
    if (!settled) {
      settled = true;
      addForm.value.图标 = sources[0];
      ElMessage.success('已自动获取图标（可能不可用）');
    }
  }, 2500);
};

const onIconError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
  const wrap = img.closest('.card-icon-wrap') as HTMLElement;
  if (wrap) {
    const fb = wrap.querySelector('.card-fallback') as HTMLElement;
    if (fb) fb.style.display = 'flex';
  }
};

// Cover Flow 滚动效果（按分类区块）
const scrollRef = ref<HTMLElement | null>(null);
const sectionRefs = new Map<string, HTMLElement>();
const activeCategory = ref('');

const setSectionRef = (category: string, el: HTMLElement | null) => {
  if (el) sectionRefs.set(category, el);
  else sectionRefs.delete(category);
};

const scrollToCategory = (category: string) => {
  const el = document.getElementById('cat-' + category);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const onScroll = () => {
  const container = scrollRef.value;
  if (!container) return;
  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.top + containerRect.height / 2;

  let closestCategory = '';
  let closestDist = Infinity;

  sectionRefs.forEach((el, category) => {
    const rect = el.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const dist = Math.abs(sectionCenter - centerY);

    if (dist < closestDist) {
      closestDist = dist;
      closestCategory = category;
    }
  });

  activeCategory.value = closestCategory;
};

const groupedWebsites = computed(() => {
  const map = new Map<string, Website[]>();
  websites.value.forEach(s => {
    const cat = s.所属分类 || '其他';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(s);
  });
  return Array.from(map.entries()).map(([category, sites]) => ({ category, sites }));
});

const fetchWebsites = async () => {
  loading.value = true;
  try {
    const res = await query({ table: '网站推荐', uniqueId: 'user_1779243581625437300' });
    if (res.success) websites.value = res.data as Website[];
  } catch (e) {
    console.error('获取网站失败:', e);
  } finally {
    loading.value = false;
  }
};

const addSite = async () => {
  if (!addForm.value.名字 || !addForm.value.网站url) {
    ElMessage.error('网站名称和URL不能为空');
    return;
  }
  adding.value = true;
  try {
    await insert({
      table: '网站推荐',
      data: { ...addForm.value },
      uniqueId: userStore.userInfo?.uniqueId || 'user_1779243581625437300',
    });
    ElMessage.success('添加成功');
    showAddDialog.value = false;
    addForm.value = { 名字: '', 网站url: '', 图标: '', 介绍: '', 所属分类: '' };
    await fetchWebsites();
  } catch (e) {
    ElMessage.error('添加失败');
  } finally {
    adding.value = false;
  }
};

const deleteSite = async (site: Website) => {
  try {
    await deleteData({
      table: '网站推荐',
      where: `id = ${site.id}`,
      uniqueId: userStore.userInfo?.uniqueId || 'user_1779243581625437300',
    });
    ElMessage.success('删除成功');
    await fetchWebsites();
  } catch (e) {
    ElMessage.error('删除失败');
  }
};

onMounted(async () => {
  await userStore.loadUserInfo();
  await fetchWebsites();
  await nextTick();
  setTimeout(() => onScroll(), 100);
});
</script>

<style scoped>
/* ── 全局动画 ── */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ── 页面整体 ── */
.website-page {
  height: 100vh;
  padding-top: 60px;
  background: #0d0d0d;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── 顶部半高背景区 ── */
.website-hero {
  height: 40vh;
  min-height: 280px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a1a2e;
  flex-shrink: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: left;
  padding: 0 40px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.4em;
  font-weight: bold;
  margin: 0;
}

.hero-title .title-red,
.hero-title .title-rest {
  display: inline-block;
}

.hero-title .title-red {
  animation: heroBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both,
             glowPulse 2s ease-in-out 0.6s infinite;
  color: #e74c3c;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
  font-size: 1.4em;
  line-height: 1;
}

.hero-title .title-rest {
  animation: heroBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-size: 0.75em;
  position: relative;
  top: -0.3em;
  line-height: 1;
}

.hero-title .title-rest::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 3px;
  background: #e74c3c;
  border-radius: 2px;
  animation: titleLinePulse 2s ease-in-out infinite alternate;
}

@keyframes titleLinePulse {
  0% { width: 60%; left: 20%; }
  100% { width: 100%; left: 0; }
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-top: 12px;
  font-size: 1.1em;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

@keyframes heroBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-20px);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) translateY(2px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes glowPulse {
  0%, 100% { text-shadow: 0 0 20px rgba(231, 76, 60, 0.5); }
  50% { text-shadow: 0 0 40px rgba(231, 76, 60, 0.8), 0 0 60px rgba(231, 76, 60, 0.3); }
}


/* ── 底部内容区 ── */
.content-wrapper {
  background-size: cover;
  background-position: center 30%;
  background-repeat: no-repeat;
  padding: 24px;
  position: relative;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-width: 1200px;
  width: 100%;
  margin: -40px auto 20px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 16px;
  pointer-events: none;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
  position: relative;
  z-index: 1;
}

.admin-bar {
  text-align: right;
  margin-bottom: 20px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.category-section {
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.category-header {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 14px;
  gap: 6px;
}

.category-title {
  font-size: 1.6em;
  color: #fff;
  margin: 0;
  font-weight: 600;
  align-self: flex-start;
}

.category-header::after {
  content: '';
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #667eea, transparent);
  border-radius: 1px;
}

.header-line {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #667eea;
  border-radius: 1px;
  vertical-align: middle;
  margin: 0 2px;
}

.category-count {
  font-size: 0.8em;
  color: #888;
  font-weight: 400;
}

.add-card {
  cursor: pointer !important;
  justify-content: center;
  border: 2px dashed #555 !important;
  background: rgba(102, 126, 234, 0.05) !important;
}

.add-card:hover {
  border-color: #667eea !important;
  background: rgba(102, 126, 234, 0.1) !important;
}

.add-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(102, 126, 234, 0.15);
  color: #8899ff;
  font-size: 28px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}

.website-body {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.website-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
}

.website-scroll > .category-section {
  scroll-snap-align: start;
}

.category-section {
  transition: opacity 0.3s ease;
}

/* ── 分类目录 ── */
.category-directory {
  width: 120px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.directory-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 10px;
  padding-left: 4px;
  letter-spacing: 2px;
}

.directory-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.directory-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.directory-item.active {
  background: rgba(231, 76, 60, 0.15);
}

.dir-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  transition: all 0.2s;
}

.directory-item.active .dir-dot {
  background: #e74c3c;
  box-shadow: 0 0 6px rgba(231, 76, 60, 0.5);
}

.dir-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.directory-item.active .dir-name {
  color: #fff;
}

.dir-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.website-scroll::-webkit-scrollbar {
  width: 6px;
}

.website-scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
}

.website-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.website-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

.website-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  padding-left: 0;
}

.category-section {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  margin-bottom: 20px;
}

.website-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 0 10px;
  background: rgba(42, 42, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  text-align: center;
  overflow: hidden;
}

.website-card:hover {
  border-color: #667eea;
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35);
  transform: translateY(-6px);
}

.card-icon-wrap {
  width: calc(100% - 16px);
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border-radius: 10px;
  margin: 8px 8px 0;
}

.card-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px 12px;
}

.card-fallback {
  display: none;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  color: #8899ff;
  background: rgba(102, 126, 234, 0.15);
  position: absolute;
  top: 0;
  left: 0;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  line-height: 1.3;
  padding: 0 8px;
  position: relative;
  display: inline-block;
}

.website-card:hover .card-name::after {
  width: 100%;
}

.card-name::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #667eea;
  border-radius: 1px;
  transition: width 0.3s ease;
}

.card-desc {
  font-size: 11px;
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  line-height: 1.3;
  min-height: 0;
  padding: 0 8px;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(255,255,255,0.08);
  border-radius: 50%;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.website-card:hover .delete-btn {
  display: flex;
}

.delete-btn:hover {
  background: #ff4d4f;
  color: #fff;
}
</style>

<style>
/* 覆盖全局白色背景 */
body {
  background: #0d0d0d !important;
}
</style>
