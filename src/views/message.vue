<template>
  <div class="message-page">
    <!-- 固定背景层 -->
    <div class="message-bg"></div>

    <!-- 顶部：半高背景区 -->
    <div class="message-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">荒</span><span class="title-rest">の留言板</span>
        </h1>
        <p class="hero-subtitle">共 {{ messages.length }} 条留言</p>
      </div>
    </div>

    <!-- 底部：内容区 -->
    <div class="message-body">
      <div class="content-wrapper">

        <!-- 留言输入框 -->
        <div class="message-input-section" style="position:relative">
          <textarea 
            v-model="messageContent" 
            placeholder="发表你的留言..." 
            class="message-input"
          ></textarea>

          <div class="message-input-actions">
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
            <button type="button" class="submit-message-btn" @click="submitMessage">
              发表留言
            </button>
          </div>
        </div>
        <div v-if="messageImageUrl" class="upload-preview">
          <img :src="messageImageUrl" class="upload-preview-img" @click="previewImage(messageImageUrl)" />
          <button class="upload-preview-remove" @click="messageImageUrl = ''">×</button>
        </div>

        <div class="messages-title-row">
          <h3 class="messages-title">留言 ({{ topLevelMessages.length }})</h3>
          <button class="sort-btn" @click="toggleSort" title="切换排序">
            {{ sortOrder === 'desc' ? '↓ 最新' : '↑ 最早' }}
          </button>
        </div>

      <!-- 留言列表 -->
      <div class="messages-list">
        <div v-for="message in pagedMessages" :key="message.id" class="message-item">
          <div class="message-header">
            <img 
              v-if="parseUserData(message.用户数据)?.头像" 
              :src="parseUserData(message.用户数据)?.头像" 
              class="message-avatar" 
            />
            <img 
              v-else 
              class="message-avatar" 
              :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (parseUserData(message.用户数据)?.账号 || 'anonymous')" 
            />
            <span class="message-author">{{ parseUserData(message.用户数据)?.用户名 || parseUserData(message.用户数据)?.账号 || '匿名' }}</span>
            <span class="message-time">{{ formatTime(message.发送日期) }}</span>
            <button class="reply-btn" @click="toggleReplyTo(message)">回复</button>
            <button 
              v-if="isMessageOwner(message)" 
              class="message-delete-btn" 
              @click="deleteMessage(message)"
            >删除</button>
          </div>
          <p class="message-content" v-html="renderMessageContent(message.内容)"></p>
          <img v-if="message.附带的图片" :src="message.附带的图片" class="message-attached-image" @click="previewImage(message.附带的图片)" />
          
          <!-- 楼中楼回复输入框 -->
          <div v-if="replyingTo?.id === message.id" class="sub-reply-input" style="position:relative">
            <input 
              v-model="subReplyContent" 
              type="text"
              :placeholder="`回复 @${parseUserData(message.用户数据)?.用户名 || '匿名'}...`" 
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
            <button type="button" class="submit-reply-btn-small" @click="submitSubReply(message)">发送</button>
            <button type="button" class="cancel-reply-btn" @click="replyingTo = null">取消</button>
          </div>
          <div v-if="subReplyImageUrl && replyingTo?.id === message.id" class="upload-preview">
            <img :src="subReplyImageUrl" class="upload-preview-img" @click="previewImage(subReplyImageUrl)" />
            <button class="upload-preview-remove" @click="subReplyImageUrl = ''">×</button>
          </div>
          
          <!-- 子回复列表 -->
          <div v-if="getSubMessages(message.id).length > 0" class="sub-messages">
            <div v-for="subMessage in getSubMessages(message.id)" :key="subMessage.id" class="sub-message-item">
              <div class="sub-message-header">
                <img 
                  v-if="parseUserData(subMessage.用户数据)?.头像" 
                  :src="parseUserData(subMessage.用户数据)?.头像" 
                  class="sub-message-avatar" 
                />
                <img 
                  v-else 
                  class="sub-message-avatar" 
                  :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (parseUserData(subMessage.用户数据)?.账号 || 'anonymous')" 
                />
                <span class="sub-message-author">{{ parseUserData(subMessage.用户数据)?.用户名 || parseUserData(subMessage.用户数据)?.账号 || '匿名' }}</span>
                <span class="sub-message-time">{{ formatTime(subMessage.发送日期) }}</span>
                <button class="reply-btn-small" @click="toggleReplyTo(subMessage)">回复</button>
                <button 
                  v-if="isMessageOwner(subMessage)" 
                  class="message-delete-btn-small" 
                  @click="deleteMessage(subMessage)"
                >删除</button>
              </div>
              <p class="sub-message-content" v-html="renderMessageContent(subMessage.内容)"></p>
              <img v-if="subMessage.附带的图片" :src="subMessage.附带的图片" class="message-attached-image" @click="previewImage(subMessage.附带的图片)" />
              
              <!-- 子回复的回复输入框 -->
              <div v-if="replyingTo?.id === subMessage.id" class="sub-reply-input" style="position:relative">
                <input 
                  v-model="subReplyContent" 
                  type="text"
                  :placeholder="`回复 @${parseUserData(subMessage.用户数据)?.用户名 || '匿名'}...`" 
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
                <button type="button" class="submit-reply-btn-small" @click="submitSubReply(subMessage)">发送</button>
                <button type="button" class="cancel-reply-btn" @click="replyingTo = null">取消</button>
              </div>
              <div v-if="subReplyImageUrl && replyingTo?.id === subMessage.id" class="upload-preview">
                <img :src="subReplyImageUrl" class="upload-preview-img" @click="previewImage(subReplyImageUrl)" />
                <button class="upload-preview-remove" @click="subReplyImageUrl = ''">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">‹</button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="page-btn"
          :class="{ active: p === currentPage }"
          @click="goToPage(p)"
        >{{ p }}</button>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="nextPage">›</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { ElMessage } from "element-plus";
