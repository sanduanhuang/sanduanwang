<template>
  <div class="forum-detail-page" v-if="post">
    <!-- 顶部：半高背景区 -->
    <div class="article-hero" :style="{ backgroundImage: `url(${post.封面 || defaultBackground})` }">
      <div class="hero-overlay"></div>
      


      <!-- 文章头部信息 -->
      <div class="article-info-container">
        <div class="article-header-actions">
          <div class="article-title">{{ post.标题 }}</div>
          <div v-if="canEdit" class="edit-link" @click="goToEdit">
            <span class="edit-icon">✏️</span>
            <span>编辑帖子</span>
          </div>
        </div>
        <div class="article-info">
          <span class="author-info">
            <img 
              :src="post.用户信息?.头像 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (post.用户信息?.用户名 || post.用户信息?.账号 || 'anonymous')" 
              class="avatar" 
            />
            <span>{{ post.用户信息?.用户名 || post.用户信息?.账号 || '匿名' }}</span>
          </span>
          <span>·</span>
          <span>{{ formatTime(post.创建时间) }}</span>
          <span>·</span>
          <span class="view-count">{{ views }} 阅读</span>
          <span>·</span>
          <span class="comment-count">{{ replies.length }} 评论</span>
        </div>
        <!-- 分类标签 -->
        <div class="article-tags">
          <span class="category-tag">{{ post.分类 }}</span>
          <div v-if="post.标签 && post.标签.length" class="post-tags">
            <span 
              v-for="tag in post.标签" 
              :key="tag.名称 || tag" 
              class="post-tag" 
              :style="{ backgroundColor: tag.代表颜色 || '#667eea' }"
            >
              {{ tag.名称 || tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章内容区域 -->
    <div class="article-background">
      <div class="article-layout">
        <!-- 左侧：文章主体 -->
        <div class="article-main">
          <div class="article-container shadow-box">
            <!-- 文章内容 -->
            <div ref="contentRef" v-html="renderedContent" class="entry-content"></div>

            <!-- 更新时间 -->
            <div class="article-update-time">
              最后更新于 {{ formatTime(post.更新时间) }}
            </div>

            <!-- 作者信息 -->
            <blockquote>
              <div class="author-info">作者：{{ post.用户信息?.用户名 || post.用户信息?.账号 || '匿名' }}</div>
              <div class="copyright-info">版权声明：转载请注明出处</div>
            </blockquote>

            <!-- 回复区 -->
            <div class="replies-section">
              <div class="replies-title-row">
                <h3>回复 ({{ replies.length }})</h3>
                <div class="replies-actions">
                  <button class="sort-btn" @click="toggleOnlyAuthor" title="只看楼主">
                    👤 {{ onlyAuthor ? '全部' : '楼主' }}
                  </button>
                  <button class="sort-btn" @click="toggleSort" title="切换排序">
                    {{ sortOrder === 'desc' ? '↓ 最新' : '↑ 最早' }}
                  </button>
                </div>
              </div>
            
            <!-- 回复输入框 -->
            <div class="reply-input-section" style="position:relative">
              <textarea 
                v-model="replyContent" 
                placeholder="发表你的回复...（输入 @ 可提及用户）" 
                class="reply-input"
              ></textarea>
              <div class="reply-input-actions">
                <button 
                  type="button" 
                  class="image-upload-btn"
                  :disabled="uploadingMain"
                  @click="handleImageUpload('main')"
                  :title="uploadingMain ? '上传中...' : '上传图片'"
                >
                  <span v-if="uploadingMain" class="upload-spinner"></span>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                </button>
                <div class="at-dropdown-wrapper">
                  <button type="button" class="at-btn" @click="toggleAtDropdown('main')" title="插入@AI">@</button>
                  <div v-if="atDropdownTarget === 'main'" class="at-dropdown">
                    <div class="at-dropdown-item" @click="selectAtItem('main', '对话')">💬 智谱AI-对话</div>
                    <div class="at-dropdown-item" @click="selectAtItem('main', '文生图')">🎨 智谱AI-文生图</div>
                    <div class="at-dropdown-item" @click="selectAtItem('main', '翻译')">🌐 智谱AI-翻译</div>
                  </div>
                </div>
                <button type="button" class="submit-reply-btn" @click="submitReply">
                  发表回复
                </button>
              </div>
            </div>
            <div v-if="replyImageUrl" class="upload-preview">
              <img :src="replyImageUrl" class="upload-preview-img" @click="previewImage(replyImageUrl)" />
              <button class="upload-preview-remove" @click="replyImageUrl = ''">×</button>
            </div>
            
            <!-- 回复列表 -->
            <div class="replies-list">
              <div v-for="reply in topLevelReplies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <img 
                    v-if="parseUserData(reply.用户数据)?.头像" 
                    :src="parseUserData(reply.用户数据)?.头像" 
                    class="reply-avatar" 
                  />
                  <img 
                    v-else 
                    class="reply-avatar" 
                    :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (parseUserData(reply.用户数据)?.账号 || 'anonymous')" 
                  />
                  <span class="reply-author">{{ parseUserData(reply.用户数据)?.用户名 || parseUserData(reply.用户数据)?.账号 || '匿名' }}</span>
                  <span class="reply-time">{{ formatTime(reply.发送日期) }}</span>
                  <button class="reply-btn" @click="toggleReplyTo(reply)">回复</button>
                  <button 
                    v-if="isReplyOwner(reply)" 
                    class="reply-delete-btn" 
                    @click="deleteReply(reply)"
                  >删除</button>
                </div>
                <img v-if="reply.附带的图片" :src="reply.附带的图片" class="reply-attached-image" @click="previewImage(reply.附带的图片)" />
                <p class="reply-content" v-html="renderReplyContent(reply.内容)"></p>
                
                <!-- 楼中楼回复输入框 -->
                <div v-if="replyingTo?.id === reply.id" class="sub-reply-input" style="position:relative">
                  <input 
                    v-model="subReplyContent" 
                    type="text"
                    :placeholder="`回复 @${parseUserData(reply.用户数据)?.用户名 || '匿名'}...（输入 @ 可提及用户）`" 
                    class="reply-input-small"
                  />
                  <!-- @提及下拉 -->

                  <button 
                    type="button" 
                    class="image-upload-btn-small" 
                    :disabled="uploadingSub"
                    @click="handleImageUpload('sub')"
                    :title="uploadingSub ? '上传中...' : '上传图片'"
                  >
                    <span v-if="uploadingSub" class="upload-spinner"></span>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </button>
                  <div class="at-dropdown-wrapper" style="display:inline-block">
                    <button type="button" class="at-btn-small" @click="toggleAtDropdown('sub')" title="插入@AI">@</button>
                    <div v-if="atDropdownTarget === 'sub'" class="at-dropdown at-dropdown-small">
                      <div class="at-dropdown-item" @click="selectAtItem('sub', '对话')">💬 智谱AI-对话</div>
                      <div class="at-dropdown-item" @click="selectAtItem('sub', '文生图')">🎨 智谱AI-文生图</div>
                      <div class="at-dropdown-item" @click="selectAtItem('sub', '翻译')">🌐 智谱AI-翻译</div>
                    </div>
                  </div>
                  <button type="button" class="submit-reply-btn-small" @click="submitSubReply(reply)">发送</button>
                  <button type="button" class="cancel-reply-btn" @click="replyingTo = null">取消</button>
                </div>
                <div v-if="subReplyImageUrl && replyingTo?.id === reply.id" class="upload-preview">
                  <img :src="subReplyImageUrl" class="upload-preview-img" @click="previewImage(subReplyImageUrl)" />
                  <button class="upload-preview-remove" @click="subReplyImageUrl = ''">×</button>
                </div>
                
                <!-- 子回复列表 -->
                <div v-if="getSubReplies(reply.id).length > 0" class="sub-replies">
                  <div v-for="subReply in getSubReplies(reply.id)" :key="subReply.id" class="sub-reply-item">
                    <div class="sub-reply-header">
                      <img 
                        v-if="parseUserData(subReply.用户数据)?.头像" 
                        :src="parseUserData(subReply.用户数据)?.头像" 
                        class="sub-reply-avatar" 
                      />
                      <img 
                        v-else 
                        class="sub-reply-avatar" 
                        :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (parseUserData(subReply.用户数据)?.账号 || 'anonymous')" 
                      />
                      <span class="sub-reply-author">{{ parseUserData(subReply.用户数据)?.用户名 || parseUserData(subReply.用户数据)?.账号 || '匿名' }}</span>
                      <span class="sub-reply-time">{{ formatTime(subReply.发送日期) }}</span>
                      <button class="reply-btn-small" @click="toggleReplyTo(subReply)">回复</button>
                      <button 
                        v-if="isReplyOwner(subReply)" 
                        class="reply-delete-btn-small" 
                        @click="deleteReply(subReply)"
                      >删除</button>
                    </div>
                    <img v-if="subReply.附带的图片" :src="subReply.附带的图片" class="reply-attached-image" @click="previewImage(subReply.附带的图片)" />
                    <p class="sub-reply-content" v-html="renderReplyContent(subReply.内容)"></p>
                    
                    <!-- 子回复的回复输入框 -->
                    <div v-if="replyingTo?.id === subReply.id" class="sub-reply-input" style="position:relative">
                      <input 
                        v-model="subReplyContent" 
                        type="text"
                        :placeholder="`回复 @${parseUserData(subReply.用户数据)?.用户名 || '匿名'}...（输入 @ 可提及用户）`" 
                        class="reply-input-small"
                      />
                      <button 
                        type="button" 
                        class="image-upload-btn-small" 
                        :disabled="uploadingSub"
                        @click="handleImageUpload('sub')"
                        :title="uploadingSub ? '上传中...' : '上传图片'"
                      >
                        <span v-if="uploadingSub" class="upload-spinner"></span>
                        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </button>
                      <div class="at-dropdown-wrapper" style="display:inline-block">
                        <button type="button" class="at-btn-small" @click="toggleAtDropdown('sub')" title="插入@AI">@</button>
                        <div v-if="atDropdownTarget === 'sub'" class="at-dropdown at-dropdown-small">
                          <div class="at-dropdown-item" @click="selectAtItem('sub', '对话')">💬 智谱AI-对话</div>
                          <div class="at-dropdown-item" @click="selectAtItem('sub', '文生图')">🎨 智谱AI-文生图</div>
                          <div class="at-dropdown-item" @click="selectAtItem('sub', '翻译')">🌐 智谱AI-翻译</div>
                        </div>
                      </div>
                      <button type="button" class="submit-reply-btn-small" @click="submitSubReply(subReply)">发送</button>
                      <button type="button" class="cancel-reply-btn" @click="replyingTo = null">取消</button>
                    </div>
                    <div v-if="subReplyImageUrl && replyingTo?.id === subReply.id" class="upload-preview">
                      <img :src="subReplyImageUrl" class="upload-preview-img" @click="previewImage(subReplyImageUrl)" />
                      <button class="upload-preview-remove" @click="subReplyImageUrl = ''">×</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div><!-- end replies-section -->
          </div>
        </div>
        
        <!-- 右侧栏：目录 -->
        <div class="article-sidebar">
          <!-- 封面图片（如果有的话） -->
          <div v-if="post.封面" class="cover-section">
            <div class="section-header">
              <span class="section-title">封面</span>
            </div>
            <img :src="post.封面" alt="帖子封面" class="cover-preview-small" />
          </div>
          
          <div v-if="tocHeadings.length > 0" class="toc-panel">
            <div class="toc-header">
              <span class="toc-title">目录</span>
            </div>
            <div class="toc-list">
              <a 
                v-for="(heading, index) in tocHeadings" 
                :key="index"
                class="toc-item"
                :class="{ 'toc-h1': heading.level === 1, 'toc-h2': heading.level === 2, 'toc-h3': heading.level === 3, 'active': activeHeadingId === heading.id }"
                @click="scrollToHeading(heading.id)"
              >
                {{ heading.text }}
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    
    <!-- 返回顶部按钮（固定在右下角） -->
    <button class="back-to-top-btn" @click="scrollToTop" title="返回顶部">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getBackgrounds, getForumPosts, getReplies, addReply, deleteData, increaseForumView, query, triggerAiAutoReply } from "@/api/data";
import { uploadToPicUI } from "@/api/external";
import { useUserStore } from "@/stores/user";
import type { Forum } from "@/types";
import Prism from "prismjs";
import "prism-themes/themes/prism-vsc-dark-plus.min.css";
// 基础语言组件（按依赖顺序导入）
import "prismjs/components/prism-markup.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-clike.min.js";
import "prismjs/components/prism-javascript.min.js";
// 依赖 clike 的语言
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-cpp.min.js";
import "prismjs/components/prism-csharp.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-rust.min.js";
import "prismjs/components/prism-ruby.min.js";
import "prismjs/components/prism-php.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-bash.min.js";
// 依赖 javascript 的语言
import "prismjs/components/prism-typescript.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-tsx.min.js";
// 其他独立语言
import "prismjs/components/prism-sql.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-yaml.min.js";
// 依赖 markup 的语言
import "prismjs/components/prism-markdown.min.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const post = ref<Forum | null>(null);
const replies = ref<Record<string, unknown>[]>([]);
const replyContent = ref("");
const subReplyContent = ref("");
const replyingTo = ref<Record<string, unknown> | null>(null);
const views = ref(0);
const uploadingMain = ref(false);

// @AI 下拉菜单
const atDropdownTarget = ref<'main' | 'sub' | null>(null);

const toggleAtDropdown = (model: 'main' | 'sub') => {
  atDropdownTarget.value = atDropdownTarget.value === model ? null : model;
};

const selectAtItem = (model: 'main' | 'sub', type: string) => {
  const postTitle = post.value?.标题 || '';
  const contextInfo = postTitle ? `关于《${postTitle}》` : '';
  const name = type === '对话' ? '智谱AI' : `智谱AI-${type}`;
  const text = `@${name} ${contextInfo}`;
  if (model === 'main') replyContent.value += text;
  else subReplyContent.value += text;
  atDropdownTarget.value = null;
};

// 点击外部关闭下拉
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.at-dropdown-wrapper')) {
    atDropdownTarget.value = null;
  }
};
onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));

