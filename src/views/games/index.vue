<template>
  <div class="rank-page" :style="pageBgStyle">
    <div class="page-overlay"></div>

    <div class="container">
      <!-- 评级行 -->
      <div class="ranking-container">
        <div class="tier" v-for="(tier, tIdx) in tiers" :key="tier.id">
          <div class="tier-label" :style="{ background: tier.color }" @click="toggleTierActive(tIdx)">
            <div class="tier-actions" v-show="tier.active">
              <input class="color-input" type="color" v-model="tier.color" @click.stop />
              <button class="tier-del" @click.stop="removeTier(tIdx)">×</button>
            </div>
            <span
              class="tier-name"
              :contenteditable="tier.editing"
              @dblclick="startEdit(tIdx)"
              @blur="finishEdit(tIdx, $event)"
              @keydown.enter.prevent="finishEdit(tIdx, $event)"
            >{{ tier.name }}</span>
          </div>
          <div
            class="tier-content"
            @dragover.prevent
            @drop="onTierDrop($event, tIdx)"
          >
            <div
              v-for="(item, iIdx) in tier.items"
              :key="item.id"
              class="image-item"
              draggable="true"
              @dragstart="onImgDragStart($event, tIdx, iIdx)"
              @click="removeItem(tIdx, iIdx)"
            >
              <img :src="item.url" :alt="item.name" />
              <span class="item-name">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="image-gallery">
        <div class="gallery-header">
          <span class="gallery-title">📦 预选区</span>
          <small class="gallery-hint">拖拽图片到上方评级中</small>
        </div>
        <div class="gallery-items" @dragover.prevent @drop="onGalleryDrop">
          <div class="upload-btn" @click="triggerUpload">
            <span>+</span>
            <small>上传</small>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            style="display:none"
            @change="onUpload"
          />

          <div
            v-for="img in poolImages"
            :key="img.id"
            class="gallery-img"
            draggable="true"
            @dragstart="onPoolDragStart($event, img)"
          >
            <img :src="img.url" :alt="img.name" />
            <span class="gallery-img-name">{{ img.name }}</span>
          </div>

          <div
            class="delete-zone"
            @dragover.prevent
            @drop="onDeleteDrop"
          >
            🗑️
          </div>
        </div>

        <div class="button-container">
          <button class="add-tier-btn" @click="addTier">+ 添加评级</button>
          <button class="export-btn" @click="exportAsImage">📷 导出图片</button>
          <button class="reset-tier-btn" @click="resetRank">↻ 重置排行榜</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getBackgrounds } from '@/api/data';
import html2canvas from 'html2canvas';

interface ImgItem {
  id: string;
  url: string;
  name: string;
}

interface Tier {
  id: string;
  name: string;
  color: string;
  items: ImgItem[];
  active: boolean;
  editing: boolean;
}

const backgroundUrl = ref('');
const pageBgStyle = ref({});
const fileInput = ref<HTMLInputElement>();
const dragData = ref<{ tIdx: number; iIdx: number } | null>(null);
const poolImages = ref<ImgItem[]>([]);
const poolDragImg = ref<ImgItem | null>(null);

const tiers = reactive<Tier[]>([
  { id: 't1', name: '夯', color: '#e74d5a', items: [], active: false, editing: false },
  { id: 't2', name: '顶级', color: '#ff9f43', items: [], active: false, editing: false },
  { id: 't3', name: '人上人', color: '#5a61e7', items: [], active: false, editing: false },
  { id: 't4', name: 'NPC', color: '#2ed573', items: [], active: false, editing: false },
  { id: 't5', name: '拉完了', color: '#747d8c', items: [], active: false, editing: false },
]);

let imgIdCounter = 0;

function triggerUpload() {
  fileInput.value?.click();
}

function onUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  for (const file of Array.from(files)) {
    const id = 'img_' + Date.now() + '_' + (imgIdCounter++);
    const url = URL.createObjectURL(file);
    poolImages.value.push({ id, url, name: file.name });
  }
  ElMessage.success(`已上传 ${files.length} 张图片`);
  (e.target as HTMLInputElement).value = '';
}