import { getBackgrounds, getMessages, addMessage, deleteData, query, triggerAiAutoReply } from "@/api/data";
import { uploadToPicUI } from "@/api/external";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const backgroundUrl = ref<string>("");
const messages = ref<Record<string, unknown>[]>([]);
const messageContent = ref("");
const subReplyContent = ref("");
const replyingTo = ref<Record<string, unknown> | null>(null);
const uploadingMain = ref(false);
const uploadingSub = ref(false);
const messageImageUrl = ref("");
const subReplyImageUrl = ref("");

// @AI 下拉菜单
const atDropdownTarget = ref<'main' | 'sub' | null>(null);

const toggleAtDropdown = (model: 'main' | 'sub') => {
  atDropdownTarget.value = atDropdownTarget.value === model ? null : model;
};

const selectAtItem = (model: 'main' | 'sub', type: string) => {
  const name = type === '对话' ? '智谱AI' : `智谱AI-${type}`;
  const text = `@${name} `;
  if (model === 'main') messageContent.value += text;
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
onBeforeUnmount(() => document.removeEventListener('click', closeDropdown));

// 排序
const sortOrder = ref<'asc' | 'desc'>('desc');
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  loadMessages();
};

// 分页
const pageSize = 10;
const currentPage = ref(1);

const topLevelMessages = computed(() => {
  return messages.value.filter(message => !message.父回复ID || message.父回复ID === 0);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(topLevelMessages.value.length / pageSize));
});

const pagedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return topLevelMessages.value.slice(start, end);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const prevPage = () => goToPage(currentPage.value - 1);
const nextPage = () => goToPage(currentPage.value + 1);

const getSubMessages = (parentId: string | number) => {
  const parentIdStr = String(parentId);
  return messages.value.filter(message => {
    const messageParentId = String(message.父回复ID);
    return messageParentId === parentIdStr;
  });
};

const toggleReplyTo = (message: Record<string, unknown>) => {
  if (replyingTo.value?.id === message.id) {
    replyingTo.value = null;
    subReplyContent.value = "";
  } else {
    replyingTo.value = message;
    subReplyContent.value = "";
  }
};

const isMessageOwner = (message: Record<string, unknown>): boolean => {
  if (!userStore.isLoggedIn) {
    return false;
  }
  
  const userData = parseUserData(message.用户数据);
  const messageAccount = userData?.账号 || userData?.account;
  const userAccount = userStore.userInfo?.account;
  
  return messageAccount === userAccount;
};

