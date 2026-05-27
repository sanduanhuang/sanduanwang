<template>
  <div class="forum-page">
    <!-- 固定背景层 -->
    <div class="forum-bg" :style="{ backgroundImage: `url(${backgroundUrl})` }"></div>

    <!-- 顶部：半高背景区 -->
    <div class="forum-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">荒</span><span class="title-rest">的论坛</span>
        </h1>
        <el-input
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索帖子（按标题或标签）"
          clearable
          :prefix-icon="Search"
        />
      </div>
    </div>

    <!-- 底部：内容区 -->
    <div class="forum-body">
      <div class="forum-layout">
        <!-- 左侧：作者信息 -->
        <div class="forum-leftside">
          <el-card class="author-card">
            <div class="author-info-card">
              <img src="https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg" alt="作者头像" class="author-avatar" />
              <div class="author-name">三段荒</div>
              <div class="author-desc">一个热爱编程的开发者</div>
              <div class="author-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ articleCount }}</span>
                  <span class="stat-label">文章</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ visitCount }}</span>
                  <span class="stat-label">访问</span>
                </div>
              </div>
              <div class="author-contacts">
                <a class="contact-item" href="https://space.bilibili.com/153285755" target="_blank" title="B站">
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.562 3.76v7.36c-.038 1.51-.558 2.765-1.562 3.76s-2.263 1.52-3.773 1.574H5.333c-1.51-.054-2.769-.578-3.773-1.574C.556 20.111.036 18.857 0 17.348v-7.36c.036-1.511.556-2.765 1.562-3.76 1.004-.996 2.263-1.52 3.773-1.574h.854l-.107-.32a2.65 2.65 0 01.235-2.275 2.65 2.65 0 012.066-1.28c1.025.051 1.864.49 2.517 1.323l.32.427.107.213.533.853.533-.853.107-.213.32-.427c.653-.832 1.492-1.272 2.517-1.323a2.65 2.65 0 012.066 1.28c.405.663.491 1.397.256 2.203l-.107.32zM7.68 12.053c-.512 0-.939.172-1.28.512s-.512.768-.512 1.28c0 .512.171.94.512 1.28.341.341.768.512 1.28.512s.939-.171 1.28-.512.512-.768.512-1.28c0-.512-.171-.939-.512-1.28a1.745 1.745 0 00-1.28-.512zm8.64 0c-.512 0-.939.172-1.28.512s-.512.768-.512 1.28c0 .512.171.94.512 1.28.341.341.768.512 1.28.512s.939-.171 1.28-.512.512-.768.512-1.28c0-.512-.171-.939-.512-1.28a1.745 1.745 0 00-1.28-.512z"/></svg>
                  <span>B站</span>
                </a>
                <a class="contact-item" href="tencent://message/?uin=392935754" target="_blank" title="QQ">
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M22.95 6.87c.12.6.1 1.26-.05 1.95l-.5 2.6c-.35 1.4-.77 2.6-1.27 3.6-.5 1-1.07 1.75-1.7 2.25-.63.5-1.33.8-2.1.9l.55 1.5c.15.45.23.9.25 1.35.02.45-.02.85-.13 1.2-.11.35-.27.6-.5.75-.23.15-.5.2-.8.15-.3-.05-.55-.2-.75-.45l-1.3-2.7c-.6.1-1.15.15-1.65.15-.5 0-1.05-.05-1.65-.15l-1.3 2.7c-.2.25-.45.4-.75.45-.3.05-.57 0-.8-.15-.23-.15-.39-.4-.5-.75-.11-.35-.15-.75-.13-1.2.02-.45.1-.9.25-1.35l.55-1.5c-.77-.1-1.47-.4-2.1-.9-.63-.5-1.2-1.25-1.7-2.25-.5-1-.92-2.2-1.27-3.6l-.5-2.6c-.15-.69-.17-1.35-.05-1.95.12-.6.35-1.1.7-1.5.35-.4.8-.65 1.35-.75.55-.1 1.15.05 1.8.45.1-.45.4-.85.9-1.2.5-.35 1.1-.55 1.8-.6.7-.05 1.4.05 2.1.3.7.25 1.25.6 1.65 1.05.4-.45.95-.8 1.65-1.05.7-.25 1.4-.35 2.1-.3.7.05 1.3.25 1.8.6.5.35.8.75.9 1.2.65-.4 1.25-.55 1.8-.45.55.1 1 .35 1.35.75.35.4.58.9.7 1.5z"/></svg>
                  <span>QQ</span>
                </a>
                <a class="contact-item" href="weixin://" title="微信: mingyun33233" onclick="alert('微信号: mingyun33233')">
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zM13.78 2.188c2.898 0 5.31 1.324 6.766 3.227 1.19 1.552 1.828 3.416 1.828 5.216 0 2.484-1.394 4.72-3.573 6.187a.55.55 0 00-.264.648l.3 1.128a.582.582 0 01-.043.489.409.409 0 01-.36.214.424.424 0 01-.21-.067l-1.446-.847a.806.806 0 00-.666-.076 9.332 9.332 0 01-2.358.33c-.295 0-.58-.02-.862-.047.691-2.108.166-4.087-1.25-5.35-1.18-1.057-2.745-1.523-4.182-1.474-.258.008-.513.032-.763.068.468-3.148 3.244-5.635 6.676-5.635z"/></svg>
                  <span>微信</span>
                </a>
              </div>
            </div>
          </el-card>
          <Sponsor />

          <!-- 标签区域 -->
          <el-card class="tags-card">
            <template #header>
              <span>帖子标签</span>
            </template>
            <div v-if="tagsLoading" class="sidebar-loading">
              <el-loading :text="'加载中...'" />
            </div>
            <div v-else class="tags-list">
              <span
                v-for="tag in forumTags"
                :key="tag.名称"
                class="tag-chip"
                :style="{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: tag.代表颜色 || '#667eea' }"
                @click="searchByTag(tag.名称)"
              >
                {{ tag.名称 }}
              </span>
            </div>
          </el-card>

          <!-- 最近登录用户 -->
          <el-card class="user-card">
            <template #header>
              <span>最近登录用户</span>
            </template>
            <div v-if="usersLoading" class="sidebar-loading">
              <el-loading :text="'加载中...'" />
            </div>
            <div v-else class="user-list">
              <div
                class="user-item"
                v-for="user in userList"
                :key="user.账号"
              >
                <img
                  v-if="user.头像"
                  :src="user.头像"
                  class="user-avatar"
                  alt="用户头像"
                />
                <div class="user-name">{{ user.用户名 || user.账号 }}</div>
              </div>
            </div>
          </el-card>
        </div>
        <!-- 中间：帖子列表（分栏） -->
        <div class="forum-main">
          <div v-if="loading" class="loading-state">
            <el-loading :text="'加载中...'" />
          </div>
          <div v-else-if="error" class="error-state">
            <el-empty :description="error" />
          </div>
          <template v-else-if="filteredPosts.length === 0">
            <div class="section-title">
              <span class="section-title-line"></span>
              <span class="section-title-text">{{ searchQuery.trim() ? '搜索结果' : '帖子列表' }}</span>
              <span class="section-title-line"></span>
            </div>
            <div class="post-list-bg">
              <el-empty :description="searchQuery.trim() ? '没有找到相关帖子' : '暂无帖子，快去发布第一篇帖子吧！'" />
            </div>
          </template>
          <!-- 搜索模式：扁平列表 -->
          <template v-else-if="searchQuery.trim()">
            <div class="section-title">
              <span class="section-title-line"></span>
              <span class="section-title-text">搜索结果</span>
              <span class="section-title-line"></span>
            </div>
            <div class="post-list-bg">
              <div class="post-list">
                <PostCard
                  v-for="post in filteredPosts"
                  :key="post.id || post.标题"
                  :post="post"
                  @click="goToPostDetail(post)"
                />
              </div>
            </div>
          </template>

          <!-- 区域筛选模式：类似搜索的扁平列表 -->
          <template v-else-if="sectionFilter">
            <div class="section-filter-header">
              <span class="back-link" @click="clearSectionFilter">← 返回全部</span>
              <span class="section-filter-title">{{ sectionFilterTitle }}</span>
            </div>
            <div class="post-list-bg">
              <div class="post-list">
                <PostCard
                  v-for="post in sectionFilterPosts"
                  :key="post.id || post.标题"
                  :post="post"
                  @click="goToPostDetail(post)"
                />
              </div>
            </div>
          </template>

          <!-- 浏览模式：分区列表 -->
          <template v-else>
            <div class="section-block">
              <div class="section-title">
                <span class="section-title-line"></span>
                <span class="section-title-text">最新帖子</span>
                <span class="section-title-line"></span>
              </div>
              <div class="post-list-bg">
                <div class="post-list">
                  <template v-for="i in maxPerSection" :key="'latest-' + i">
                    <PostCard
                      v-if="latestPosts[i - 1]"
                      :post="latestPosts[i - 1]"
                      @click="goToPostDetail(latestPosts[i - 1])"
                    />
                    <div v-else class="post-skeleton">
                      <div class="skeleton-cover"></div>
                      <div class="skeleton-body">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-tags">
                          <div class="skeleton-tag"></div>
                          <div class="skeleton-tag"></div>
                        </div>
                        <div class="skeleton-meta">
                          <div class="skeleton-avatar"></div>
                          <div class="skeleton-name"></div>
                          <div class="skeleton-views"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div
              v-for="section in categorySections"
              :key="section.name"
              class="section-block"
            >
              <div class="section-title">
                <span class="section-title-line"></span>
                <span class="section-title-text">{{ section.name }}</span>
                <span class="section-title-line"></span>
              </div>
              <div class="post-list-bg">
                <div class="post-list">
                  <template v-for="i in maxPerSection" :key="'cat-' + section.name + '-' + i">
                    <PostCard
                      v-if="section.posts[i - 1]"
                      :post="section.posts[i - 1]"
                      @click="goToPostDetail(section.posts[i - 1])"
                    />
                    <div v-else class="post-skeleton">
                      <div class="skeleton-cover"></div>
                      <div class="skeleton-body">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-tags">
                          <div class="skeleton-tag"></div>
                          <div class="skeleton-tag"></div>
                        </div>
                        <div class="skeleton-meta">
                          <div class="skeleton-avatar"></div>
                          <div class="skeleton-name"></div>
                          <div class="skeleton-views"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="view-more-row" @click="showSection(section.name)">
                  <span class="view-more-link">查看更多 →</span>
                </div>
              </div>
            </div>
          </template>
        </div>
        <!-- 右侧：用户信息 -->
        <div class="forum-sidebar" ref="sidebarRef" style="display:none">
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, inject } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import Sponsor from "@/components/Sponsor.vue";
import PostCard from "@/components/PostCard.vue";
import { getBackgrounds, getForumPosts, getUser, getForumTags, increaseForumView } from "@/api/data";
import type { Forum, User, ForumTag } from "@/types";