// 排序
const sortOrder = ref<'asc' | 'desc'>('desc');
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  loadReplies();
};

// 只看楼主
const onlyAuthor = ref(false);
const toggleOnlyAuthor = () => {
  onlyAuthor.value = !onlyAuthor.value;
};

const uploadingSub = ref(false);
const replyImageUrl = ref("");
const subReplyImageUrl = ref("");
const defaultBackground = "https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg";

const topLevelReplies = computed(() => {
  let list = replies.value.filter(reply => !reply.父回复ID || reply.父回复ID === 0);
  if (onlyAuthor.value && post.value?.用户信息?.账号) {
    const authorAccount = post.value.用户信息.账号;
    list = list.filter(reply => {
      const userData = parseUserData(reply.用户数据);
      return userData?.账号 === authorAccount;
    });
  }
  return list;
});

const getSubReplies = (parentId: string | number) => {
  const parentIdStr = String(parentId);
  return replies.value.filter(reply => {
    const replyParentId = String(reply.父回复ID);
    return replyParentId === parentIdStr;
  });
};

const toggleReplyTo = (reply: Record<string, unknown>) => {
  if (replyingTo.value?.id === reply.id) {
    replyingTo.value = null;
    subReplyContent.value = "";
  } else {
    replyingTo.value = reply;
    subReplyContent.value = "";
  }
};

