<template>
  <div class="album-page">
    <div class="album-bg"></div>

    <!-- 顶部：半高背景区 -->
    <div class="album-hero" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-red">荒</span><span class="title-rest">の相册</span>
        </h1>
      </div>
    </div>

    <!-- 底部：内容区 -->
    <div class="album-body" :style="{ backgroundImage: `url(${backgroundUrl})` }">
      <div class="content-wrapper">
        <div v-if="albumsLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载相册中...</p>
        </div>

        <template v-else>
          <!-- 相册目录（始终显示） -->
          <div class="album-directory">
            <div class="directory-title">相册列表</div>
            <div
              v-for="(album, index) in albumList"
              :key="index"
              class="directory-item"
              :class="{ active: activeAlbumIndex === index }"
              @click="openAlbum(album)"
            >
              <span class="dir-dot"></span>
              <span class="dir-name">{{ album.name }}</span>
              <span class="dir-count">{{ album.image_num || 0 }}</span>
            </div>
          </div>

          <!-- 照片内容 -->
          <div class="album-main">
            <template v-if="!selectedAlbum">
              <div v-if="albumList.length === 0" class="empty-state">
                <el-empty description="暂无相册" />
              </div>
              <div v-else class="album-grid">
                <div 
                  v-for="(album, index) in albumList" 
                  :key="index" 
                  class="album-item"
                  @click="openAlbum(album)"
                >
                  <div class="album-cover">
                    <img 
                      v-if="albumCovers.get(album.name)" 
                      :src="albumCovers.get(album.name)" 
                      :alt="album.name" 
                    />
                    <div v-else class="album-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </div>
                  <div class="album-info">
                    <h3>{{ album.name }}</h3>
                    <p v-if="album.image_num !== undefined">{{ album.image_num }} 张图片</p>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="photo-header">
                <el-button @click="goBack" plain>
                  <el-icon><ArrowLeft /></el-icon>
                  返回相册
                </el-button>
                <h2>{{ selectedAlbum.name }}</h2>
              </div>
              <div v-if="photoList.length > 0" class="photo-grid">
                <div 
                  v-for="(photo, index) in photoList" 
                  :key="index" 
                  class="photo-item"
                >
                  <img :src="photo.url" alt="照片" @click="previewPhoto(photo.url)" />
                  <button
                    v-if="userStore.isAdmin"
                    class="photo-delete-btn"
                    title="删除"
                    @click.stop="deletePhoto(photo, index)"
                  >×</button>
                  <div class="photo-info">
                    <div class="photo-name">{{ photo.name || '未命名' }}</div>
                    <div class="photo-meta">
                      <span v-if="photo.size">{{ formatSize(photo.size) }}</span>
                      <span v-if="photo.width && photo.height">{{ photo.width }}×{{ photo.height }}</span>
                      <span v-if="photo.date">{{ formatDate(photo.date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <el-empty description="该相册暂无照片" />
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <el-image-viewer 
      v-if="showViewer" 
      :url-list="photoList.map(p => p.url)" 
      :initial-index="currentPhotoIndex"
      @close="showViewer = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture, ArrowLeft } from '@element-plus/icons-vue';
import { getBackgrounds, getAlbums } from '@/api/data';
import { getPicUIAlbum, deletePicUIImage } from '@/api/external';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const backgroundUrl = ref<string>('');
const albumList = ref<any[]>([]);
const selectedAlbum = ref<any>(null);
const photoList = ref<any[]>([]);
const showViewer = ref<boolean>(false);
const currentPhotoIndex = ref<number>(0);
const albumCovers = ref<Map<string, string>>(new Map());
const albumsLoading = ref(false);
const activeAlbumIndex = ref(-1);

const formatSize = (bytes: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
};

onMounted(async () => {
  await userStore.loadUserInfo();
  await userStore.refreshAdminStatus();

  try {
    const bgData = await getBackgrounds('相册') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log('获取背景图失败');
  }

  await loadAlbums();
});

const parseAlbumData = (picUIResponse: any, albumName: string) => {
  let imageCount = 0;
  let coverUrl = '';

  if (picUIResponse?.status === true) {
    let images: any[] = [];
    if (picUIResponse.data?.data) {
      images = picUIResponse.data.data;
    } else if (Array.isArray(picUIResponse.data)) {
      images = picUIResponse.data;
    }

    imageCount = images.length;
    if (imageCount > 0) {
      const firstImage = images[0];
      coverUrl = firstImage.links?.url || firstImage.url || '';
    }
  }

  return { name: albumName, image_num: imageCount, coverUrl };
};

const loadAlbums = async () => {
  albumsLoading.value = true;
  try {
    const albumData = await getAlbums() as any;
    
    let albumNames: string[] = [];
    
    if (Array.isArray(albumData)) {
      albumNames = albumData.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    } else if (albumData?.data && Array.isArray(albumData.data)) {
      albumNames = albumData.data.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    } else if (albumData?.rows && Array.isArray(albumData.rows)) {
      albumNames = albumData.rows.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    }
    
    if (albumNames.length === 0) {
      ElMessage.info('暂无相册');
      return;
    }

    // 并行加载所有相册信息
    const results = await Promise.allSettled(
      albumNames.map(name => getPicUIAlbum(name))
    );

    const newList: { name: string; image_num: number }[] = [];
    const newCovers = new Map<string, string>();

    results.forEach((result, index) => {
      const albumName = albumNames[index];
      if (result.status === 'fulfilled') {
        const parsed = parseAlbumData(result.value, albumName);
        newList.push({ name: parsed.name, image_num: parsed.image_num });
        if (parsed.coverUrl) {
          newCovers.set(parsed.name, parsed.coverUrl);
        }
      } else {
        newList.push({ name: albumName, image_num: 0 });
      }
    });

    albumList.value = newList;
    albumCovers.value = newCovers;
  } catch (error) {
    ElMessage.error('加载相册失败');
    console.error('加载相册错误:', error);
  } finally {
    albumsLoading.value = false;
  }
};

const openAlbum = async (album: any) => {
  selectedAlbum.value = album;
  activeAlbumIndex.value = albumList.value.findIndex(a => a.name === album.name);
  photoList.value = [];
  
  try {
    const response = await getPicUIAlbum(album.name) as any;
    console.log('相册响应数据:', response);
    
    if (response && response.status === true) {
      let images: any[] = [];
      
      if (response.data && response.data.data) {
        images = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        images = response.data;
      }
      
      photoList.value = images.map((item: any) => ({
         id: item.id || '',
         url: item.links?.url || item.url || '',
         name: item.name || item.filename || item.title || '',
         size: item.size || item.filesize || 0,
         width: item.width || item.w || 0,
         height: item.height || item.h || 0,
         date: item.date || item.created_at || item.uploaded_at || ''
       })).filter((item: any) => item.url);
      
      if (photoList.value.length === 0) {
        ElMessage.info('该相册暂无照片');
      }
    } else {
      ElMessage.error(response?.message || '加载相册失败');
    }
  } catch (error) {
    ElMessage.error('加载相册照片失败');
    console.error('加载相册错误:', error);
  }
};

const goBack = () => {
  selectedAlbum.value = null;
  activeAlbumIndex.value = -1;
  photoList.value = [];
};

const previewPhoto = (photoUrl: string) => {
  currentPhotoIndex.value = photoList.value.findIndex((p: any) => p.url === photoUrl);
  showViewer.value = true;
};

const deletePhoto = async (photo: any, index: number) => {
  if (!userStore.isAdmin) {
    ElMessage.error('仅管理员可删除图片');
    return;
  }
  try {
    await ElMessageBox.confirm(
      '确定要删除这张图片吗？删除后不可恢复。'+index,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await deletePicUIImage({
      imageId: photo.id,
    });

    photoList.value.splice(index, 1);

    // 更新相册计数
    const album = albumList.value.find(a => a.name === selectedAlbum.value.name);
    if (album && album.image_num > 0) {
      album.image_num--;
    }

    ElMessage.success('图片已删除');
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败：' + (err?.message || '未知错误'));
    }
  }
};
</script>

<style scoped>
/* ── 页面容器 ── */
.album-page {
  min-height: 100vh;
  position: relative;
}

/* ── 顶部半高背景区 ── */
.album-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #1a1a2e;
  background-image: url('https://free.picui.cn/free/2026/05/22/6a0fdf46f1b25.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
}

.album-hero {
  height: 40vh;
  min-height: 280px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: left;
  padding: 120px 40px 0 80px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3em;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: 4px;
  animation: titleFadeIn 1s ease-out;
}

.title-red {
  color: #e74c3c;
  font-size: 1.4em;
  display: inline-block;
  animation: titleSlideUp 0.8s ease-out forwards;
  opacity: 0;
}

.title-rest {
  font-size: 0.75em;
  display: inline-block;
  position: relative;
  top: -0.15em;
  animation: titleSlideUp 0.8s ease-out 0.3s forwards;
  opacity: 0;
}

@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── 底部内容区 ── */
.album-body {
  position: relative;
  z-index: 1;
  padding: 32px 10px 60px;
  min-height: 50vh;
  border-top: 2px solid rgba(231, 76, 60, 0.5);
  box-shadow: inset 0 8px 20px rgba(231, 76, 60, 0.08);
  outline: 3px solid rgba(255, 255, 255, 0.1);
  outline-offset: -3px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.album-body::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  pointer-events: none;
  z-index: 1;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 24px;
}

/* ── 相册目录 ── */
.album-directory {
  width: 140px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.album-directory .directory-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 10px;
  padding-left: 4px;
  letter-spacing: 2px;
}

.album-directory .directory-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.album-directory .directory-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.album-directory .directory-item.active {
  background: rgba(231, 76, 60, 0.2);
}

.album-directory .dir-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  transition: all 0.2s;
}

.album-directory .directory-item.active .dir-dot {
  background: #e74c3c;
}

.album-directory .dir-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-directory .directory-item.active .dir-name {
  color: #e74c3c;
  font-weight: 500;
}

.album-directory .dir-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.album-main {
  flex: 1;
  min-width: 0;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.5);
  margin: 12px 0 0;
  font-size: 14px;
}

.loading-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.album-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.album-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 3em;
}