function addTier() {
  const colors = ['#a55eea', '#45aaf2', '#fd9644', '#20bf6b', '#fc5c65', '#4b7bec'];
  const names = ['S级', 'A级', 'B级', 'C级', 'D级', 'E级'];
  const idx = tiers.length % colors.length;
  tiers.push({
    id: 't_' + Date.now(),
    name: names[idx],
    color: colors[idx],
    items: [],
    active: false,
    editing: false,
  });
}

function toggleTierActive(tIdx: number) {
  tiers[tIdx].active = !tiers[tIdx].active;
}

function startEdit(tIdx: number) {
  tiers[tIdx].editing = true;
}

function finishEdit(tIdx: number, e: FocusEvent | KeyboardEvent) {
  const el = e.target as HTMLElement;
  const text = el.textContent?.trim() || '未命名';
  tiers[tIdx].name = text;
  tiers[tIdx].editing = false;
}

function removeTier(tIdx: number) {
  if (tiers.length <= 2) {
    ElMessage.warning('至少保留两个评级');
    return;
  }
  const removed = tiers.splice(tIdx, 1)[0];
  // 把删除评级中的图片移到下一个评级
  if (removed.items.length > 0 && tiers.length > 0) {
    const targetIdx = Math.min(tIdx, tiers.length - 1);
    tiers[targetIdx].items.push(...removed.items);
    ElMessage.info(`已将 ${removed.items.length} 张图片移至下一评级`);
  }
}

function removeItem(tIdx: number, iIdx: number) {
  tiers[tIdx].items.splice(iIdx, 1);
}

function resetRank() {
  for (const tier of tiers) {
    tier.items = [];
  }
  poolImages.value = [];
  ElMessage.success('已重置排行榜');
}

// ── 拖拽 ──
function onImgDragStart(e: DragEvent, tIdx: number, iIdx: number) {
  dragData.value = { tIdx, iIdx };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'tier');
  }
}

function onPoolDragStart(e: DragEvent, img: ImgItem) {
  poolDragImg.value = img;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'pool');
  }
}

function onTierDrop(e: DragEvent, targetTierIdx: number) {
  const type = e.dataTransfer?.getData('text/plain');
  if (type === 'pool' && poolDragImg.value) {
    tiers[targetTierIdx].items.push({ ...poolDragImg.value });
    poolImages.value = poolImages.value.filter(i => i.id !== poolDragImg.value!.id);
    poolDragImg.value = null;
    return;
  }
  if (!dragData.value) return;
  const { tIdx, iIdx } = dragData.value;
  const item = tiers[tIdx].items.splice(iIdx, 1)[0];
  if (item) {
    tiers[targetTierIdx].items.push(item);
  }
  dragData.value = null;
}

function onGalleryDrop(e: DragEvent) {
  if (dragData.value) {
    const { tIdx, iIdx } = dragData.value;
    const item = tiers[tIdx].items.splice(iIdx, 1)[0];
    if (item) {
      poolImages.value.push(item);
    }
    dragData.value = null;
  }
}

function onDeleteDrop(e: DragEvent) {
  if (!dragData.value) return;
  const { tIdx, iIdx } = dragData.value;
  tiers[tIdx].items.splice(iIdx, 1);
  dragData.value = null;
  ElMessage.info('已删除图片');
}