// 判断是否可以编辑
const canEdit = computed(() => {
  if (!userStore.isLoggedIn || !post.value) {
    return false;
  }
  
  // 尝试多种方式匹配用户
  const postAccount = post.value.账号 || post.value.用户信息?.账号 || post.value.用户信息?.account;
  const userAccount = userStore.userInfo?.account;
  
  return postAccount === userAccount;
});

// 判断是否是回复的作者
const isReplyOwner = (reply: Record<string, unknown>): boolean => {
  if (!userStore.isLoggedIn) {
    return false;
  }
  
  const userData = parseUserData(reply.用户数据);
  const replyAccount = userData?.账号 || userData?.account;
  const userAccount = userStore.userInfo?.account;
  
  return replyAccount === userAccount;
};

// 删除回复
const deleteReply = async (reply: Record<string, unknown>) => {
  console.log('准备删除回复，回复数据:', reply);
  
  if (!confirm('确定要删除这条回复吗？')) {
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录');
    router.push('/login');
    return;
  }

  try {
    // 尝试获取回复ID，支持两种可能的字段名
    const replyId = reply.唯一ID || reply.id;
    console.log('使用的回复ID:', replyId);
    
    if (!replyId) {
      ElMessage.error('无法识别回复ID');
      return;
    }

    const isNumeric = !isNaN(Number(replyId));
    const where = isNumeric 
      ? `唯一ID = ${replyId} OR id = ${replyId}`
      : `唯一ID = '${replyId}' OR id = '${replyId}'`;
    
    console.log('删除条件:', where);
    
    await deleteData({
      table: "回复表",
      where: where,
      uniqueId: userStore.userInfo.uniqueId,
    });

    ElMessage.success('删除成功');
    await loadReplies();
  } catch (error) {
    console.error('删除回复失败:', error);
    ElMessage.error('删除失败，请稍后重试');
  }
};

