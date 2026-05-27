<template>
  <div class="forum-my-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="content-wrapper">
      <div class="page-header">
        <h1>我的论坛</h1>
        <p>管理我的帖子和评论</p>
      </div>
      <div class="forum-content">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="80" :src="avatarUrl" />
            <div class="profile-info">
              <h3>{{ user.name }}</h3>
              <p>注册时间：{{ user.registerDate }}</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stats-card">
          <h3>统计信息</h3>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-icon">📝</span>
              <span class="stat-value">{{ user.posts }}</span>
              <span class="stat-label">帖子数</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💬</span>
              <span class="stat-value">{{ user.comments }}</span>
              <span class="stat-label">评论数</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">{{ user.likes }}</span>，
              <span class="stat-label">获赞数</span>
            </div>
          </div>
        </el-card>
        
        <el-card class="actions-card">
          <h3>快捷操作</h3>
          <div class="action-buttons">
            <el-button @click="goToWrite" class="action-btn">
              <span>✏️</span>
              <span>写文章</span>
            </el-button>
            <el-button @click="goToPosts" class="action-btn">
              <span>📄</span>
              <span>我的帖子</span>
            </el-button>
            <el-button @click="goToComments" class="action-btn">
              <span>💬</span>
              <span>我的评论</span>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBackgrounds } from '@/api/data';

const router = useRouter();
const backgroundUrl = ref<string>('');

const avatarUrl = 'https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg';

const user = {
  name: '用户昵称',
  registerDate: '2026-01-15',
  posts: 12,
  comments: 45,
  likes: 234
};

const goToWrite = () => {
  router.push('/forum/new');
};

const goToPosts = () => {
  router.push('/forum');
};

const goToComments = () => {
  router.push('/forum');
};

onMounted(async () => {
  try {
    const bgData = await getBackgrounds('论坛') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log('获取背景图失败');
  }
});
</script>

<style scoped>
.forum-my-page {
  min-height: 100vh;
  padding: 60px 20px 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
}

.content-wrapper {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 1.1em;
}

.forum-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card, .stats-card, .actions-card {
  padding: 30px;
}

.profile-card h3, .stats-card h3, .actions-card h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-info h3 {
  margin: 0 0 8px 0;
}

.profile-info p {
  margin: 0;
  color: #666;
  font-size: 0.95em;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 1.5em;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
}

.action-btn span:first-child {
  font-size: 1.5em;
}
</style>