const deleteMessage = async (message: Record<string, unknown>) => {
  console.log('准备删除留言，留言数据:', message);
  
  if (!confirm('确定要删除这条留言吗？')) {
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录');
    return;
  }

  try {
    const messageId = message.id;
    console.log('使用的留言ID:', messageId);
    
    if (!messageId) {
      ElMessage.error('无法识别留言ID');
      return;
    }

    const where = `id = ${messageId}`;
    console.log('删除条件:', where);
    
    await deleteData({
      table: "留言板",
      where: where,
      uniqueId: userStore.userInfo.uniqueId,
    });

    ElMessage.success('删除成功');
    await loadMessages();
  } catch (error) {
    console.error('删除留言失败:', error);
    ElMessage.error('删除失败，请稍后重试');
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

const renderMessageContent = (content: string): string => {
  if (!content) return '';
  let html = content;
  html = html.replace(/@\S+/g, '<span class="at-mention">$&</span>');
  html = html.replace(/\n/g, '<br>');
  return html;
};

const previewImage = (url: string) => {
  window.open(url, '_blank');
};

const handleImageUpload = async (target: 'main' | 'sub') => {
  if (!userStore.isLoggedIn) {
    ElMessage.error('请先登录');
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
      const res: any = await uploadToPicUI({ file, album: '留言板图库' });
      const url = res?.data?.links?.url || res?.links?.url || res?.url || res?.data?.url;

      if (target === 'main') {
        messageImageUrl.value = url;
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

const submitMessage = async () => {
  if (!messageContent.value.trim() && !messageImageUrl.value) {
    ElMessage.error("请输入留言内容或上传图片");
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    return;
  }

  try {
    const userInfo = userStore.userInfo;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    console.log("提交留言数据:", {
      唯一ID: userInfo.uniqueId,
      内容: messageContent.value,
      附带的图片: messageImageUrl.value,
      发送日期: now,
    });
    
    await addMessage(userInfo.uniqueId, {
      唯一ID: userInfo.uniqueId,
      内容: messageContent.value,
      用户数据: JSON.stringify({
        账号: userInfo.account,
        头像: userInfo.avatar || "",
        用户名: userInfo.account,
      }),
      回复的对象数据: JSON.stringify({}),
      附带的图片: messageImageUrl.value,
      发送日期: now,
    });

    ElMessage.success("留言成功");
    const msgContent = messageContent.value;
    messageContent.value = "";
    messageImageUrl.value = "";
    await loadMessages();

    // 检测是否@了智谱AI并自动回复
    if (msgContent.includes("@智谱AI")) {
      // 直接查刚插入的消息ID
      let parentId: number | undefined;
      try {
        const res = await query({
          table: "留言板",
          fields: ["id"],
          where: `唯一ID = '${userInfo.uniqueId}'`,
          order: "id",
          sort: "desc",
          limit: 1,
          uniqueId: userInfo.uniqueId,
        });
        parentId = (res.data?.[0] as any)?.id;
      } catch {}
      await triggerAiAutoReply(msgContent, "留言板", {}, parentId);
      await loadMessages();
    }
  } catch (error) {
    console.error("发表留言失败:", error);
    ElMessage.error("发表留言失败，请稍后重试");
  }
};

const submitSubReply = async (parentMessage: Record<string, unknown>) => {
  if (!subReplyContent.value.trim() && !subReplyImageUrl.value) {
    ElMessage.error("请输入回复内容或上传图片");
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    return;
  }

  try {
    const userInfo = userStore.userInfo;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const parentUserName = parseUserData(parentMessage.用户数据)?.用户名 || parseUserData(parentMessage.用户数据)?.账号 || '匿名';
    
    let parentMessageId = parentMessage.id;
    if (parentMessage.父回复ID && parentMessage.父回复ID !== 0) {
      parentMessageId = parentMessage.父回复ID;
    }
    
    console.log("提交子回复数据:", {
      唯一ID: userInfo.uniqueId,
      内容: `@${parentUserName} ${subReplyContent.value}`,
      父回复ID: parentMessageId,
      附带的图片: subReplyImageUrl.value,
      发送日期: now,
    });
    
    await addMessage(userInfo.uniqueId, {
        唯一ID: userInfo.uniqueId,
        内容: `@${parentUserName} ${subReplyContent.value}`,
        用户数据: JSON.stringify({
          账号: userInfo.account,
          头像: userInfo.avatar || "",
          用户名: userInfo.account,
        }),
        回复的对象数据: JSON.stringify(parentMessage),
        附带的图片: subReplyImageUrl.value,
        父回复ID: parentMessageId,
        发送日期: now,
      });

    ElMessage.success("回复成功");
    const subContent = `@${parentUserName} ${subReplyContent.value}`;
    subReplyContent.value = "";
    subReplyImageUrl.value = "";
    replyingTo.value = null;
    await loadMessages();

    // 检测是否@了智谱AI并自动回复
    await triggerAiAutoReply(subContent, "留言板", parentMessage, parentMessageId as number);
    await loadMessages();
  } catch (error) {
    console.error("发表回复失败:", error);
    ElMessage.error("发表回复失败，请稍后重试");
  }
};

const loadMessages = async () => {
  try {
    const data = await getMessages(userStore.userInfo?.uniqueId || 'user_1779243581625437300', sortOrder.value);
    messages.value = data as Record<string, unknown>[];
  } catch (error) {
    console.log("获取留言失败");
  }
};

onMounted(async () => {
  await userStore.loadUserInfo();

  try {
    const bgData = await getBackgrounds("留言板") as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log("获取背景图失败");
  }

  await loadMessages();
});
</script>

<style scoped lang="scss">
/* ── 页面容器 ── */
.message-page {
  min-height: 100vh;
  position: relative;
}

/* ── 固定背景层 ── */
.message-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #1a1a2e;
  background-image: url('https://free.picui.cn/free/2026/05/25/6a13a55b2ebac.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

/* ── 顶部半高背景区 ── */
.message-hero {
  height: 50vh;
  min-height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin: 0;
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

.hero-subtitle {
  font-size: 1em;
  color: rgba(255, 255, 255, 0.8);
  margin: 10px 0 0;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
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

/* ── 底部内容区 ── */
.message-body {
  position: relative;
  z-index: 1;
  padding: 32px 10px 60px;
  min-height: 50vh;
  border-top: 2px solid rgba(231, 76, 60, 0.5);
  box-shadow: inset 0 8px 20px rgba(231, 76, 60, 0.08);
  outline: 3px solid rgba(255, 255, 255, 0.1);
  outline-offset: -3px;
}

.message-body::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  pointer-events: none;
  z-index: 1;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.message-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  margin: 0 auto;
  border-bottom: 1px solid #e8e8e8;
  background: #f7f7f7;
  max-width: 750px;
}

.message-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)),
    url('https://free.picui.cn/free/2026/05/26/6a152f8671ba7.png');
  background-size: 100% 100%;
  background-position: center;
  color: #333;
  min-height: 200px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #07c160;
    background:
      linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),
      url('https://free.picui.cn/free/2026/05/26/6a152f8671ba7.png');
    background-size: 100% 100%;
    background-position: center;
    box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1);
  }

  &::placeholder {
    color: #999;
    font-weight: 400;
  }
}

.message-input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  color: #576b95;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    color: #4a5a7f;
    background: rgba(87, 107, 149, 0.1);
    border-radius: 50%;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

/* ── 排序按钮 ── */
.messages-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.messages-title {
  margin: 0;
}
.messages-title-row {
  padding-right: 4px;
}
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

.submit-message-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-weight: 500;
  background: #07c160;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background: #06ad56;
  }

  &:active {
    background: #059e4c;
  }
}

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