const router = useRouter();
const showToast = inject('showToast') as (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
const backgroundUrl = ref<string>("");
const posts = ref<Forum[]>([]);
const loading = ref(true);
const error = ref("");
const userList = ref<User[]>([]);
const usersLoading = ref(true);
const forumTags = ref<ForumTag[]>([]);
const tagsLoading = ref(true);
const searchQuery = ref("");
const sidebarRef = ref<HTMLElement | null>(null);
const postListBgRef = ref<HTMLElement | null>(null);
const articleCount = ref(0);
const visitCount = ref('0');
const maxPerSection = ref(4);
const sectionFilter = ref<string>('');

const sectionFilterTitle = computed(() => {
  const map: Record<string, string> = {
    latest: '最新帖子',
  };
  return map[sectionFilter.value] || sectionFilter.value;
});

const sectionFilterPosts = computed(() => {
  const filter = sectionFilter.value;
  if (!filter) return [];
  if (filter === 'latest') return latestPosts.value;
  const catSection = categorySections.value.find(s => s.name === filter);
  return catSection ? catSection.posts : [];
});

const showSection = (key: string) => {
  searchQuery.value = '';
  sectionFilter.value = key;
};

const clearSectionFilter = () => {
  sectionFilter.value = '';
};

// 根据搜索关键词过滤帖子
const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return posts.value;
  return posts.value.filter((post) => {
    const title = (post.标题 as string || "").toLowerCase();
    const tags = post.标签 as Array<{ 名称?: string } | string> | undefined;
    const tagNames = tags
      ? tags.map((t) => (typeof t === "string" ? t : t.名称 || "").toLowerCase())
      : [];
    return title.includes(query) || tagNames.some((tag) => tag.includes(query));
  });
});

