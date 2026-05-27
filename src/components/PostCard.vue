<template>
  <div class="post-item" @click="$emit('click')">
    <div class="post-container">
      <img v-if="post.封面" :src="post.封面" alt="帖子封面" class="post-cover" />
      <div class="post-info">
        <div class="post-title-row">
          <h3>{{ post.标题 }}</h3>
          <span class="post-time">{{ formatTime(post.创建时间) }}</span>
        </div>
        <div v-if="post.标签 && post.标签.length" class="post-tags">
          <span
            v-for="tag in post.标签"
            :key="getTagName(tag) || String(tag)"
            class="post-tag"
            :style="{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: getTagColor(tag) }"
          >
            {{ getTagName(tag) || tag }}
          </span>
        </div>
        <div class="post-meta">
          <span class="meta-author">
            <img
              :src="post.用户信息?.头像 || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (post.用户信息?.账号 || 'anonymous')"
              class="meta-avatar"
            />
            {{ post.用户信息?.用户名 || post.用户信息?.账号 || '匿名' }}
          </span>
          <span v-if="post.分类" class="meta-category">{{ post.分类 }}</span>
          <span class="meta-views">👁️ {{ post.阅读 || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Forum } from "@/types";

defineProps<{
  post: Forum
}>()

defineEmits<{
  click: []
}>()

function getTagName(tag: unknown): string {
  return typeof tag === 'string' ? tag : ((tag as Record<string, unknown>)?.名称 as string) || ''
}

function getTagColor(tag: unknown): string {
  return ((tag as Record<string, unknown>)?.代表颜色 as string) || '#667eea'
}

const formatTime = (timeStr: string): string => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.post-item {
  padding: 0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  height: fit-content;
  overflow: hidden;
  /* 独立合成层，减少 hover 时的重绘 */
  will-change: transform;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  /* hover 只改变 transform 和 opacity，不触发重绘 */
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.post-cover {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  display: block;
}

.post-item:hover .post-cover {
  filter: brightness(1.05);
  transition: filter 0.3s ease;
}

.post-container {
  padding: 14px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.post-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0;
}

.post-time {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.75em;
  white-space: nowrap;
  flex-shrink: 0;
}

.post-info h3 {
  margin: 0;
  min-width: 0;
  color: #fff;
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-tag {
  padding: 3px 12px;
  font-size: 12px;
  border: 2px solid;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
  cursor: default;
}

.post-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 4px;
}

.post-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-author {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.82em !important;
  font-weight: 500 !important;
  gap: 6px !important;
}

.meta-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.meta-category {
  color: #5fa8d3 !important;
  font-size: 0.75em !important;
  background: rgba(95, 168, 211, 0.12) !important;
  padding: 1px 8px !important;
  border-radius: 4px !important;
  font-weight: 500 !important;
}

.meta-views {
  color: rgba(255, 255, 255, 0.35) !important;
  font-size: 0.75em !important;
  margin-left: auto !important;
}
</style>
