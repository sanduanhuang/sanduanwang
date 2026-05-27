<template>
  <div class="sponsor-wrapper">
    <div class="sponsor-trigger" @click="showDialog = true">
      <span class="sponsor-label">☕ 赞助</span>
      <div class="sponsor-thumbs">
        <img :src="images[0]" alt="赞助方式1" class="sponsor-thumb" />
        <img :src="images[1]" alt="赞助方式2" class="sponsor-thumb" />
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showDialog" class="sponsor-overlay" @click.self="showDialog = false">
        <div class="sponsor-dialog">
          <button class="sponsor-close" @click="showDialog = false">×</button>
          <h3 class="sponsor-title">☕ 赞助支持</h3>
          <div class="sponsor-images">
            <div v-for="(src, i) in images" :key="i" class="sponsor-img-wrap">
              <img :src="src" :alt="'赞助方式' + (i + 1)" class="sponsor-img" @click="previewIndex = i" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 图片预览 -->
    <Teleport to="body">
      <div v-if="previewIndex !== null" class="preview-overlay" @click.self="previewIndex = null">
        <button class="preview-close" @click="previewIndex = null">×</button>
        <img :src="images[previewIndex]" alt="预览" class="preview-img" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const images = [
  'https://free.picui.cn/free/2026/05/26/6a14cf3901a5c.png',
  'https://free.picui.cn/free/2026/05/26/6a14cf3901df6.jpg',
];

const showDialog = ref(false);
const previewIndex = ref<number | null>(null);
</script>

<style scoped>
.sponsor-wrapper {
  display: block;
  margin-top: 16px;
}

.sponsor-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s;
}

.sponsor-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.sponsor-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.sponsor-thumbs {
  display: flex;
  gap: 8px;
}

.sponsor-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* 弹窗 */
.sponsor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.sponsor-dialog {
  background: #1e1e1e;
  border-radius: 16px;
  padding: 32px;
  max-width: 700px;
  width: 90vw;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.sponsor-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28px;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1;
}

.sponsor-close:hover {
  color: #fff;
}

.sponsor-title {
  color: #fff;
  font-size: 18px;
  text-align: center;
  margin: 0 0 20px;
}

.sponsor-images {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.sponsor-img-wrap {
  cursor: pointer;
  transition: transform 0.2s;
}

.sponsor-img-wrap:hover {
  transform: scale(1.03);
}

.sponsor-img {
  width: 280px;
  height: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
}

/* 图片预览 */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30000;
  cursor: zoom-out;
}

.preview-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 36px;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 1;
}

.preview-close:hover {
  color: #fff;
}

.preview-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