// 最新帖子（按时间排序）
const latestPosts = computed(() => {
  return [...filteredPosts.value].sort(
    (a, b) => new Date(b.创建时间).getTime() - new Date(a.创建时间).getTime()
  );
});

// 固定分类列表
const FIXED_CATEGORIES = ['技术讨论', '生活分享', '求助问答', '其他'];

// 按分类分组的帖子
const categorySections = computed(() => {
  const categoryMap = new Map<string, Forum[]>();

  // 初始化所有固定分类
  for (const cat of FIXED_CATEGORIES) {
    categoryMap.set(cat, []);
  }

  // 从帖子中收集分类
  const postsForCategory = filteredPosts.value;

  for (const post of postsForCategory) {
    const category = post.分类 || '其他';
    if (categoryMap.has(category)) {
      categoryMap.get(category)!.push(post);
    }
  }

  return FIXED_CATEGORIES.map((name) => ({
    name,
    posts: (categoryMap.get(name) || []).sort(
      (a, b) => new Date(b.创建时间).getTime() - new Date(a.创建时间).getTime()
    )
  }));
});

// 去除HTML标签，只保留纯文本
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const formatTime = (timeStr: string): string => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

function getTagName(tag: unknown): string {
  return typeof tag === "string" ? tag : (tag as Record<string, unknown>)?.名称 as string || "";
}