// 跳转到编辑页面
const goToEdit = () => {
  if (!post.value) return;
  // 将响应式对象转成普通对象，用 localStorage 传递数据更可靠
  const editPostData = JSON.parse(JSON.stringify(post.value));
  console.log("传递到编辑页面的数据:", editPostData);
  localStorage.setItem('editPostData', JSON.stringify(editPostData));
  router.push("/forum/new");
};

// 渲染内容（处理HTML）
const renderedContent = computed(() => {
  if (!post.value?.内容) return "";
  return post.value.内容;
});

// 内容渲染后应用 Prism 语法高亮
const applyPrismHighlighting = () => {
  if (contentRef.value) {
    Prism.highlightAllUnder(contentRef.value);
  }
};

// 监听 post 变化，在 DOM 更新后执行 Prism 高亮
watch(() => post.value?.内容, () => {
  nextTick(() => {
    applyPrismHighlighting();
  });
});

// 目录相关
const contentRef = ref<HTMLElement | null>(null);
const activeHeadingId = ref<string>("");

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const tocHeadings = computed<TocHeading[]>(() => {
  if (!contentRef.value) return [];
  
  const headings: TocHeading[] = [];
  const headingElements = contentRef.value.querySelectorAll('h1, h2, h3');
  
  headingElements.forEach((el, index) => {
    const id = `heading-${index}`;
    if (!el.id) {
      el.id = id;
    }
    headings.push({
      id: el.id || id,
      text: el.textContent || '',
      level: parseInt(el.tagName.substring(1)),
    });
  });
  
  return headings;
});

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeHeadingId.value = id;
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleScroll = () => {
  if (!contentRef.value) return;
  
  const headings = tocHeadings.value;
  const scrollY = window.scrollY;
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const element = document.getElementById(headings[i].id);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 150) {
        activeHeadingId.value = headings[i].id;
        return;
      }
    }
  }
  
  if (headings.length > 0) {
    activeHeadingId.value = headings[0].id;
  }
};



const formatTime = (timeStr: string): string => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const parseUserData = (userDataStr: unknown): Record<string, unknown> | null => {
  if (typeof userDataStr !== 'string') return null;
  try {
    return JSON.parse(userDataStr);
  } catch {
    return null;
  }
};

// 渲染回复内容：@提及变蓝色
const renderReplyContent = (content: string): string => {
  if (!content) return '';
  let html = content;
  // 将 @用户名 替换为蓝色span
  html = html.replace(/@\S+/g, '<span class="at-mention">$&</span>');
  // 将换行符转换为 <br> 标签
  html = html.replace(/\n/g, '<br>');
  return html;
};

// 图片预览（点击放大）
const previewImage = (url: string) => {
  window.open(url, '_blank');
};

// 图片上传处理
const handleImageUpload = async (target: 'main' | 'sub') => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录');
    router.push('/login');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;

    if (target === 'main') uploadingMain.value = true;
    else uploadingSub.value = true;

    try {
      const res: any = await uploadToPicUI({ file, album: '论坛图库' });
      // PicUI返回格式: { links: { url: "..." } }
      const url = res?.data?.links?.url || res?.links?.url || res?.url || res?.data?.url;

      if (target === 'main') {
        replyImageUrl.value = url;
      } else {
        subReplyImageUrl.value = url;
      }
      
      ElMessage.success('图片上传成功');
    } catch (err) {
      ElMessage.error('图片上传失败，请稍后重试');
      console.error('上传图片失败:', err);
    } finally {
      if (target === 'main') uploadingMain.value = false;
      else uploadingSub.value = false;
    }
  };

  input.click();
};

