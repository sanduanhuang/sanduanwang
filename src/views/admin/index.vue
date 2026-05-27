<template>
  <div class="admin-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="content-wrapper">
      <div class="page-header">
        <h1>管理中心</h1>
        <p>系统管理与数据维护</p>
      </div>
      <div class="admin-content">
        <el-card class="admin-card">
          <h3>欢迎使用管理中心</h3>
          <p>这里是系统管理员的工作区域，您可以管理网站的各项数据。</p>
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
    const bgData = await getBackgrounds('管理') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log('获取背景图失败');
  }
});
</script>

<style scoped>
.admin-page {
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

.admin-card {
  padding: 30px;
}

.admin-card h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.admin-card p {
  color: #666;
}
</style>
