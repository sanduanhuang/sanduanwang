<template>
  <div class="upload-page">
    <!-- 顶部：半高背景区 -->
    <div class="upload-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">图</span><span class="title-rest">片上传</span>
        </h1>
      </div>
    </div>

    <!-- 底部：内容区 -->
    <div class="upload-body">
      <div class="content-wrapper">
        <!-- 相册选择与创建 -->
        <div class="album-section">
          <div class="section-row">
            <div class="section-label">选择相册</div>
            <div class="album-select-group">
              <el-select
                v-model="selectedAlbum"
                placeholder="请选择相册"
                class="album-select"
                size="large"
              >
                <el-option
                  v-for="album in albumList"
                  :key="album.name"
                  :label="album.name"
                  :value="album.name"
                />
              </el-select>
              <el-button type="primary" size="large" @click="showCreateAlbumDialog = true">
                + 新建相册
              </el-button>
            </div>
          </div>
          <div v-if="selectedAlbumInfo" class="album-info-bar">
            <span>当前相册：<strong>{{ selectedAlbumInfo.name }}</strong></span>
            <span>｜</span>
            <span>图片数量：<strong>{{ selectedAlbumInfo.image_num }}</strong></span>
            <el-button text type="primary" @click="refreshAlbumInfo">刷新</el-button>
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="upload-section">
          <div
            class="drop-zone"
            :class="{ 'drag-over': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*"
              class="file-input-hidden"
              @change="onFileChange"
            />
            <div class="drop-zone-content">
              <div class="upload-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p class="drop-zone-text">拖拽图片到此处，或点击选择</p>
              <p class="drop-zone-hint">支持 JPG / PNG / GIF / WebP 格式，可多选</p>
            </div>
          </div>
        </div>

        <!-- 已选文件列表 -->
        <div v-if="fileList.length > 0" class="file-list-section">
          <div class="file-list-header">
            <span>已选择 {{ fileList.length }} 个文件</span>
            <el-button text type="danger" @click="clearFiles">清空列表</el-button>
          </div>
          <div class="file-grid">
            <div
              v-for="(file, index) in fileList"
              :key="index"
              class="file-card"
            >
              <div class="file-preview">
                <img :src="file.preview" :alt="file.file.name" />
                <div v-if="file.status === 'uploading'" class="file-progress-overlay">
                  <el-progress type="circle" :percentage="file.progress" :width="50" :stroke-width="4" />
                </div>
                <div v-if="file.status === 'success'" class="file-status-success">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#07c160" stroke-width="2.5">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div v-if="file.status === 'error'" class="file-status-error">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#e74c3c" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>
              <div class="file-info">
                <p class="file-name" :title="file.file.name">{{ file.file.name }}</p>
                <p class="file-size">{{ formatFileSize(file.file.size) }}</p>
              </div>
              <button
                v-if="file.status !== 'uploading'"
                class="file-remove-btn"
                @click="removeFile(index)"
              >×</button>
            </div>
          </div>
          <div class="upload-actions">
            <el-button
              type="primary"
              size="large"
              :disabled="!selectedAlbum || uploadingCount > 0"
              :loading="uploadingCount > 0"
              @click="startUpload"
            >
              {{ uploadingCount > 0 ? `上传中 (${uploadedCount}/${fileList.length})` : '开始上传' }}
            </el-button>
          </div>
        </div>

        <!-- 上传结果 -->
        <div v-if="uploadResults.length > 0" class="result-section">
          <h3>上传结果</h3>
          <div class="result-list">
            <div
              v-for="(result, index) in uploadResults"
              :key="index"
              class="result-item"
              :class="result.success ? 'result-success' : 'result-error'"
            >
              <span class="result-icon">{{ result.success ? '✓' : '✗' }}</span>
              <span class="result-name">{{ result.name }}</span>
              <span class="result-msg">{{ result.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建相册对话框 -->
    <el-dialog v-model="showCreateAlbumDialog" title="新建相册" width="400px" :close-on-click-modal="false">
      <el-form :model="newAlbumForm" label-width="80px">
        <el-form-item label="相册名称">
          <el-input v-model="newAlbumForm.name" placeholder="请输入相册名称" maxlength="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateAlbumDialog = false">取消</el-button>
        <el-button type="primary" :loading="creatingAlbum" @click="createAlbum">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getBackgrounds } from '@/api/data';
import { getPicUIAlbums, getPicUIAlbum, uploadToPicUI } from '@/api/external';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const backgroundUrl = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// 相册相关
const albumList = ref<{ name: string; image_num: number }[]>([]);
const selectedAlbum = ref<string>('');
const selectedAlbumInfo = computed(() =>
  albumList.value.find(a => a.name === selectedAlbum.value) || null
);
const showCreateAlbumDialog = ref(false);
const creatingAlbum = ref(false);
const newAlbumForm = ref({ name: '' });

// 文件相关
interface UploadFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMsg?: string;
}

const fileList = ref<UploadFile[]>([]);
const uploadingCount = ref(0);
const uploadedCount = ref(0);
const uploadResults = ref<{ name: string; success: boolean; message: string }[]>([]);

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    addFiles(Array.from(files));
  }
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    addFiles(Array.from(input.files));
  }
  input.value = '';
};