function getTagColor(tag: unknown): string {
  return (tag as Record<string, unknown>)?.代表颜色 as string || "#667eea";
}

// 点击标签搜索
const searchByTag = (tagName: string) => {
  searchQuery.value = tagName;
};

// 同步左右高度
const syncHeight = async () => {
  await nextTick();
  if (sidebarRef.value && postListBgRef.value) {
    postListBgRef.value.style.minHeight = `${sidebarRef.value.offsetHeight}px`;
  }
};

// 点击帖子跳转到详情页
const goToPostDetail = (post: Forum) => {
  const postId = post.id || post.标题;
  if (postId) {
    showToast('正在跳转...', 'info');
    router.push(`/forum/${encodeURIComponent(String(postId))}`);
  } else {
    showToast('帖子ID为空，无法跳转', 'error');
  }
};

// 单独暴露给模板使用
const navigateToPost = (post: Forum) => goToPostDetail(post);

onMounted(async () => {
  loading.value = true;
  error.value = "";

  // 并行发起所有请求
  await Promise.all([
    (async () => {
      try {
        const bgData = await getBackgrounds("论坛") as { url: string };
        if (bgData && bgData.url) {
          backgroundUrl.value = bgData.url;
        }
      } catch {
        console.log("获取背景图失败");
      }
    })(),
    (async () => {
      try {
        const forumData = await getForumPosts();
        posts.value = forumData as unknown as Forum[];
        // 统计全部帖子的总数
        articleCount.value = posts.value.length;
        const totalVisits = posts.value.reduce((sum, p) => sum + (Number(p.阅读) || 0), 0);
        visitCount.value = totalVisits >= 1000 ? (totalVisits / 1000).toFixed(1) + 'k' : String(totalVisits);
      } catch (err) {
        console.error("获取论坛帖子失败:", err);
        error.value = "获取帖子失败，请稍后重试";
      } finally {
        loading.value = false;
      }
    })(),
    (async () => {
      try {
        const usersData = await getUser();
        userList.value = usersData as User[];
      } catch (err) {
        console.error("获取用户列表失败:", err);
      } finally {
        usersLoading.value = false;
      }
    })(),
    (async () => {
      try {
        const tagsData = await getForumTags();
        forumTags.value = tagsData;
      } catch (err) {
        console.error("获取标签失败:", err);
      } finally {
        tagsLoading.value = false;
      }
    })(),
  ]);

  syncHeight();
});
</script>

