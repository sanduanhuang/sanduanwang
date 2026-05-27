<template>
  <a :href="to" class="dropdown-item" @click="handleClick">
    {{ text }}
  </a>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps<{
  to: string;
  text: string;
}>();

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  router.push(props.to);
  document.dispatchEvent(new Event('click'));
};
</script>

<style scoped>
.dropdown-item {
  display: block;
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
</style>