const addFiles = (files: File[]) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    ElMessage.warning('请选择图片文件');
    return;
  }

  for (const file of imageFiles) {
    const exists = fileList.value.some(f => f.file.name === file.name && f.file.size === file.size);
    if (exists) continue;

    const preview = URL.createObjectURL(file);
    fileList.value.push({
      file,
      preview,
      status: 'pending',
      progress: 0,
    });
  }

  ElMessage.success(`已添加 ${imageFiles.length} 个文件`);
};

const removeFile = (index: number) => {
  const removed = fileList.value[index];
  if (removed) {
    URL.revokeObjectURL(removed.preview);
  }
  fileList.value.splice(index, 1);
};

const clearFiles = () => {
  fileList.value.forEach(f => URL.revokeObjectURL(f.preview));
  fileList.value = [];
  uploadResults.value = [];
};

// 上传
const requireAdmin = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return false;
  }
  if (!userStore.isAdmin) {
    ElMessage.error('仅管理员可执行此操作');
    return false;
  }
  return true;
};

const startUpload = async () => {
  if (!requireAdmin()) return;
  if (!selectedAlbum.value) {
    ElMessage.warning('请先选择相册');
    return;
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的图片');
    return;
  }

  uploadingCount.value = 0;
  uploadedCount.value = 0;
  uploadResults.value = [];
  const totalFiles = fileList.value.length;

  for (let i = 0; i < fileList.value.length; i++) {
    const item = fileList.value[i];
    if (item.status === 'success' || item.status === 'uploading') continue;

    uploadingCount.value++;
    item.status = 'uploading';
    item.progress = 0;

    try {
      const progressInterval = setInterval(() => {
        if (item.progress < 80) {
          item.progress += Math.random() * 15;
        }
      }, 300);

      const res: any = await uploadToPicUI({
        file: item.file,
        album: selectedAlbum.value,
      });

      clearInterval(progressInterval);

      const url = res?.data?.links?.url || res?.links?.url || res?.url || res?.data?.url;

      if (url) {
        item.status = 'success';
        item.progress = 100;
        uploadedCount.value++;
        uploadResults.value.push({
          name: item.file.name,
          success: true,
          message: '上传成功',
        });
      } else {
        throw new Error(res?.message || '上传返回数据异常');
      }
    } catch (err: any) {
      item.status = 'error';
      item.progress = 0;
      uploadResults.value.push({
        name: item.file.name,
        success: false,
        message: err?.message || '上传失败',
      });
    } finally {
      uploadingCount.value--;
    }
  }

  await refreshAlbumInfo();

  const successCount = uploadResults.value.filter(r => r.success).length;
  const failCount = uploadResults.value.filter(r => !r.success).length;

  // 自动移除上传成功的文件，只保留失败的供重试
  const failedFiles = fileList.value.filter(f => f.status === 'error');
  fileList.value.forEach(f => {
    if (f.status === 'success') URL.revokeObjectURL(f.preview);
  });
  fileList.value = failedFiles;

  if (successCount > 0 && failCount === 0) {
    ElMessage.success(`全部上传成功，共 ${successCount} 张`);
  } else if (successCount > 0 && failCount > 0) {
    ElMessage.warning(`成功 ${successCount} 张，失败 ${failCount} 张，已保留失败文件可重试`);
  } else if (failCount > 0) {
    ElMessage.error(`全部上传失败，共 ${failCount} 张`);
  }
};

// 相册操作
const loadAlbums = async () => {
  try {
    const res: any = await getPicUIAlbums();
    console.log('PicUI相册列表:', res);

    let albums: { name: string; image_num: number }[] = [];

    if (res?.status === true && res?.data) {
      const rawData = res.data;
      if (Array.isArray(rawData)) {
        albums = rawData.map((a: any) => ({
          name: a.name || a.title || '',
          image_num: a.image_num || a.count || 0,
        })).filter(a => a.name);
      } else if (rawData.data && Array.isArray(rawData.data)) {
        albums = rawData.data.map((a: any) => ({
          name: a.name || a.title || '',
          image_num: a.image_num || a.count || 0,
        })).filter(a => a.name);
      }
    }

    albumList.value = albums;
    if (albums.length === 0) {
      ElMessage.info('暂无相册，请先创建一个');
    }
  } catch (err) {
    console.error('获取相册列表失败:', err);
    ElMessage.error('获取相册列表失败');
  }
};

const refreshAlbumInfo = async () => {
  if (!selectedAlbum.value) return;
  try {
    const res: any = await getPicUIAlbum(selectedAlbum.value);
    if (res?.status === true && res?.data?.data) {
      const count = res.data.data.length;
      const album = albumList.value.find(a => a.name === selectedAlbum.value);
      if (album) {
        album.image_num = count;
      }
    }
  } catch {
    // ignore
  }
};