const submitReply = async () => {
  if (!replyContent.value.trim() && !replyImageUrl.value) {
    ElMessage.error("请输入回复内容或上传图片");
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    router.push("/login");
    return;
  }

  try {
    const userInfo = userStore.userInfo;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    console.log("提交回复数据:", {
      唯一ID: userInfo.uniqueId,
      所属论坛编号: post.value?.id || post.value?.唯一ID || 0,
      内容: replyContent.value,
      附带的图片: replyImageUrl.value,
      发送日期: now,
    });
    
    await addReply(userInfo.uniqueId, {
      唯一ID: userInfo.uniqueId,
      所属论坛编号: post.value?.id || post.value?.唯一ID || 0,
      内容: replyContent.value,
      用户数据: JSON.stringify({
        账号: userInfo.account,
        头像: userInfo.avatar || "",
        用户名: userInfo.account,
      }),
      回复的对象数据: JSON.stringify({}),
      附带的图片: replyImageUrl.value,
      发送日期: now,
    });

    ElMessage.success("回复成功");
    const replyText = replyContent.value;
    const replyTime = now;
    replyContent.value = "";
    replyImageUrl.value = "";
    await loadReplies();

    // 检测是否@了智谱AI并自动回复
    const forumId = (post.value as Record<string, unknown>)?.唯一ID || post.value?.id || 0;

    // 直接查刚插入的回复ID
    let parentId: number | undefined;
    try {
      const res = await query({
        table: "回复表",
        fields: ["id"],
        where: `唯一ID = '${userInfo.uniqueId}'`,
        order: "id",
        sort: "desc",
        limit: 1,
        uniqueId: userInfo.uniqueId,
      });
      parentId = (res.data?.[0] as any)?.id;
    } catch {}

    await triggerAiAutoReply(replyText, "回复表", { 所属论坛编号: forumId }, parentId);
    await loadReplies();
  } catch (error) {
    console.error("发表回复失败:", error);
    ElMessage.error("发表回复失败，请稍后重试");
  }
};

const submitSubReply = async (parentReply: Record<string, unknown>) => {
  if (!subReplyContent.value.trim() && !subReplyImageUrl.value) {
    ElMessage.error("请输入回复内容或上传图片");
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    router.push("/login");
    return;
  }

  try {
    const userInfo = userStore.userInfo;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const parentUserName = parseUserData(parentReply.用户数据)?.用户名 || parseUserData(parentReply.用户数据)?.账号 || '匿名';
    
    // 找到顶级回复ID（确保新回复显示在二级列表）
    let parentReplyId = parentReply.id;
    if (parentReply.父回复ID && parentReply.父回复ID !== 0) {
      // 如果是回复二级回复，新回复的父回复ID应该是顶级回复ID
      parentReplyId = parentReply.父回复ID;
    }
    
    console.log("提交子回复数据:", {
      唯一ID: userInfo.uniqueId,
      所属论坛编号: post.value?.id || post.value?.唯一ID || 0,
      内容: `@${parentUserName} ${subReplyContent.value}`,
      父回复ID: parentReplyId,
      附带的图片: subReplyImageUrl.value,
      发送日期: now,
    });
    
    await addReply(userInfo.uniqueId, {
        唯一ID: userInfo.uniqueId,
        所属论坛编号: post.value?.id || post.value?.唯一ID || 0,
        内容: `@${parentUserName} ${subReplyContent.value}`,
        用户数据: JSON.stringify({
          账号: userInfo.account,
          头像: userInfo.avatar || "",
          用户名: userInfo.account,
        }),
        回复的对象数据: JSON.stringify(parentReply),
        附带的图片: subReplyImageUrl.value,
        父回复ID: parentReplyId,
        发送日期: now,
      });

    ElMessage.success("回复成功");
    const subContent = `@${parentUserName} ${subReplyContent.value}`;
    subReplyContent.value = "";
    subReplyImageUrl.value = "";
    replyingTo.value = null;
    await loadReplies();

    // 检测是否@了智谱AI并自动回复
    const fId = (post.value as Record<string, unknown>)?.唯一ID || post.value?.id || 0;
    await triggerAiAutoReply(subContent, "回复表", { 所属论坛编号: fId }, parentReplyId as number);
    await loadReplies();
  } catch (error) {
    console.error("发表回复失败:", error);
    ElMessage.error("发表回复失败，请稍后重试");
  }
};

const loadReplies = async () => {
  try {
    if (!post.value) return;
    const forumId = (post.value as Record<string, unknown>)?.唯一ID || post.value?.id;
    const data = await getReplies(forumId, 'user_1779243581625437300', sortOrder.value);
    replies.value = (data as Record<string, unknown>[]) || [];
  } catch (error) {
    console.log("获取回复失败");
    replies.value = [];
  }
};

