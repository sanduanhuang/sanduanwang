<template>
  <div
    class="loading-gif-container"
    ref="containerRef"
    :style="{ right: containerRight + 'px' }"
    @mousedown="startDrag"
  >
    <div class="speech-bubble" v-if="showSpeech">
      <span class="speech-text">{{ currentSpeech }}</span>
      <span class="speech-tail"></span>
    </div>
    <img :src="gifUrl || defaultGif" alt="loading" class="loading-gif" draggable="false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  gifUrl?: string;
}>();

const defaultGif = 'https://free.picui.cn/free/2026/05/22/6a0f39f795874.gif';
const showSpeech = ref(false);
const currentSpeech = ref('');
const containerRight = ref(20);
const containerRef = ref<HTMLElement | null>(null);

const speeches = [
  '欢迎来到三段荒的小窝~',
  '今天也要元气满满哦！',
  '我是可爱的狐狸娘~',
  '主人，要摸摸耳朵吗？',
  '咕噜咕噜，好无聊啊...',
  '今天天气真好呢！',
  '来聊天吧~',
  '喵~(假装是猫)',
  '吃饭了吗？',
  '晚安，做个好梦~',
  '加油！你是最棒的！',
  '今天也要开心呀！',
];

let speechTimer: number | null = null;

const showRandomSpeech = () => {
  const randomIndex = Math.floor(Math.random() * speeches.length);
  currentSpeech.value = speeches[randomIndex];
  showSpeech.value = true;

  setTimeout(() => {
    showSpeech.value = false;
  }, 3000);
};

const startSpeechCycle = () => {
  const interval = Math.random() * 7000 + 3000;
  speechTimer = window.setTimeout(() => {
    showRandomSpeech();
    startSpeechCycle();
  }, interval);
};

// 拖拽逻辑
const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  const startX = e.clientX;
  const startRight = containerRight.value;

  const onDrag = (ev: MouseEvent) => {
    const dx = startX - ev.clientX;
    const newRight = Math.max(0, Math.min(window.innerWidth - 100, startRight + dx));
    containerRight.value = newRight;
  };

  const stopDrag = () => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.cursor = 'grabbing';
  document.body.style.userSelect = 'none';
};

onMounted(() => {
  setTimeout(() => {
    showRandomSpeech();
    startSpeechCycle();
  }, 2000);
});

onUnmounted(() => {
  if (speechTimer) {
    clearTimeout(speechTimer);
  }
});
</script>

<style scoped>
.loading-gif-container {
  position: fixed;
  bottom: 20px;
  z-index: 50;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: none;
}

.loading-gif-container:active {
  cursor: grabbing;
}

.loading-gif {
  width: 80px;
  height: auto;
  opacity: 1;
  transform: scale(1.5);
  pointer-events: none;
}

.speech-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  animation: fadeInUp 0.3s ease;
  margin-bottom: 10px;
  z-index: 10;
}

.speech-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.speech-tail {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: #ffffff;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