<style scoped>
/* ── 页面容器 ── */
.forum-page {
  min-height: 100vh;
  position: relative;
}

/* ── 顶部半高背景区 ── */
.forum-hero {
  height: 50vh;
  min-height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 创建独立合成层，减少重绘 */
  will-change: transform;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 20px;
  width: 100%;
  max-width: 600px;
}

.hero-title {
  font-size: 3em;
  font-weight: 700;
  color: #fff;
  margin: 0 0 24px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: 4px;
}

.title-red {
  color: #e74c3c;
  font-size: 1.4em;
  display: inline-block;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

.title-rest {
  font-size: 0.75em;
  display: inline-block;
  position: relative;
  top: -0.15em;
}

.title-rest::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 3px;
  background: #000;
  border-radius: 2px;
  animation: linePulse 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 8px rgba(231, 76, 60, 0.4);
  }
  100% {
    text-shadow: 0 0 20px rgba(231, 76, 60, 0.8), 0 0 40px rgba(231, 76, 60, 0.3);
  }
}

@keyframes linePulse {
  0% {
    width: 60%;
    left: 20%;
  }
  100% {
    width: 100%;
    left: 0;
  }
}

/* 使用 GPU 加速动画 */
.title-red {
  will-change: text-shadow;
}

.title-rest::after {
  will-change: width, left;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.96) !important;
}

.search-input :deep(.el-input__inner) {
  font-size: 15px;
}

/* ── 固定背景层 ── */
.forum-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #1a1a2e;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  /* 固定背景层独立合成，减少滚动时重绘 */
  will-change: transform;
}

/* ── 底部内容区 ── */
.forum-body {
  position: relative;
  z-index: 1;
  padding: 32px 10px 60px;
  min-height: 50vh;
  border-top: 2px solid rgba(231, 76, 60, 0.5);
  /* 用纯色替代半透明叠加层 + backdrop-filter 组合，大幅减少重绘 */
  background: rgba(18, 18, 40, 0.88);
  box-shadow: inset 0 8px 20px rgba(231, 76, 60, 0.08);
  outline: 3px solid rgba(255, 255, 255, 0.1);
  outline-offset: -3px;
}

.forum-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: stretch;
  position: relative;
  z-index: 2;
}

.forum-leftside {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.forum-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.author-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  color: #fff !important;
}

.author-card :deep(.el-card__body) {
  padding: 20px 16px !important;
}

.author-info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.2);
}

.author-name {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.author-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: -4px;
}

.author-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 10px;
  margin-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.08);
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.author-contacts {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.08);
  width: 100%;
}

.contact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 10px;
  transition: all 0.2s;
}

.contact-item:hover {
  color: #fff;
  transform: translateY(-2px);
}

.contact-icon {
  width: 22px;
  height: 22px;
}

.forum-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}

/* ── 分区块 ── */
.section-block {
  margin-bottom: 32px;
}

.section-block:last-child {
  margin-bottom: 0;
}

/* ── 区域标题 ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.section-title-text {
  font-size: 1em;
  font-weight: 600;
  color: #f7971e;
  white-space: nowrap;
  letter-spacing: 2px;
  /* 用静态颜色替代 background-clip 动画，大幅减少重绘 */
}

.section-title-text::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #f7971e;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  animation: titleDot 1.5s ease-in-out infinite;
}

@keyframes titleDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.6; }
}