onMounted(async () => {
  await userStore.loadUserInfo();

  // 获取帖子详情
  try {
    const allPosts = await getForumPosts();
    const postId = decodeURIComponent(route.params.id as string);
    post.value = allPosts.find(p => String(p.id) === postId || p.标题 === postId) as Forum || null;
    
    if (!post.value) {
      ElMessage.error("帖子不存在");
      setTimeout(() => router.push("/forum"), 1500);
      return;
    }

    // 增加阅读量并显示
    // 优先使用数据库中的阅读量
    views.value = post.value.阅读 || 0;
    
    if (post.value.id) {
      try {
        const res = await increaseForumView(post.value.id);
        if (res.success && res.data) {
          views.value = res.data.afterViews;
          post.value.阅读 = res.data.afterViews;
        }
      } catch (err) {
        console.log("增加阅读量失败:", err);
      }
    }
    
    // 获取评论列表
    await loadReplies();
  } catch (error) {
    console.log("获取帖子详情失败");
    ElMessage.error("获取帖子详情失败");
  }
  
  // 添加滚动监听
  await nextTick();
  window.addEventListener('scroll', handleScroll);
  
  // 应用 Prism 语法高亮
  applyPrismHighlighting();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
.forum-detail-page {
  min-height: 100vh;
  position: relative;
}

/* ── 顶部半高背景区 ── */
.article-hero {
  height: 50vh;
  min-height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}



.edit-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .edit-icon {
    font-size: 13px;
  }
}

.article-info-container {
  position: relative;
  z-index: 1;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  padding: 0 15%;
  width: 100%;
  max-width: 1400px;

  .article-header-actions {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;

    .article-title {
      font-size: 36px;
      font-weight: bold;
      line-height: 1.4;
      flex: 1;
      margin: 0;
    }
  }

  .article-info {
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 15px;

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
    }

    .view-count, .comment-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13px;
    }
  }

  .article-tags {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .post-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .category-tag {
      background: rgba(102, 126, 234, 0.8);
      color: white;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .post-tag {
      color: white;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.article-background {
  background: #f8f9fa;
  position: relative;
  padding: 30px 5% 40px;
  margin-top: -30px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(6px);
    z-index: -1;
  }

  .article-layout {
    display: flex;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
    align-items: flex-start;
  }

  .article-main {
    flex: 1;
    min-width: 0;
  }

  .article-sidebar {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 80px;
    align-self: flex-start;
  }

  .toc-panel {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e8e8e8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-top: 15px;
  }

  .toc-header {
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  .cover-section {
    background: white;
    border-radius: 12px;
    padding: 15px;
    border: 1px solid #e8e8e8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .section-header {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }

  .cover-preview-small {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 10px;
  }

  .toc-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }

  .toc-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toc-item {
    color: #666;
    text-decoration: none;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .toc-item:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  .toc-item.active {
    background: rgba(102, 126, 234, 0.15);
    color: #667eea;
    font-weight: 500;
  }

  .toc-h1 {
    font-weight: 600;
  }

  .toc-h2 {
    padding-left: 20px;
  }

  .toc-h3 {
    padding-left: 35px;
    font-size: 12px;
  }

  .article-container {
    background: white;
    padding: 40px;
    border-radius: 16px;
    width: 100%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border: 2px dashed #e8e8e8;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
    }

    .article-sort {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      .category-tag {
        padding: 6px 14px;
        background: #667eea;
        color: white;
        border-radius: 20px;
        font-size: 13px;
      }

      .post-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .post-tag {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        color: white;
      }
    }

    .article-cover {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .entry-content {
      color: #333;
      line-height: 1.8;
      font-size: 16px;
      margin-bottom: 25px;

      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 20px 0 12px;
        font-weight: 600;
        color: #2c3e50;
      }

      :deep(h1) { font-size: 1.8em; border-bottom: 2px solid #667eea; padding-bottom: 10px; color: #2c3e50; }
      :deep(h2) { font-size: 1.5em; color: #2c3e50; }
      :deep(h3) { font-size: 1.3em; color: #2c3e50; }
      :deep(h4) { font-size: 1.1em; color: #2c3e50; }

      p { margin: 12px 0; }

      :deep(blockquote) {
        border-left: 4px solid #667eea;
        padding: 15px 20px;
        margin: 16px 0;
        background: #f5f7fa;
        border-radius: 0 8px 8px 0;
        color: #666;
        font-style: italic;
      }

      :deep(pre[class*="language-"]) {
        background: #1e1e1e !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        margin: 1.5rem 0 !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        position: relative !important;
        padding: 0 !important;
        border: none !important;
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
      }

      :deep(pre[class*="language-"] .code-editor-header) {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 10px 16px !important;
        background: #252526 !important;
        border-radius: 8px 8px 0 0 !important;
        user-select: none !important;
        border-bottom: 1px solid #3c3c3c !important;
      }

      :deep(pre[class*="language-"] .code-editor-content) {
        padding: 16px !important;
        overflow-x: auto !important;
        background: #1e1e1e !important;
      }

      :deep(pre[class*="language-"] .code-editor-content code) {
        background: transparent !important;
        padding: 0 !important;
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        text-shadow: none !important;
      }

      :deep(pre[class*="language-"]::before),
      :deep(pre[class*="language-"]::after) {
        display: none !important;
      }

      :deep(.token.operator),
      :deep(.token.entity),
      :deep(.token.url),
      :deep(.language-css .token.string),
      :deep(.style .token.string) {
        background: transparent !important;
      }

      :deep(code) {
        background: #f0f0f0;
        padding: 3px 8px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9em;
        color: #e74c3c;
      }

      :deep(a) {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #5fa8d3;
        text-decoration: none;
        background: rgba(95, 168, 211, 0.1);
        border: 1px solid rgba(95, 168, 211, 0.25);
        border-radius: 6px;
        padding: 1px 8px;
        transition: all 0.2s;
        white-space: nowrap;

        &::before {
          content: '🔗';
          font-size: 0.85em;
        }

        &:hover {
          background: rgba(95, 168, 211, 0.2);
          border-color: rgba(95, 168, 211, 0.5);
          color: #7cc5e8;
        }
      }

      ul, ol {
        padding-left: 25px;
        margin: 12px 0;
      }

      li {
        margin: 8px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
        border-radius: 8px;
        overflow: hidden;

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e8e8e8;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
        }

        tr:hover {
          background: #fafafa;
        }
      }
    }

    .article-update-time {
      color: #999;
      font-size: 13px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #e8e8e8;
    }

    .edit-button-inline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: white;
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 20px;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
        border-color: rgba(255, 255, 255, 0.4);
      }

      .edit-icon {
        font-size: 16px;
      }
    }

    blockquote {
      line-height: 1.8;
      border-left: 0.2rem solid #667eea;
      padding: 15px 20px;
      background: #f8f9fa;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;

      .author-info {
        color: #667eea;
        font-weight: 500;
        margin-bottom: 5px;
      }

      .copyright-info {
        color: #999;
        font-size: 13px;
      }
    }

    .like-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 0;
      border-top: 1px dashed #e8e8e8;
      border-bottom: 1px dashed #e8e8e8;
      margin: 20px 0;

      .like-icon {
        color: #ddd;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: scale(1.1);
        }

        &.liked {
          color: #e74c3c;
          animation: heartbeat 0.6s ease;
        }
      }

      .like-text {
        margin-top: 10px;
        color: #999;
        font-size: 14px;
      }
    }

    .replies-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-right: 4px;
      h3 { margin: 0; font-size: 1.3em; color: #333; }
    }
    .replies-actions {
      display: flex;
      gap: 8px;
    }

    .replies-section {
      margin-top: 30px;

      .replies-title {
        font-size: 1.3em;
        color: #333;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #667eea;
      }

      .replies-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
      }

      .reply-item {
        padding: 24px;
        background: linear-gradient(145deg, #ffffff, #f8f9fa);
        border-radius: 16px;
        transition: all 0.3s ease;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #eef1f5;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
          border-color: #dfe3eb;
        }

        .reply-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;

          .reply-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #f0f2f5;
            transition: all 0.3s;

            &:hover {
              border-color: #667eea;
            }
          }

          .reply-author {
            font-weight: 600;
            color: #e74c3c;
            font-size: 15px;
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
              color: #c0392b;
            }
          }

          .reply-time {
            margin-left: auto;
            color: #8a8f9c;
            font-size: 13px;
          }

          .reply-btn {
            padding: 7px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(102, 126, 234, 0.15);
            color: #667eea;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);

            &:hover {
              transform: translateY(-1px);
              background: rgba(102, 126, 234, 0.25);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
              border-color: rgba(102, 126, 234, 0.3);
            }

            &:active {
              transform: translateY(0);
            }
          }

          .reply-delete-btn {
            padding: 7px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(231, 76, 60, 0.15);
            color: #e74c3c;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);

            &:hover {
              transform: translateY(-1px);
              background: rgba(231, 76, 60, 0.25);
              box-shadow: 0 4px 12px rgba(231, 76, 60, 0.25);
              border-color: rgba(231, 76, 60, 0.3);
            }

            &:active {
              transform: translateY(0);
            }
          }
        }

        .reply-content {
          color: #4a4e69;
          line-height: 1.7;
          margin: 0;
          padding-left: 54px;
          font-size: 15px;
          word-break: break-word;
        }

        .reply-input-small {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e1e5ea;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s;

          &:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }

        .submit-reply-btn-small {
          padding: 12px 22px;
          border-radius: 10px;
          font-weight: 600;
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          &:hover {
            transform: translateY(-1px);
            background: rgba(102, 126, 234, 0.25);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
            border-color: rgba(102, 126, 234, 0.3);
          }
        }

        .cancel-reply-btn {
          padding: 12px 22px;
          border-radius: 10px;
          font-weight: 500;
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          &:hover {
            background: rgba(107, 114, 128, 0.15);
            border-color: rgba(107, 114, 128, 0.2);
          }
        }

        .reply-btn-small {
          margin-left: 8px;
          padding: 4px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          &:hover {
            background: rgba(102, 126, 234, 0.2);
            color: #5a6fd6;
          }
        }

        .reply-delete-btn-small {
          margin-left: 8px;
          padding: 4px 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          &:hover {
            background: rgba(231, 76, 60, 0.2);
            color: #c0392b;
          }
        }

        .sub-replies {
          margin-top: 16px;
          margin-left: 54px;
          padding-left: 16px;
          border-left: 3px solid #667eea;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(180deg, #667eea, #764ba2);
            border-radius: 2px;
          }
        }

        .sub-reply-item {
          padding: 14px 16px;
          background: #ffffff;
          border-radius: 10px;
          margin-bottom: 10px;
          border: 1px solid #f0f2f5;
          transition: all 0.25s ease;
          position: relative;

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            background: #f8faff;
            border-color: #dce3f5;
            transform: translateX(3px);
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
          }
        }

        .sub-reply-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .sub-reply-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #f0f2f5;
          transition: border-color 0.3s;

          &:hover {
            border-color: #667eea;
          }
        }

        .sub-reply-author {
          font-weight: 600;
          color: #e74c3c;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #c0392b;
          }
        }

        .sub-reply-time {
          margin-left: auto;
          color: #9ca3af;
          font-size: 12px;
        }

        .sub-reply-input {
          display: flex;
          gap: 10px;
          padding: 12px;
          margin-top: 12px;
          background: #f8faff;
          border-radius: 10px;
          margin-left: 54px;
          border: 1px solid #e8eef3;
          flex-wrap: wrap;
        }

        .image-upload-btn-small {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          min-width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
          color: #667eea;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);

          &:hover:not(:disabled) {
            border-color: rgba(102, 126, 234, 0.3);
            color: #5a6fd6;
            background: rgba(102, 126, 234, 0.2);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }

      .reply-input-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 24px 0 0;
        margin-top: 8px;
        border-top: 1px dashed #e8e8e8;

        .reply-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid #e1e5ea;
          border-radius: 12px;
          font-size: 16px;
          background: url('https://free.picui.cn/free/2026/05/25/6a139116640ab.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: #333;
          min-height: 220px;
          resize: vertical;
          transition: all 0.3s;

          &:focus {
            outline: none;
            border-color: #667eea;
            background: url('https://free.picui.cn/free/2026/05/25/6a139116640ab.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
          }

          &::placeholder {
            color: rgba(51, 51, 51, 0.6);
            font-weight: 500;
          }
        }

        .reply-input-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .image-upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          min-width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          color: #667eea;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          &:hover:not(:disabled) {
            border-color: rgba(102, 126, 234, 0.3);
            color: #5a6fd6;
            background: rgba(102, 126, 234, 0.2);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }
  }

