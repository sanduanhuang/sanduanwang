<template>
  <div class="service-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="content-wrapper">
      <div class="page-header">
        <h1>GameCreator</h1>
        <p>游戏开发与引擎定制服务</p>
      </div>
      <div class="service-content">
        <el-card class="service-card">
          <h3>服务内容</h3>
          <ul class="service-list">
            <li>
              <span class="service-icon">🖥️</span>
              <div class="service-info">
                <h4>H5游戏</h4>
                <p>基于HTML5的网页游戏开发</p>
              </div>
            </li>
            <li>
              <span class="service-icon">📦</span>
              <div class="service-info">
                <h4>Unity开发</h4>
                <p>Unity3D游戏引擎开发</p>
              </div>
            </li>
            <li>
              <span class="service-icon">⚙️</span>
              <div class="service-info">
                <h4>游戏引擎</h4>
                <p>定制化游戏引擎开发</p>
              </div>
            </li>
          </ul>
        </el-card>
        
        <el-card class="contact-card">
          <h3>联系我们</h3>
          <p>如有需求，请联系我们获取详细报价</p>
          <el-button type="primary" @click="showContact">立即咨询</el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getBackgrounds } from '@/api/data';

const backgroundUrl = ref<string>('');

const showContact = () => {
  ElMessage.info('联系方式开发中');
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
.service-page {
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

.service-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.service-card, .contact-card {
  padding: 30px;
}

.service-card h3, .contact-card h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.service-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.service-list li {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.service-list li:last-child {
  border-bottom: none;
}

.service-icon {
  width: 50px;
  height: 50px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  flex-shrink: 0;
}

.service-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.service-info p {
  margin: 0;
  color: #666;
  font-size: 0.95em;
}

.contact-card {
  text-align: center;
}

.contact-card p {
  color: #666;
  margin-bottom: 20px;
}
</style>
