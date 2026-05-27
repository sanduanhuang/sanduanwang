<template>
  <div class="home-page">
    <div class="hero-section" :style="heroStyle">
      <!-- 弹幕容器 - 放在 hero-section 内部 -->
      <vue3-danmaku 
        class="danmaku-container" 
        v-model:danmus="danmus" 
        :config="danmakuConfig"
        ref="danmakuRef"
        :use-slot="true"
      >
        <template #dm="{ danmu }">
          <div class="custom-danmaku" :style="{ color: danmu.color || '#ffffff' }">
            <img v-if="danmu.avatar" :src="danmu.avatar" class="danmaku-avatar" />
            <span>{{ danmu.text }}</span>
          </div>
        </template>
      </vue3-danmaku>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="typing-title">
          <span class="site-name-container">
            <span 
              v-for="(char, index) in displayedChars" 
              :key="index"
              class="site-char"
              :class="char.color"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ char.text }}
            </span>
            <span class="cursor" :class="{ 'hidden': !showCursor }">|</span>
          </span>
        </h1>
        <div class="poetry">{{ poetry.content }} —— {{ poetry.author }}</div>
        
        <!-- 弹幕输入区 -->
        <div class="danmaku-input-area">
          <input 
            v-model="danmakuText" 
            type="text" 
            placeholder="输入弹幕内容..." 
            maxlength="50"
            @keyup.enter="sendDanmaku"
          />
          <input 
            type="color" 
            v-model="selectedColor" 
            class="color-picker"
          />
          <button @click="sendDanmaku" class="send-btn">发送</button>
        </div>
      </div>
    </div>
    <div class="main-content">
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from "vue";
import constant from "@/utils/constant";
import { sendDanmu, getDanmuList } from '@/api/user';
import { getBackgrounds } from '@/api/data';
import Vue3Danmaku from 'vue3-danmaku';
import 'vue3-danmaku/dist/vue3-danmaku.css';
import Footer from '@/components/Footer.vue';
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";