.album-info {
  padding: 15px;
  text-align: center;
}

.album-info h3 {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1em;
}

.album-info p {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
}

.photo-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.photo-header h2 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.photo-grid {
  column-count: 4;
  column-gap: 15px;
}

.photo-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  break-inside: avoid;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.photo-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
}

.photo-item:hover .photo-delete-btn {
  opacity: 1;
}

.photo-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;
  line-height: 28px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.photo-delete-btn:hover {
  background: rgba(231, 76, 60, 0.85);
}

.photo-item img {
  width: 100%;
  display: block;
}

.photo-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 12px 12px;
  color: white;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-info {
  opacity: 1;
}

.photo-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

@media (max-width: 992px) {
  .album-hero {
    min-height: 280px;
  }
  .hero-title {
    font-size: 2.4em;
  }
  .album-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .photo-grid {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .album-hero {
    min-height: 240px;
  }
  .hero-title {
    font-size: 2em;
  }
  .album-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .photo-grid {
    column-count: 2;
  }
}

@media (max-width: 480px) {
  .album-hero {
    min-height: 200px;
  }
  .hero-title {
    font-size: 1.6em;
  }
  .album-grid {
    grid-template-columns: 1fr;
  }
  .photo-grid {
    column-count: 1;
  }
}
</style>