function exportAsImage() {
  const el = document.querySelector('.ranking-container') as HTMLElement;
  if (!el) return;
  ElMessage.info('正在生成图片...');
  html2canvas(el, {
    backgroundColor: '#2d2d2d',
    scale: 2,
    useCORS: true,
    allowTaint: false,
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `从夯到拉排行_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    ElMessage.success('图片已导出');
  }).catch(() => {
    ElMessage.error('导出失败');
  });
}

onMounted(async () => {
  try {
    const bgData = await getBackgrounds('从夯到拉排行') as { url: string };
    if (bgData && bgData.url) {
      pageBgStyle.value = { backgroundImage: `url(${bgData.url})` };
    }
  } catch {
    console.log('获取背景图失败');
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.rank-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  padding: 80px 20px 20px;
  display: flex;
  justify-content: center;
}

.page-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
}

/* ── 排行行 ── */
.ranking-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tier {
  display: flex;
  min-height: 100px;
}

.tier-label {
  width: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border-radius: 10px 0 0 10px;
  position: relative;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
  min-height: 100px;
}

.tier-label:hover {
  opacity: 0.9;
}

.tier-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-input {
  width: 22px;
  height: 22px;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-input::-webkit-color-swatch {
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 4px;
}

.tier-del {
  background: rgba(0,0,0,0.2);
  border: none;
  color: rgba(255,255,255,0.6);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tier-del:hover {
  background: rgba(0,0,0,0.4);
  color: #fff;
}

.tier-name {
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  outline: none;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 40px;
}

.tier-name:focus {
  background: rgba(255,255,255,0.15);
}

.tier-content {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 2px dashed rgba(255,255,255,0.1);
  border-left: none;
  border-radius: 0 10px 10px 0;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  min-height: 100px;
  transition: background 0.2s;
}

.tier-content:hover {
  background: rgba(255,255,255,0.08);
}

/* ── 图片项 ── */
.image-item {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  position: relative;
  border: 2px solid rgba(255,255,255,0.15);
  transition: all 0.2s;
  background: #333;
  flex-shrink: 0;
}

.image-item:hover {
  border-color: rgba(255,255,255,0.4);
  transform: scale(1.03);
}

.image-item:active {
  cursor: grabbing;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-item .item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: rgba(255,255,255,0.8);
  font-size: 10px;
  padding: 2px 4px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

/* ── 底部操作区 ── */
.image-gallery {
  margin-top: 16px;
  padding: 16px;
  background: rgba(45,45,45,0.9);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.gallery-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.gallery-title {
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  font-weight: 600;
}

.gallery-hint {
  color: rgba(255,255,255,0.3);
  font-size: 12px;
}

.gallery-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.5);
  font-size: 24px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.upload-btn:hover {
  border-color: rgba(255,255,255,0.4);
  color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.05);
}

.upload-btn small {
  font-size: 11px;
  margin-top: 2px;
}

.gallery-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  position: relative;
  border: 2px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
  background: #333;
  flex-shrink: 0;
}

.gallery-img:hover {
  border-color: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.gallery-img:active {
  cursor: grabbing;
}

.gallery-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-img-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: rgba(255,255,255,0.7);
  font-size: 9px;
  padding: 1px 4px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.delete-zone {
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(231,76,60,0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(231,76,60,0.5);
  font-size: 24px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-zone:hover {
  border-color: rgba(231,76,60,0.6);
  background: rgba(231,76,60,0.1);
  color: rgba(231,76,60,0.8);
}

.button-container {
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
}

.add-tier-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(68,68,68,0.8);
  color: rgba(255,255,255,0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.add-tier-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.reset-tier-btn {
  padding: 10px 20px;
  border: none;
  background: rgba(220,53,69,0.8);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.reset-tier-btn:hover {
  background: rgba(220,53,69,1);
}

.export-btn {
  padding: 10px 20px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(68,68,68,0.8);
  color: rgba(255,255,255,0.8);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.export-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .rank-page {
    padding: 10px;
  }
  .tier-label {
    width: 80px;
    font-size: 12px;
    padding: 6px;
    writing-mode: vertical-lr;
  }
  .tier {
    min-height: 80px;
  }
  .tier-content {
    min-height: 80px;
    padding: 4px;
    gap: 4px;
  }
  .image-item {
    width: 60px;
    height: 60px;
  }
  .image-gallery {
    flex-wrap: wrap;
  }
  .upload-btn, .delete-zone {
    width: 70px;
    height: 70px;
    font-size: 20px;
  }
}
</style>
