<template>
  <div 
    class="announcement-wrapper"
    :style="wrapperStyle"
  >
    <!-- 主容器 -->
    <div 
      class="announcement-panel" 
      :class="{ 'is-expanded': isExpanded }"
    >
      <!-- 头像按钮 -->
      <div 
        class="toggle-button" 
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
      >
        <img :src="avatarUrl" class="avatar-img" alt="头像" />
      </div>
      
      <!-- 展开的面板内容 -->
      <div class="panel-content-wrapper">
        <div class="panel-content">
          <div class="panel-header">
            <h3>作者介绍</h3>
            <button class="close-btn" @click.stop="isExpanded = false">
              <span class="close-icon">×</span>
            </button>
          </div>
          
          <div class="panel-body">
            <div class="author-card">
              <div class="author-avatar">
                <img :src="avatarUrl" alt="作者头像" />
              </div>
              <div class="author-info">
                <h4>三段荒</h4>
                <p class="author-title">一个热爱编程的开发者</p>
              </div>
            </div>
            
            <div class="bio-section">
              <h5>关于我</h5>
              <p>
                欢迎来到我的个人网站！我喜欢开发有趣的应用，分享技术文章，
                希望能在这里和大家一起学习成长。
              </p>
            </div>
            
            <div class="info-row">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ articleCount }}</div>
                  <div class="stat-label">文章</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ visitCount }}</div>
                  <div class="stat-label">访问</div>
                </div>
              </div>

              <div class="contact-section">
                <h5>联系方式</h5>
                <div class="contact-list">
                  <div class="contact-item" v-if="qqNumber">
                    <span class="contact-label">QQ</span>
                    <span class="contact-value">{{ qqNumber }}</span>
                  </div>
                  <div class="contact-item" v-if="bossEmail">
                    <span class="contact-label">邮箱</span>
                    <span class="contact-value">{{ bossEmail }}</span>
                  </div>
                  <div class="contact-item" v-if="wechatId">
                    <span class="contact-label">微信</span>
                    <span class="contact-value">{{ wechatId }}</span>
                  </div>
                  <div class="contact-item" v-if="!wechatId">
                    <span class="contact-label">微信</span>
                    <span class="contact-value">暂未提供</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import constant from "@/utils/constant";
import { query } from "@/api/data";

const qqNumber = constant.qqNumber || "";
const bossEmail = constant.bossEmail || "";
const wechatId = constant.wechatId || "";

const articleCount = ref(0);
const visitCount = ref('0');

const loadStats = async () => {
  try {
    const res = await query({
      table: "论坛",
      where: "",
      uniqueId: 'user_1779243581625437300',
    });
    if (res.success && Array.isArray(res.data)) {
      const myPosts = res.data.filter((p: any) => {
        try {
          const userInfo = typeof p.用户信息 === 'string' ? JSON.parse(p.用户信息) : p.用户信息;
          return userInfo?.账号 === '三段荒';
        } catch { return false; }
      });
      articleCount.value = myPosts.length;
      const totalVisits = myPosts.reduce((sum: number, p: any) => sum + (Number(p.阅读) || 0), 0);
      visitCount.value = totalVisits >= 1000 ? (totalVisits / 1000).toFixed(1) + 'k' : String(totalVisits);
    }
  } catch { /* ignore */ }
};

// 头像URL
const avatarUrl = "https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg";

// 展开状态
const isExpanded = ref(false);

// 拖动相关
const isDragging = ref(false);
const isPressing = ref(false);
const startY = ref(0);
const startTop = ref(0);
let pressTimer: number | null = null;
const DRAG_THRESHOLD = 10; // 拖动阈值（像素）
const PRESS_DELAY = 150; // 长按判定延迟（毫秒）

// 容器位置样式
const wrapperStyle = reactive({
  position: 'fixed',
  left: '0px',
  top: '200px',
  zIndex: '100'
});

// 鼠标按下
const onMouseDown = (e: MouseEvent) => {
  if (isExpanded.value) return; // 展开时不允许拖动
  
  isPressing.value = true;
  startY.value = e.clientY;
  startTop.value = parseFloat(wrapperStyle.top);
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', onGlobalMouseMove);
  document.addEventListener('mouseup', onGlobalMouseUp);
  
  // 设置延迟定时器，判断是点击还是拖动
  pressTimer = window.setTimeout(() => {
    // 如果在延迟期间移动了足够距离，已经被判定为拖动
    // 否则继续保持按压状态
  }, PRESS_DELAY);
};