const createAlbum = async () => {
  if (!requireAdmin()) return;
  const name = newAlbumForm.value.name.trim();
  if (!name) {
    ElMessage.warning('请输入相册名称');
    return;
  }

  if (albumList.value.some(a => a.name === name)) {
    ElMessage.warning('相册名称已存在');
    return;
  }

  creatingAlbum.value = true;
  try {
    const emptyBlob = new Blob([''], { type: 'image/png' });
    const emptyFile = new File([emptyBlob], '__init__.png', { type: 'image/png' });

    await uploadToPicUI({
      file: emptyFile,
      album: name,
    });

    albumList.value.push({ name, image_num: 0 });
    selectedAlbum.value = name;
    showCreateAlbumDialog.value = false;
    newAlbumForm.value.name = '';
    ElMessage.success(`相册 "${name}" 创建成功`);
  } catch (err) {
    albumList.value.push({ name, image_num: 0 });
    selectedAlbum.value = name;
    showCreateAlbumDialog.value = false;
    newAlbumForm.value.name = '';
    ElMessage.success(`相册 "${name}" 已创建`);
  } finally {
    creatingAlbum.value = false;
  }
};

onMounted(async () => {
  await userStore.loadUserInfo();
  await userStore.refreshAdminStatus();

  try {
    const bgData = await getBackgrounds('图片上传') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch {
    console.log('获取背景图失败');
  }

  await loadAlbums();
});
</script>

<style scoped>
/* ── 页面容器 ── */
.upload-page {
  min-height: 100vh;
  position: relative;
}

/* ── 顶部半高背景区 ── */
.upload-hero {
  height: 50vh;
  min-height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 20px;
  width: 100%;
  max-width: 600px;
}

.hero-title {
  font-size: 3em;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: 4px;
}

.title-red {
  color: #e74c3c;
  font-size: 1.4em;
  display: inline-block;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

.title-rest {
  font-size: 0.75em;
  display: inline-block;
  position: relative;
  top: -0.15em;
}

.title-rest::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 3px;
  background: #000;
  border-radius: 2px;
  animation: linePulse 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { text-shadow: 0 0 8px rgba(231, 76, 60, 0.4); }
  100% { text-shadow: 0 0 20px rgba(231, 76, 60, 0.8), 0 0 40px rgba(231, 76, 60, 0.3); }
}

@keyframes linePulse {
  0% { width: 60%; left: 20%; }
  100% { width: 100%; left: 0; }
}

/* ── 底部内容区 ── */
.upload-body {
  background: #1a1a2e;
  background-image: url('https://free.picui.cn/free/2026/05/22/6a0fdf46f1b25.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding: 32px 20px 60px;
  min-height: 50vh;
  border-top: 2px solid rgba(231, 76, 60, 0.5);
  box-shadow: inset 0 8px 20px rgba(231, 76, 60, 0.08);
  outline: 3px solid rgba(255, 255, 255, 0.1);
  outline-offset: -3px;
  position: relative;
}

.upload-body::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  pointer-events: none;
  z-index: 1;
}

.content-wrapper {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 0;
  box-shadow: none;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* ── 相册选择 ── */
.album-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.section-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.section-label {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  white-space: nowrap;
}

.album-select-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.album-select {
  flex: 1;
  min-width: 200px;
}

.album-info-bar {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.album-info-bar strong {
  color: #333;
}

/* ── 拖拽上传区域 ── */
.upload-section {
  margin-bottom: 24px;
}

.drop-zone {
  border: 2px dashed #d0d5dd;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.drop-zone.drag-over {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.05);
}

.drop-zone-content {
  pointer-events: none;
}

.upload-icon {
  color: #98a2b3;
  margin-bottom: 16px;
  transition: color 0.3s;
}

.drop-zone:hover .upload-icon,
.drop-zone.drag-over .upload-icon {
  color: #667eea;
}

.drop-zone-text {
  font-size: 16px;
  color: #475467;
  margin: 0 0 8px;
  font-weight: 500;
}

.drop-zone-hint {
  font-size: 13px;
  color: #98a2b3;
  margin: 0;
}

.file-input-hidden {
  display: none;
}

/* ── 文件列表 ── */
.file-list-section {
  margin-bottom: 24px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.file-card {
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  overflow: hidden;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-progress-overlay,
.file-status-success,
.file-status-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.file-info {
  padding: 8px 10px;
}

.file-name {
  margin: 0;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin: 4px 0 0;
  font-size: 11px;
  color: #999;
}

.file-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.file-remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.upload-actions {
  text-align: center;
}

/* ── 上传结果 ── */
.result-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.result-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #333;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.result-success {
  background: rgba(7, 193, 96, 0.08);
  color: #07c160;
}

.result-error {
  background: rgba(231, 76, 60, 0.08);
  color: #e74c3c;
}

.result-icon {
  font-weight: 700;
  font-size: 16px;
}

.result-name {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-msg {
  font-size: 13px;
  opacity: 0.8;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .upload-hero {
    min-height: 240px;
  }

  .hero-title {
    font-size: 2em;
  }

  .content-wrapper {
    padding: 20px;
  }

  .section-row {
    flex-direction: column;
    align-items: stretch;
  }

  .album-select-group {
    flex-direction: column;
  }

  .album-select {
    width: 100%;
  }

  .file-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