.messages-title {
  margin: 0;
  padding: 15px 20px;
  color: #333;
  font-size: 1em;
  font-weight: 500;
  background: #f7f7f7;
  border-bottom: 1px solid #e8e8e8;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  background: #f9f9f9;
  border-top: 1px solid #e8e8e8;
  border-radius: 0 0 12px 12px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.page-btn.active {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: #fff;
  border-color: #ff6b6b;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.message-item {
  padding: 15px 20px;
  background: #fff;
  border-radius: 0;
  transition: all 0.2s;
  border: none;
  box-shadow: none;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:hover {
  background: #f9f9f9;
  border: none;
  box-shadow: none;
  transform: none;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.message-author {
  font-weight: 500;
  color: #576b95;
  font-size: 15px;
}

.message-time {
  color: #999;
  font-size: 13px;
  margin-left: auto;
}

.reply-btn {
  margin-left: 8px;
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #576b95;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s;

  &:hover {
    background: rgba(87, 107, 149, 0.1);
    color: #4a5a7f;
    transform: none;
    box-shadow: none;
  }
}

.message-delete-btn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
  }
}

.message-attached-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin: 8px 0 8px 50px;
  box-shadow: none;
  display: block;
  object-fit: cover;
  background: #f0f0f0;
  cursor: zoom-in;
  transition: opacity 0.2s;
  border: none;

  &:hover {
    opacity: 0.9;
  }
}