// 全局鼠标移动
const onGlobalMouseMove = (e: MouseEvent) => {
  if (!isPressing.value) return;
  
  const deltaY = Math.abs(e.clientY - startY.value);
  
  // 如果移动距离超过阈值，判定为拖动
  if (deltaY >= DRAG_THRESHOLD && !isDragging.value) {
    isDragging.value = true;
    // 取消点击判定定时器
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }
  
  // 如果正在拖动，更新位置
  if (isDragging.value) {
    const delta = e.clientY - startY.value;
    let newTop = startTop.value + delta;
    
    // 限制拖动范围
    const maxTop = window.innerHeight - 60;
    newTop = Math.max(20, Math.min(newTop, maxTop));
    
    wrapperStyle.top = `${newTop}px`;
    wrapperStyle.transform = 'none';
  }
};

// 全局鼠标松开
const onGlobalMouseUp = () => {
  if (isDragging.value) {
    // 停止拖动，保存位置
    localStorage.setItem('announcementPosition', JSON.stringify({
      top: wrapperStyle.top,
      transform: wrapperStyle.transform
    }));
  } else if (isPressing.value && !isDragging.value) {
    // 如果不是拖动，判定为点击
    // 只有在没有移动的情况下才触发点击
    const deltaY = Math.abs(window.event?.clientY - startY.value || 0);
    if (deltaY < DRAG_THRESHOLD) {
      // 确保定时器已完成或被取消
      if (pressTimer) {
        // 定时器还没触发，说明是快速点击
        clearTimeout(pressTimer);
        pressTimer = null;
        handleToggle();
      }
    }
  }
  
  // 重置状态
  isDragging.value = false;
  isPressing.value = false;
  
  // 移除事件监听
  document.removeEventListener('mousemove', onGlobalMouseMove);
  document.removeEventListener('mouseup', onGlobalMouseUp);
};

// 鼠标离开按钮
const onMouseLeave = () => {
  if (isDragging.value) {
    // 拖动时离开，继续拖动
    return;
  }
  isPressing.value = false;
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

// 点击切换展开/收起
const handleToggle = () => {
  isExpanded.value = !isExpanded.value;
};

// 加载保存的位置
onMounted(() => {
  const saved = localStorage.getItem('announcementPosition');
  if (saved) {
    try {
      const pos = JSON.parse(saved);
      wrapperStyle.top = pos.top;
      wrapperStyle.transform = pos.transform;
    } catch (e) {
      console.error('加载位置失败', e);
    }
  }
  loadStats();
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onGlobalMouseMove);
  document.removeEventListener('mouseup', onGlobalMouseUp);
  if (pressTimer) {
    clearTimeout(pressTimer);
  }
});
</script>

<style scoped>
.announcement-wrapper {
  transition: transform 0.3s ease;
  display: block !important;
  visibility: visible !important;
}

.announcement-panel {
  display: flex;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 头像按钮样式 */
.toggle-button {
  position: relative;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-button:hover {
  transform: translateX(8px) scale(1.08);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.25),
    0 0 0 3px rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.35);
}

.toggle-button:active {
  transform: translateX(4px) scale(1.04);
}

.avatar-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 50%;
  pointer-events: auto !important;
}

/* 拖动状态样式 */
.toggle-button.dragging {
  cursor: grabbing !important;
  transform: translateX(4px);
}

/* 展开状态下的按钮样式 */
.announcement-panel.is-expanded .toggle-button {
  display: none;
}

/* 面板内容容器 */
.panel-content-wrapper {
  width: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.announcement-panel.is-expanded .panel-content-wrapper {
  width: 420px;
}

/* 面板内容 */
.panel-content {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 16px;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-icon {
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

/* 面板主体 */
.panel-body {
  padding: 24px 22px;
}

/* 作者卡片 */
.author-card {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.author-avatar {
  flex-shrink: 0;
}

.author-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.author-info h4 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.author-title {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 简介部分 */
.bio-section {
  margin-bottom: 24px;
}

.bio-section h5 {
  margin: 0 0 14px 0;
  font-size: 15px;
  font-weight: 600;
  color: #666;
}

.bio-section p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  text-align: justify;
}

/* 统计数据 */
.info-row {
  display: flex;
  gap: 12px;
}

.info-row .stats-grid {
  flex: 1;
}

.info-row .contact-section {
  flex: 1;
  margin-top: 0;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 26px;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

/* ── 联系方式 ── */
.contact-section {
  margin-top: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.contact-section h5 {
  font-size: 14px;
  color: #555;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-label {
  font-size: 13px;
  color: #999;
  min-width: 36px;
  font-weight: 500;
}

.contact-value {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}
</style>