/* ── 帖子滚动容器 ── */
.post-list-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.post-list-bg {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px 16px 0 0;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
}

.post-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  min-height: 0;
}

.post-list-wrapper::-webkit-scrollbar {
  width: 5px;
}

.post-list-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.post-list-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.post-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* ── 帖子网格 ── */
.post-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* ── 骨架屏占位卡片 ── */
.post-skeleton {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  overflow: hidden;
  border: 1px dashed rgba(255, 255, 255, 0.08);
}

.skeleton-cover {
  width: 100%;
  height: 120px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-body {
  padding: 14px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-title {
  height: 18px;
  width: 70%;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
}

.skeleton-tag {
  height: 22px;
  width: 50px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 2px;
}

.skeleton-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-name {
  height: 12px;
  width: 60px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-views {
  height: 12px;
  width: 40px;
  border-radius: 4px;
  margin-left: auto;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── 左侧 API 列表 ── */
/* ── 右侧用户卡片 ── */
.user-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1.5px solid rgba(231, 76, 60, 0.35) !important;
  border-radius: 16px !important;
  outline: 2.5px solid rgba(255, 255, 255, 0.15) !important;
  outline-offset: 3px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

.user-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 16px 20px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.user-card :deep(.el-card__body) {
  padding: 16px 20px !important;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 232px;
  overflow-y: auto;
  padding-right: 4px;
}

.user-list::-webkit-scrollbar {
  width: 4px;
}

.user-list::-webkit-scrollbar-track {
  background: transparent;
}

.user-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.3s;
  cursor: pointer;
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.user-item:hover .user-avatar {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.user-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* ── 标签卡片 ── */
.tags-card {
  margin-top: 20px;
  position: relative;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1.5px solid rgba(231, 76, 60, 0.35) !important;
  border-radius: 16px !important;
  outline: 2.5px solid rgba(255, 255, 255, 0.15) !important;
  outline-offset: 3px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
  background-image: url('https://free.picui.cn/free/2026/05/26/6a152a9a6176e.jpg') !important;
  background-size: cover !important;
  background-position: center !important;
  overflow: hidden;
}

.tags-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
}

.tags-card :deep(.el-card__header),
.tags-card :deep(.el-card__body) {
  position: relative;
  z-index: 1;
}

.tags-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 16px 20px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.tags-card :deep(.el-card__body) {
  padding: 16px 20px !important;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  height: 240px;
  overflow-y: auto;
  padding-right: 4px;
  align-content: flex-start;
}

.tags-list::-webkit-scrollbar {
  width: 4px;
}

.tags-list::-webkit-scrollbar-track {
  background: transparent;
}

.tags-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.tags-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
}

.tag-chip {
  padding: 7px 16px;
  border: 2px solid;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
  cursor: pointer;
}

.tag-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* ── 状态提示 ── */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  grid-column: 1 / -1;
}

/* ── 区域筛选头部 ── */
.section-filter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.back-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.back-link:hover {
  color: #f7971e;
  border-color: rgba(247, 151, 30, 0.4);
}

.section-filter-title {
  font-size: 1em;
  font-weight: 600;
  color: #f7971e;
  letter-spacing: 2px;
}

.section-filter-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #f7971e;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

/* ── 查看更多按钮（小号） ── */
.view-more-row {
  text-align: center;
  padding: 10px 0 2px;
  cursor: pointer;
  user-select: none;
}

.view-more-link {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.25s;
  letter-spacing: 1px;
}

.view-more-link:hover {
  color: #f7971e;
}

/* ── 小屏适配 ── */
@media (max-width: 768px) {
  .forum-hero {
    height: 40vh;
    min-height: 260px;
  }

  .hero-title {
    font-size: 2.2em;
  }

  .forum-body {
    padding: 20px 16px 40px;
  }

  .forum-layout {
    flex-direction: column;
  }

  .forum-leftside {
    display: none;
  }

  .forum-sidebar {
    width: 100%;
  }

  .post-list {
    grid-template-columns: 1fr;
  }
}
</style>