/* ── @智谱AI 按钮 ── */
.at-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}
.at-btn:hover {
  background: rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}
.at-btn-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  vertical-align: middle;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.15);
}
.at-btn-small:hover {
  background: rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.25);
}

/* ── @AI 下拉菜单 ── */
.at-dropdown-wrapper {
  position: relative;
  display: inline-flex;
}
.at-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 160px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
.at-dropdown-small {
  min-width: 140px;
}
.at-dropdown-item {
  padding: 8px 14px;
  font-size: 13px;
  color: #4a4e69;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.at-dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
.at-dropdown-item:active {
  background: rgba(102, 126, 234, 0.2);
}

        .submit-reply-btn {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          &:hover {
            transform: translateY(-2px);
            background: rgba(102, 126, 234, 0.25);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
            border-color: rgba(102, 126, 234, 0.3);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    
  


/* @提及蓝色样式 - 使用deep穿透scoped作用域，适配v-html动态渲染 */
:deep(.at-mention) {
  color: #3498db;
  font-weight: 600;
  background: rgba(52, 152, 219, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
}

/* 回复附带图片样式 - 显示在内容上方 */
.reply-attached-image {
  max-width: 100%;
  max-height: 300px;
  width: auto !important;
  height: auto !important;
  border-radius: 10px;
  margin: 8px 0 12px 54px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  object-fit: contain;
  background: #f5f7fa;
  cursor: zoom-in;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid #667eea;

  &:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
}

/* 上传预览 */
.upload-preview {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 8px;
  background: #f8faff;
  border: 1px solid #e8eef3;
  border-radius: 10px;
  position: relative;
}

.upload-preview-img {
  max-width: 120px;
  max-height: 80px;
  border-radius: 6px;
  object-fit: cover;
  cursor: zoom-in;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.upload-preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0,0,0,0.7);
  }
}

/* 上传加载动画 */
.upload-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e1e5ea;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
}

/* ── 排序/楼主按钮 ── */
.sort-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.sort-btn:hover {
  border-color: rgba(102, 126, 234, 0.3);
  color: #5a6fd6;
  background: rgba(102, 126, 234, 0.2);
}

@media screen and (max-width: 1200px) {
  .article-head {
    padding: 0 10%;
  }

  .article-background {
    padding: 60px 10% 40px;
  }

  .article-sidebar {
    display: none;
  }

  .article-layout {
    display: block;
  }
}

@media screen and (max-width: 768px) {
  .article-head {
    padding: 0 5%;

    .article-title {
      font-size: 24px;
    }
  }

  .article-background {
    padding: 60px 5% 40px;
  }

  .article-container {
    padding: 20px;

    .article-cover {
      max-height: 200px;
    }
  }

  .replies-list {
    gap: 12px;
  }

  .reply-item {
    padding: 16px;

    .reply-content {
      padding-left: 0;
      margin-top: 10px;
    }

    .reply-attached-image {
      margin-left: 0;
    }

    .sub-replies {
      margin-left: 0;
      padding-left: 12px;
    }

    .sub-reply-input {
      margin-left: 0;
    }
  }

  .reply-input-section {
    flex-direction: column;
  }

  .comment-input-section {
    flex-direction: column !important;
  }


}

/* ── @提及下拉 ── */
.at-dropdown {
  position: absolute;
  z-index: 1000;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  list-style: none;
  padding: 4px 0;
  margin: 0;
  min-width: 140px;
  max-height: 200px;
  overflow-y: auto;
}
.at-dropdown-item {
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  transition: background 0.15s;
}
.at-dropdown-item:hover {
  background: #ecf5ff;
}
.at-dropdown-input {
  min-width: 120px;
}
/* ── @提及蓝色高亮 ── */
:deep(.at-mention) {
  color: #409eff;
  font-weight: 500;
}
</style>

<style>
.back-to-top-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9999;
}

.back-to-top-btn:hover {
  transform: translateY(-4px) scale(1.05);
  background: rgba(102, 126, 234, 0.25);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.3);
}

.back-to-top-btn:active {
  transform: translateY(-2px) scale(1.02);
}
</style>