.message-content {
  color: #333;
  line-height: 1.6;
  margin: 0;
  padding-left: 50px;
  font-size: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.sub-reply-input {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  margin-left: 50px;
  align-items: center;
}

.reply-input-small {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #07c160;
    box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1);
  }
}

.image-upload-btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #576b95;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    color: #4a5a7f;
    background: rgba(87, 107, 149, 0.1);
    border-radius: 50%;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.submit-reply-btn-small {
  padding: 6px 16px;
  border-radius: 4px;
  font-weight: 500;
  background: #07c160;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;

  &:hover {
    background: #06ad56;
  }
}

.cancel-reply-btn {
  padding: 6px 16px;
  border-radius: 4px;
  background: transparent;
  color: #999;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;

  &:hover {
    background: #f5f5f5;
    color: #666;
  }
}

.sub-messages {
  margin-top: 12px;
  margin-left: 50px;
  padding-left: 12px;
  border-left: 1px solid #e8e8e8;
}

.sub-message-item {
  padding: 10px 0;
  background: transparent;
  border-radius: 0;
  margin-bottom: 8px;
  border: none;
  transition: all 0.2s;
}

.sub-message-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.sub-message-item:hover {
  border: none;
  transform: none;
}

.sub-message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.sub-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}

.sub-message-author {
  font-weight: 500;
  color: #576b95;
  font-size: 14px;
}

.sub-message-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.reply-btn-small {
  margin-left: 8px;
  padding: 3px 10px;
  border: none;
  background: transparent;
  color: #576b95;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  transition: all 0.2s;

  &:hover {
    background: rgba(87, 107, 149, 0.1);
    color: #4a5a7f;
  }
}

.message-delete-btn-small {
  padding: 3px 10px;
  border: none;
  background: transparent;
  color: #999;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
  }
}

.sub-message-content {
  color: #333;
  line-height: 1.5;
  margin: 0;
  padding-left: 40px;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.at-mention) {
  color: #64b5f6;
  font-weight: 600;
  background: rgba(100, 181, 246, 0.12);
  padding: 1px 4px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .message-hero {
    min-height: 240px;
  }

  .hero-title {
    font-size: 2em;
  }

  .content-wrapper {
    padding: 20px;
  }

  .message-item {
    padding: 16px;
  }

  .message-content {
    padding-left: 0;
    margin-top: 10px;
  }

  .message-attached-image {
    margin-left: 0;
  }

  .sub-messages {
    margin-left: 0;
    padding-left: 12px;
  }

  .sub-reply-input {
    margin-left: 0;
  }
}

/* ── @提及下拉 ── */
.at-dropdown {
  position: absolute;
  z-index: 1000;
  background: rgba(30, 30, 60, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  list-style: none;
  padding: 4px 0;
  margin: 0;
  min-width: 140px;
  max-height: 200px;
  overflow-y: auto;
  backdrop-filter: blur(12px);
}
.at-dropdown-item {
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  color: #e74c3c;
  font-weight: 500;
  transition: background 0.15s;
}
.at-dropdown-item:hover {
  background: rgba(231, 76, 60, 0.12);
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