const siteName = constant.siteName || "三段荒の窝";
const backgroundUrl = ref<string | null>(null);
const poetry = ref<{ content: string; author: string }>({ content: "加载中...", author: "" });
const userStore = useUserStore();
const router = useRouter();
const showToast = inject('showToast') as (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;

// 打字机效果相关
const siteNameParts = [
  { text: "三", color: "red" },
  { text: "段", color: "red" },
  { text: "荒", color: "red" },
  { text: "の", color: "white" },
  { text: "窝", color: "white" }
];
const displayedChars = ref<{ text: string; color: string }[]>([]);
const showCursor = ref(true);

// 打字机效果
const typeWriter = () => {
  displayedChars.value = [];
  let index = 0;
  
  const typeInterval = setInterval(() => {
    if (index < siteNameParts.length) {
      displayedChars.value.push(siteNameParts[index]);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 150);
};

// 光标闪烁
const cursorInterval = setInterval(() => {
  showCursor.value = !showCursor.value;
}, 530);

// 弹幕相关
const danmakuText = ref<string>("");
const selectedColor = ref<string>("#ffffff"); // 默认白色
interface DanmakuItem {
  text: string;
  color?: string;
  avatar?: string;
}
const danmus = ref<DanmakuItem[]>([]); // 弹幕数组，支持颜色和头像
const danmakuRef = ref();
const danmakuConfig = ref({
  channels: 4, // 显示轨道数（弹幕变大后减少轨道数）
  speeds: 150, // 滚动速度（像素/秒，慢一点方便阅读）
  fontSize: 24, // 字体大小
  enableSend: false, // 禁用默认发送
  top: 80, // 弹幕轨道顶部偏移量（像素）- 上移
});

const heroStyle = computed(() => {
  if (backgroundUrl.value) {
    return {
      backgroundImage: `url(${backgroundUrl.value})`,
    };
  }
  return {};
});

// 获取今日诗词
const fetchPoetry = async () => {
  try {
    const response = await fetch(constant.jinrishici);
    const data = await response.json();
    poetry.value = {
      content: data.content || "诗词加载失败",
      author: data.author || ""
    };
  } catch (error) {
    console.error("获取诗词失败:", error);
    poetry.value = {
      content: "诗词加载失败",
      author: ""
    };
  }
};

// 发送弹幕
const sendDanmaku = async () => {
  if (!danmakuText.value.trim()) {
    showToast("请输入弹幕内容", 'info');
    return;
  }

  try {
    const userInfo = userStore.userInfo;
    const avatarUrl = userInfo?.avatar || constant.guestAvatar;
    const uniqueId = userInfo?.uniqueId || 'user_1779243581625437300';
    const account = userInfo?.account || '游客';
    
    console.log("发送弹幕 - uniqueId:", uniqueId);
    
    const result = await sendDanmu({
      弹幕内容: danmakuText.value,
      弹幕颜色: selectedColor.value,
      所属页面: 'home',
      唯一ID: uniqueId
    }, {
      uniqueId: uniqueId,
      account: account,
      avatar: avatarUrl
    });
    
    if (result.success) {
      showToast("弹幕发送成功！", 'success');
      danmus.value.push({
        text: danmakuText.value,
        color: selectedColor.value,
        avatar: avatarUrl
      });
      
      danmakuText.value = "";
      
      setTimeout(() => {
        danmakuRef.value?.play();
      }, 100);
    } else {
      console.error("弹幕发送失败:", result.message);
      // 如果是权限问题，提示重新登录
      if (result.message && result.message.includes("权限")) {
        showToast("登录信息失效，请重新登录", 'error');
        userStore.logout();
        router.push("/login");
      } else {
        showToast(result.message || "发送弹幕失败", 'error');
      }
    }
  } catch (error) {
    console.error("发送弹幕失败:", error);
    const err = error as { response?: { status?: number; data?: any }; message?: string };
    
    // 处理403权限错误
    if (err.response?.status === 403) {
      console.error("403错误：权限不足，可能是账号密码不正确或登录已过期");
      showToast("权限不足，请检查登录状态或重新登录", 'error');
      userStore.logout();
      router.push("/login");
    } else if (err.response?.status === 401) {
      console.error("401错误：未授权");
      showToast("登录信息已过期，请重新登录", 'error');
      userStore.logout();
      router.push("/login");
    } else {
      showToast("发送弹幕失败，请稍后重试", 'error');
    }
  }
};

// 加载历史弹幕
const loadDanmakuHistory = async () => {
  try {
    const userInfo = userStore.userInfo;
    const uniqueId = userInfo?.uniqueId || 'user_1779243581625437300';
    const result = await getDanmuList('home', '', uniqueId);

    if (result.success && result.data) {
      const dataArray = Array.isArray(result.data) ? result.data : [result.data];

      const historyDanmus: DanmakuItem[] = dataArray.map((item: any) => {
        if (!item) return null;

        const content = item.弹幕内容 ? String(item.弹幕内容) : '';
        const color = item.弹幕颜色 ? String(item.弹幕颜色) : '#ffffff';
        let avatar = '';

        if (item.账号数据) {
          try {
            const accountData = typeof item.账号数据 === 'string' ? JSON.parse(item.账号数据) : item.账号数据;
            avatar = accountData.头像 || '';
          } catch (_e) { /* ignore */ }
        }

        if (!content) return null;

        return { text: content, color, avatar } as DanmakuItem;
      }).filter((item: DanmakuItem | null): item is DanmakuItem => item !== null);

      // 只保留最近 50 条弹幕，按时间正序排列
      danmus.value = historyDanmus.slice(-50).reverse();
    }
  } catch (error) {
    console.error("加载历史弹幕失败:", error);
  }
};

onMounted(async () => {
  try {
    userStore.loadUserInfo(); // 确保用户信息已加载
    // 获取背景图
    try {
      const bgData = await getBackgrounds("首页") as { url: string };
      if (bgData && bgData.url) {
        backgroundUrl.value = bgData.url;
      }
    } catch (bgError) {
      console.log("获取背景图失败，使用默认背景");
    }
    await fetchPoetry(); // 获取诗词
    await loadDanmakuHistory(); // 加载历史弹幕
    typeWriter(); // 启动打字机效果
  } catch (error) {
    console.error("获取数据失败:", error);
  }
});

// 清理定时器
import { onUnmounted } from "vue";
onUnmounted(() => {
  clearInterval(cursorInterval);
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.hero-section {
  position: relative;
  z-index: 1; /* 背景层 */
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1; /* 确保英雄区域层级 */
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(255, 255, 255, 1) 100%
  );
  z-index: 20; /* 在弹幕之上 */
}

.hero-content {
  position: relative;
  z-index: 9999 !important; /* 确保在最顶层 */
  text-align: center;
  padding: 0 20px;
}

/* 确保 hero-content 的所有子元素都在最顶层 */
.hero-content * {
  position: relative !important;
  z-index: inherit !important;
}

.hero-content h1 {
  font-size: 3.5em;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.welcome-text {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: welcomeGlow 2s ease-in-out infinite;
}

.site-name-container {
  display: flex;
  align-items: center;
  gap: 2px;
}

.site-char {
  display: inline-block;
  font-size: 1.2em;
  font-weight: 700;
  animation: charPop 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(-10px) scale(0.8);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.site-char.red {
  color: #ff6b6b;
}

.site-char.white {
  color: #ffffff;
}

.cursor {
  color: #ff6b6b;
  font-weight: bold;
  transition: opacity 0.1s ease;
}

.cursor.hidden {
  opacity: 0;
}

@keyframes charPop {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
    filter: blur(4px);
  }
  50% {
    opacity: 1;
    transform: translateY(5px) scale(1.1);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes cursorBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes welcomeGlow {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
  }
  50% {
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 107, 107, 0.8));
  }
}

.subtitle {
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.3);
}

.poetry {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  margin: 20px auto 0;
  font-style: italic;
  line-height: 1.6;
}

.danmaku-input-area {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.danmaku-input-area input[type="text"] {
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 25px;
  width: 280px;
  font-size: 15px;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.danmaku-input-area input[type="text"]:focus {
  border-color: rgba(255, 68, 68, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
  background: #ffffff;
}

.danmaku-input-area input[type="text"]::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.danmaku-input-area input[type="color"] {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  max-width: 44px;
  max-height: 44px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  padding: 3px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.danmaku-input-area input[type="color"]:hover {
  transform: scale(1.1);
  border-color: rgba(255, 68, 68, 0.8);
}

.danmaku-input-area input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.danmaku-input-area input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.danmaku-input-area .send-btn {
  padding: 8px 20px;
  background: linear-gradient(45deg, var(--red), #9b59b6);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.danmaku-input-area .send-btn:hover {
  opacity: 0.9;
}

.danmaku-container {
  position: absolute !important;
  top: 60px !important; /* 上移，更靠近顶部 */
  left: 0 !important;
  width: 100% !important;
  height: calc(100% - 60px) !important;
  pointer-events: none !important;
  z-index: 10 !important;
  overflow: hidden !important;
}

/* 使用 :deep 强制穿透组件样式 */
:deep(.vue-danmaku),
:deep(.vue-danmaku *),
:deep(.danmus),
:deep(.danmus *),
:deep(.dm),
:deep(.dm *),
.vue-danmaku,
.vue-danmaku *,
.danmaku-container,
.danmaku-container * {
  z-index: 10 !important;
}

/* 自定义弹幕样式 */
.custom-danmaku {
  display: inline-flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 10px 20px 10px 10px !important;
  background: rgba(0, 0, 0, 0.65) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 30px !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
  white-space: nowrap !important;
  max-width: 500px !important;
  overflow: hidden !important;
  font-size: 20px !important;
  font-weight: 500 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6) !important;
  line-height: 1.5 !important;
}

.danmaku-avatar {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  flex-shrink: 0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

/* 弹幕项样式 - 黑色底半圆透明玻璃遮罩 */
.vue-danmaku .danmus .dm .danmaku-item {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 14px 6px 6px !important;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
  white-space: nowrap !important;
  font-size: 14px !important;
  color: #fff !important;
  line-height: 14px !important;
  max-width: 400px !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  min-width: auto !important;
}

/* 弹幕头像 */
.vue-danmaku .danmus .dm .danmaku-item .danmaku-avatar {
  width: 20px !important;
  height: 20px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
}

/* 弹幕文字 */
.vue-danmaku .danmus .dm .danmaku-item span {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
  color: inherit !important;
}

.main-content {
  display: none;
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh; /* 移动端也至少占据全屏高度 */
    padding-top: 60px;
  }

  .hero-content {
    margin-top: -60px;
  }

  .hero-content h1 {
    font-size: 2em;
  }

  .subtitle {
    font-size: 1.1em;
  }

  .poetry {
    font-size: 1em;
    margin: 15px auto 0;
  }

  .danmaku-input-area {
    flex-direction: column;
    gap: 10px;
  }

  .danmaku-input-area input[type="text"] {
    width: 200px;
  }

  .main-content {
    display: none;
  }
}
</style>