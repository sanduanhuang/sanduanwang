<template>
  <span class="site-name">
    <span class="red-part">三段荒</span>
    <span class="white-part">の窝</span>
  </span>
</template>

<script setup lang="ts">
// 可复用的站点名称组件
</script>

<style scoped>
.site-name {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-family);
  font-weight: bold;
  font-size: 1.5em;
}

.red-part {
  color: #ff4444; /* 红色 */
}

.white-part {
  color: #ffffff; /* 白色 */
}
</style>