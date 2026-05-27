<template>
  <div id="app">
    <NavBar />
    <Announcement />
    <router-view />
    <Footer />
    <ToastNotification ref="toastRef" />
    <LoadingGif />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import NavBar from "@/components/NavBar.vue";
import Announcement from "@/components/Announcement.vue";
import Footer from "@/components/Footer.vue";
import ToastNotification from "@/components/ToastNotification.vue";
import LoadingGif from "@/components/LoadingGif.vue";

const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null);

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
  toastRef.value?.showToast(message, type, duration);
};

provide('showToast', showToast);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none; /* 禁止选择 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
}

/* 允许输入框内容被复制 */
input, textarea, select, [contenteditable="true"] {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* 禁止拖拽图片 */
img {
  -webkit-user-drag: none; /* 禁止拖拽 */
  user-drag: none;
}

/* 编辑器内的图片允许点击交互 */
.editor-content img {
  pointer-events: auto;
}

body {
  line-height: 1.6;
  color: #333;
  background: #ffffff;
  min-height: 100vh;
}

/* 隐藏滚动条但保持滚动功能 */
::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

#app {
  min-height: 100vh;
}
</style>
