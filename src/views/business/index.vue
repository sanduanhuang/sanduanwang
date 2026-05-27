<template>
  <div class="business-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="page-header">
      <h1>业务服务</h1>
      <p>提供专业的技术服务</p>
    </div>
    <div class="business-grid">
      <el-card class="business-card" @click="navigateTo('/business/website')">
        <div class="business-icon website-icon">🌐</div>
        <h3>网站开发</h3>
        <p>专业的网站设计与开发服务</p>
        <ul>
          <li>响应式设计</li>
          <li>企业官网</li>
          <li>电商平台</li>
        </ul>
      </el-card>
      <el-card class="business-card" @click="navigateTo('/business/miniprogram')">
        <div class="business-icon mini-icon">📱</div>
        <h3>小程序开发</h3>
        <p>微信小程序定制开发</p>
        <ul>
          <li>微信小程序</li>
          <li>支付宝小程序</li>
          <li>多端适配</li>
        </ul>
      </el-card>
      <el-card class="business-card" @click="navigateTo('/business/gamecreator')">
        <div class="business-icon game-icon">🎮</div>
        <h3>GameCreator</h3>
        <p>游戏开发与引擎定制</p>
        <ul>
          <li>H5游戏</li>
          <li>Unity开发</li>
          <li>游戏引擎</li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBackgrounds } from '@/api/data';

const router = useRouter();
const backgroundUrl = ref<string>('');

const navigateTo = (path: string) => {
  router.push(path);
};

onMounted(async () => {
  try {
    const bgData = await getBackgrounds('业务') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log('获取背景图失败');
  }
});
</script>

<style scoped>
.business-page {
  min-height: 100vh;
  padding: 60px 20px 0;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
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

.business-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.business-card {
  cursor: pointer;
  padding: 30px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.business-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.business-icon {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  margin-bottom: 20px;
}

.website-icon {
  background: rgba(16, 185, 129, 0.1);
}

.mini-icon {
  background: rgba(59, 130, 246, 0.1);
}

.game-icon {
  background: rgba(245, 158, 11, 0.1);
}

.business-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.business-card p {
  color: #666;
  margin-bottom: 15px;
}

.business-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.business-card li {
  color: #888;
  font-size: 0.9em;
  padding: 5px 0;
}
</style>
