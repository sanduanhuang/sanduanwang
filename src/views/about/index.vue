<template>
  <div class="about-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="content-wrapper">
      <div class="page-header">
        <h1>关于我们</h1>
        <p>了解三段网的故事</p>
      </div>
      <div class="about-content">
        <el-card class="about-card">
          <h3>我们是谁</h3>
          <p>三段网是一个致力于提供优质技术服务的平台。</p>
        </el-card>
        <el-card class="about-card">
          <h3>我们的使命</h3>
          <p>让技术服务更简单、更高效。</p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBackgrounds } from '@/api/data';

const backgroundUrl = ref<string>('');

onMounted(async () => {
  try {
    const bgData = await getBackgrounds('关于') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log('获取背景图失败');
  }
});
</script>

<style scoped>
.about-page {
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

.about-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-card {
  padding: 30px;
}

.about-card h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.about-card p {
  color: #666;
}
</style>