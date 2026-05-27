<template>
  <div class="tool-page" :style="pageBgStyle">
    <div class="page-overlay"></div>

    <!-- 标题 -->
    <div v-if="!selectedTool" class="tool-header">
      <h1 class="hero-title">
        <span class="title-char" style="animation-delay:0.05s">工</span>
        <span class="title-char" style="animation-delay:0.15s">具</span>
        <span class="title-char" style="animation-delay:0.25s">中</span>
        <span class="title-char" style="animation-delay:0.35s">心</span>
      </h1>
    </div>

    <!-- 工具卡片列表 -->
    <div
      v-if="!selectedTool"
      class="tool-scroll-wrap"
      ref="scrollWrapRef"
      @scroll="onScroll"
      @mousedown="onDragStart"
      @mousemove="onDragMove"
      @mouseup="onDragEnd"
      @mouseleave="onDragEnd"
    >
      <div class="tool-grid" ref="toolGridRef">
        <template v-for="i in 3" :key="'loop-' + i">
          <div
            v-for="tool in toolList"
            :key="tool.id + '-' + i"
            class="tool-card"
            :data-tool-id="tool.id"
            :style="getCardStyle(tool.id)"
            @click="openTool(tool)"
          >
            <div class="tool-card-icon">
              <img v-if="tool.icon.startsWith('http')" :src="tool.icon" :alt="tool.name" class="tool-card-img" />
              <span v-else>{{ tool.icon }}</span>
            </div>
            <div class="tool-card-body">
              <h3 class="tool-card-title">{{ tool.name }}</h3>
              <p class="tool-card-desc">{{ tool.desc }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- 指示点 -->
    <div v-if="!selectedTool" class="tool-dots">
      <span
        v-for="(tool, idx) in toolList"
        :key="tool.id"
        class="tool-dot"
        :class="{ active: activeDot === idx }"
        @click="scrollToTool(idx)"
      ></span>
    </div>

    <!-- ====== 工具界面 ====== -->
    <div v-else class="tool-interface">
      <div class="tool-interface-header">
        <el-button @click="selectedTool = null" plain>
          ← 返回工具列表
        </el-button>
        <h2>{{ currentToolName }}</h2>
      </div>

          <!-- 压缩图片 -->
          <div v-if="selectedTool === 'compress'" class="tool-section">
            <div class="upload-area">
              <input
                ref="compressInputRef"
                type="file"
                accept="image/*"
                class="file-input-hidden"
                @change="onCompressSelect"
              />
              <el-button type="primary" size="large" @click="compressInputRef?.click()">
                选择图片
              </el-button>
            </div>

            <div class="control-bar">
              <div class="control-item">
                <label>质量：{{ compressQuality }}%</label>
                <el-slider v-model="compressQuality" :min="1" :max="100" :step="1" />
              </div>
              <el-button type="primary" :loading="compressLoading" @click="handleCompress">
                {{ compressLoading ? '压缩中...' : '开始压缩' }}
              </el-button>
            </div>

            <div v-if="compressSource" class="preview-area">
              <div class="preview-grid">
                <div class="preview-box">
                  <h4>原图</h4>
                  <div class="preview-img-wrap">
                    <img :src="compressSource" />
                  </div>
                  <p class="preview-info">{{ compressSourceSize }}</p>
                </div>
                <div class="preview-box">
                  <h4>压缩后</h4>
                  <div v-if="compressResult" class="preview-img-wrap">
                    <img :src="compressResult" />
                  </div>
                  <div v-else class="preview-placeholder">等待压缩</div>
                  <p v-if="compressResultSize" class="preview-info">{{ compressResultSize }}</p>
                </div>
              </div>
            </div>

            <div v-if="compressResult" class="result-actions">
              <el-button type="success" @click="downloadResult(compressResult, 'compressed')">
                下载压缩图片
              </el-button>
            </div>
          </div>

          <!-- 修改图片大小 -->
          <div v-if="selectedTool === 'resize'" class="tool-section">
            <div class="upload-area">
              <input
                ref="resizeInputRef"
                type="file"
                accept="image/*"
                class="file-input-hidden"
                @change="onResizeSelect"
              />
              <el-button type="primary" size="large" @click="resizeInputRef?.click()">
                选择图片
              </el-button>
            </div>

            <div class="control-bar">
              <el-radio-group v-model="resizeMode" class="resize-mode">
                <el-radio-button value="wh">指定宽高</el-radio-button>
                <el-radio-button value="scale">缩放比例</el-radio-button>
                <el-radio-button value="max">最大尺寸</el-radio-button>
              </el-radio-group>

              <div v-if="resizeMode === 'wh'" class="control-row">
                <div class="control-item">
                  <label>宽度 (px)</label>
                  <el-input-number v-model="resizeWidth" :min="1" :max="10000" />
                </div>
                <div class="control-item">
                  <label>高度 (px)</label>
                  <el-input-number v-model="resizeHeight" :min="1" :max="10000" />
                </div>
              </div>

              <div v-if="resizeMode === 'scale'" class="control-row">
                <div class="control-item">
                  <label>缩放比例：{{ resizeScale }}%</label>
                  <el-slider v-model="resizeScale" :min="1" :max="200" :step="1" />
                </div>
              </div>

              <div v-if="resizeMode === 'max'" class="control-row">
                <div class="control-item">
                  <label>最大宽度 (px)</label>
                  <el-input-number v-model="resizeMaxW" :min="1" :max="10000" />
                </div>
                <div class="control-item">
                  <label>最大高度 (px)</label>
                  <el-input-number v-model="resizeMaxH" :min="1" :max="10000" />
                </div>
              </div>

              <el-button type="primary" :loading="resizeLoading" @click="handleResize">
                {{ resizeLoading ? '处理中...' : '开始修改' }}
              </el-button>
            </div>

            <div v-if="resizeSource" class="preview-area">
              <div class="preview-grid">
                <div class="preview-box">
                  <h4>原图</h4>
                  <div class="preview-img-wrap">
                    <img :src="resizeSource" />
                  </div>
                  <p class="preview-info">{{ resizeSourceSize }}（{{ resizeSourceW }}×{{ resizeSourceH }}）</p>
                </div>
                <div class="preview-box">
                  <h4>修改后</h4>
                  <div v-if="resizeResult" class="preview-img-wrap">
                    <img :src="resizeResult" />
                  </div>
                  <div v-else class="preview-placeholder">等待修改</div>
                  <p v-if="resizeResultSize" class="preview-info">{{ resizeResultSize }}</p>
                </div>
              </div>
            </div>

            <div v-if="resizeResult" class="result-actions">
              <el-button type="success" @click="downloadResult(resizeResult, 'resized')">
                下载修改后的图片
              </el-button>
            </div>
          </div>

          <!-- 图片分割 -->
          <div v-if="selectedTool === 'split'" class="tool-section">
            <div class="upload-area">
              <input
                ref="splitInputRef"
                type="file"
                accept="image/*"
                class="file-input-hidden"
                @change="onSplitSelect"
              />
              <el-button type="primary" size="large" @click="splitInputRef?.click()">
                选择图片
              </el-button>
            </div>

            <div class="control-bar">
              <el-radio-group v-model="splitMode" class="resize-mode">
                <el-radio-button value="grid">网格分割</el-radio-button>
                <el-radio-button value="crop">裁剪区域</el-radio-button>
              </el-radio-group>

              <div v-if="splitMode === 'grid'" class="control-row">
                <div class="control-item">
                  <label>行数</label>
                  <el-input-number v-model="splitRows" :min="1" :max="10" />
                </div>
                <div class="control-item">
                  <label>列数</label>
                  <el-input-number v-model="splitCols" :min="1" :max="10" />
                </div>
              </div>

              <div v-if="splitMode === 'crop'" class="control-row">
                <div class="control-item">
                  <label>X</label>
                  <el-input-number v-model="cropX" :min="0" :max="10000" />
                </div>
                <div class="control-item">
                  <label>Y</label>
                  <el-input-number v-model="cropY" :min="0" :max="10000" />
                </div>
                <div class="control-item">
                  <label>宽度</label>
                  <el-input-number v-model="cropW" :min="1" :max="10000" />
                </div>
                <div class="control-item">
                  <label>高度</label>
                  <el-input-number v-model="cropH" :min="1" :max="10000" />
                </div>
              </div>

              <el-button type="primary" :loading="splitLoading" @click="handleSplit">
                {{ splitLoading ? '分割中...' : '开始分割' }}
              </el-button>
            </div>

            <div v-if="splitSource" class="preview-area">
              <div class="preview-grid">
                <div class="preview-box">
                  <h4>原图</h4>
                  <div class="preview-img-wrap">
                    <img :src="splitSource" />
                  </div>
                  <p class="preview-info">{{ splitSourceSize }}</p>
                </div>
                <div class="preview-box">
                  <h4>分割结果</h4>
                  <div v-if="splitResults.length > 0" class="split-results">
                    <div v-for="(part, idx) in splitResults" :key="idx" class="split-thumb">
                      <img :src="part" @click="previewImage(part)" />
                      <span>#{{ idx + 1 }}</span>
                    </div>
                  </div>
                  <div v-else class="preview-placeholder">等待分割</div>
                </div>
              </div>
            </div>

            <div v-if="splitResults.length > 0" class="result-actions">
              <el-button type="success" @click="downloadAllSplit">打包下载全部</el-button>
            </div>
          </div>

          <!-- 网站图标获取 -->
          <div v-if="selectedTool === 'favicon'" class="tool-section">
            <div class="favicon-input-row">
              <el-input
                v-model="faviconUrl"
                placeholder="输入网站地址，如 https://example.com"
                clearable
                @keyup.enter="fetchFavicon"
              >
                <template #prepend>URL</template>
              </el-input>
              <el-button type="primary" @click="fetchFavicon" :loading="faviconLoading">
                获取图标
              </el-button>
            </div>

            <div v-if="faviconResult" class="favicon-result">
              <div class="favicon-preview">
                <div class="favicon-icon-wrap">
                  <img :src="faviconResult" :alt="faviconDomain" />
                </div>
                <p class="favicon-domain">{{ faviconDomain }}</p>
              </div>
              <div class="favicon-info">
                <p><strong>图标 URL：</strong></p>
                <el-input
                  :model-value="faviconResult"
                  readonly
                  class="favicon-url-copy"
                >
                  <template #append>
                    <el-button @click="copyFaviconUrl">复制</el-button>
                  </template>
                </el-input>
              </div>
              <div class="result-actions">
                <el-button type="success" @click="downloadFavicon">下载图标</el-button>
              </div>
            </div>

            <div v-if="faviconError" class="favicon-error">
              <el-alert :title="faviconError" type="error" show-icon :closable="false" />
            </div>
          </div>

          <!-- CSS 在线编辑 -->
          <div v-if="selectedTool === 'cssedit'" class="tool-section">
            <div class="cssedit-layout">
              <div class="cssedit-editor">
                <div class="jsrun-toolbar">
                  <span class="jsrun-label">HTML</span>
                  <el-button size="small" @click="setHtmlExample">示例</el-button>
                  <el-button size="small" @click="htmlCode = exampleHtmlCode">重置</el-button>
                </div>
                <div class="code-editor-wrap code-editor-sm">
                  <pre class="code-highlight-layer" aria-hidden="true"><code ref="htmlHighlightRef" class="language-markup">{{ htmlCode }}</code></pre>
                  <textarea
                    v-model="htmlCode"
                    class="code-textarea"
                    placeholder="<!-- 在此输入 HTML 代码 -->"
                    spellcheck="false"
                    @scroll="syncHtmlScroll"
                  ></textarea>
                </div>
                <div class="jsrun-toolbar" style="border-top:1px solid #e0e0e0;border-bottom:none;border-radius:0;">
                  <span class="jsrun-label">CSS</span>
                  <el-button size="small" @click="setCssExample">示例</el-button>
                  <el-button size="small" @click="cssCode = ''">清空</el-button>
                </div>
                <div class="code-editor-wrap">
                  <pre class="code-highlight-layer" aria-hidden="true"><code ref="cssHighlightRef" class="language-css">{{ cssCode }}</code></pre>
                  <textarea
                    v-model="cssCode"
                    class="code-textarea"
                    placeholder="/* 在此输入 CSS 代码 */"
                    spellcheck="false"
                    @scroll="syncCssScroll"
                  ></textarea>
                </div>
              </div>
              <div class="cssedit-preview">
                <div class="jsrun-toolbar">
                  <span class="jsrun-label">预览</span>
                  <el-button size="small" @click="exportCssAsImage" :loading="cssExporting">
                    {{ cssExporting ? '导出中...' : '导出图片' }}
                  </el-button>
                  <el-button
                    size="small"
                    :type="cssSelectMode ? 'warning' : 'default'"
                    @click="toggleCssSelect"
                    :disabled="cssExporting"
                  >
                    {{ cssSelectMode ? '取消选择' : '选择导出' }}
                  </el-button>
                  <el-button
                    v-if="cssSelectRect"
                    size="small"
                    type="success"
                    @click="exportCssSelection"
                    :loading="cssExporting"
                  >
                    {{ cssExporting ? '导出中...' : '导出选区' }}
                  </el-button>
                </div>
                <div class="cssedit-frame-wrap" ref="cssFrameWrapRef" :class="{ 'css-select-active': cssSelectMode }">
                  <iframe
                    ref="cssPreviewRef"
                    class="cssedit-frame"
                    sandbox="allow-same-origin"
                  ></iframe>
                  <div
                    v-if="cssSelectMode"
                    class="css-select-overlay"
                    @mousedown.prevent="onCssSelectStart"
                    @mousemove.prevent="onCssSelectMove"
                    @mouseup.prevent="onCssSelectEnd"
                    @mouseleave="onCssSelectEnd"
                  ></div>
                  <div
                    v-show="cssSelectRect"
                    class="css-select-box"
                    :style="cssSelectBoxStyle"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 运行 JS 代码 -->
          <div v-if="selectedTool === 'jsrun'" class="tool-section">
            <div class="jsrun-layout">
              <div class="jsrun-editor">
                <div class="jsrun-toolbar">
                  <span class="jsrun-label">代码</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleJsRun"
                    :loading="jsRunning"
                  >
                    {{ jsRunning ? '运行中...' : '▶ 运行' }}
                  </el-button>
                  <el-button size="small" @click="setJsExample">示例</el-button>
                  <el-button size="small" @click="jsCode = ''; jsResult = ''">清空</el-button>
                </div>
                <div class="code-editor-wrap">
                  <pre class="code-highlight-layer" aria-hidden="true"><code ref="jsHighlightRef" class="language-javascript">{{ jsCode }}</code></pre>
                  <textarea
                    v-model="jsCode"
                    class="code-textarea"
                    placeholder="在此输入 JavaScript 代码..."
                    spellcheck="false"
                    @scroll="syncJsScroll"
                  ></textarea>
                </div>
              </div>
              <div class="jsrun-output">
                <div class="jsrun-toolbar">
                  <span class="jsrun-label">输出</span>
                  <el-button size="small" @click="jsResult = ''">清空</el-button>
                </div>
                <div class="jsrun-result" :class="{ 'has-error': jsError }">
                  <pre v-if="jsResult !== ''">{{ jsResult }}</pre>
                  <div v-else class="jsrun-placeholder">运行代码后将在此显示结果</div>
                </div>
              </div>
            </div>
          </div>

          <!-- API 调试 -->
          <div v-if="selectedTool === 'api'" class="tool-section">
            <div class="api-layout">
              <div class="api-sidebar">
                <div class="api-group" v-for="group in apiGroups" :key="group.name">
                  <div class="api-group-header" @click="toggleApiGroup(group.name)">
                    <span>{{ group.icon }}</span>
                    <span class="api-group-name">{{ group.name.toUpperCase() }}</span>
                    <span class="api-group-count">{{ group.endpoints.length }}</span>
                    <span class="api-arrow" :class="{ expanded: apiExpanded.includes(group.name) }">▶</span>
                  </div>
                  <div v-if="apiExpanded.includes(group.name)" class="api-group-body">
                    <div
                      v-for="ep in group.endpoints"
                      :key="ep.path"
                      class="api-ep"
                      :class="{ active: apiPath === ep.path }"
                      @click="selectApiEp(ep)"
                    >
                      <span class="api-method" :class="ep.method.toLowerCase()">{{ ep.method }}</span>
                      <span>{{ ep.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="api-main">
                <div class="api-form-card">
                  <div class="api-form-row">
                    <label class="api-label">请求方式</label>
                    <el-select v-model="apiMethod" class="api-select" size="small">
                      <el-option label="GET" value="GET" />
                      <el-option label="POST" value="POST" />
                      <el-option label="PUT" value="PUT" />
                      <el-option label="DELETE" value="DELETE" />
                    </el-select>
                  </div>
                  <div class="api-form-row">
                    <label class="api-label">接口地址</label>
                    <el-input v-model="apiPath" placeholder="/api/..." size="small" />
                  </div>
                  <div class="api-form-row">
                    <label class="api-label">请求参数</label>
                    <div class="api-params">
                      <div v-for="p in apiParams" :key="p.name" class="api-param-row">
                        <span class="api-param-label">{{ p.name }}<span v-if="p.required" class="api-req">*</span></span>
                        <el-input
                          v-if="p.type !== 'file'"
                          v-model="apiForm[p.name]"
                          :placeholder="p.desc || p.name"
                          size="small"
                          :type="p.type === 'number' ? 'number' : 'text'"
                        />
                        <div v-else>
                          <input type="file" @change="onApiFile($event, p.name)" />
                        </div>
                      </div>
                      <div v-if="apiParams.length === 0 && apiMethod !== 'GET'" class="api-no-params">无需参数</div>
                    </div>
                  </div>
                  <el-button type="primary" @click="sendApiReq" :loading="apiLoading" size="small">
                    {{ apiLoading ? '请求中...' : '发送请求' }}
                  </el-button>
                  <div v-if="apiResponse" class="api-response">
                    <h4>响应结果</h4>
                    <pre>{{ apiResponse }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 图片上传 -->
          <div v-if="selectedTool === 'upload'" class="tool-section">
            <div class="upload-inline">
              <div class="upload-row">
                <label class="upload-label">选择相册</label>
                <div class="upload-row-group">
                  <el-select v-model="upAlbum" placeholder="请选择相册" size="small" class="up-album-select">
                    <el-option v-for="a in upAlbumList" :key="a.name" :label="a.name" :value="a.name" />
                  </el-select>
                  <el-button size="small" type="primary" @click="upShowCreate = true">+ 新建</el-button>
                </div>
              </div>
              <div
                class="up-dropzone"
                :class="{ 'up-dragover': upDragging }"
                @dragenter.prevent="upDragging = true"
                @dragover.prevent="upDragging = true"
                @dragleave.prevent="upDragging = false"
                @drop.prevent="onUpDrop"
                @click="upInputRef?.click()"
              >
                <input ref="upInputRef" type="file" multiple accept="image/*" style="display:none" @change="onUpChange" />
                <div class="up-dropicon">📤</div>
                <p>拖拽图片到此处，或点击选择</p>
                <small>JPG / PNG / GIF / WebP</small>
              </div>
              <div v-if="upFiles.length > 0" class="up-files">
                <div class="up-files-header">
                  <span>已选 {{ upFiles.length }} 个文件</span>
                  <el-button text size="small" type="danger" @click="upClearFiles">清空</el-button>
                </div>
                <div class="up-file-grid">
                  <div v-for="(f, i) in upFiles" :key="i" class="up-file-card">
                    <img :src="f.preview" />
                    <div v-if="f.status === 'uploading'" class="up-progress"><el-progress type="circle" :percentage="f.progress" :width="40" :stroke-width="4" /></div>
                    <div v-if="f.status === 'success'" class="up-badge up-ok">✓</div>
                    <div v-if="f.status === 'error'" class="up-badge up-fail">✗</div>
                    <div class="up-file-name">{{ f.file.name }}</div>
                    <button v-if="f.status !== 'uploading'" class="up-del" @click="upFiles.splice(i, 1)">×</button>
                  </div>
                </div>
                <el-button type="primary" :disabled="!upAlbum || upUploading > 0" :loading="upUploading > 0" @click="upStartUpload" size="small">
                  {{ upUploading > 0 ? `上传中 ${upUploaded}/${upFiles.length}` : '开始上传' }}
                </el-button>
              </div>
              <div v-if="upResults.length > 0" class="up-results">
                <h4>上传结果</h4>
                <div v-for="(r, i) in upResults" :key="i" :class="r.success ? 'up-r-ok' : 'up-r-fail'">
                  {{ r.success ? '✓' : '✗' }} {{ r.name }} — {{ r.message }}
                </div>
              </div>
            </div>
            <el-dialog v-model="upShowCreate" title="新建相册" width="360px" append-to-body>
              <el-input v-model="upNewName" placeholder="相册名称" maxlength="50" />
              <template #footer>
                <el-button @click="upShowCreate = false">取消</el-button>
                <el-button type="primary" :loading="upCreating" @click="upCreateAlbum">创建</el-button>
              </template>
            </el-dialog>
          </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getBackgrounds } from '@/api/data';
import { compressImage, splitImage } from '@/api/external';
import { getPicUIAlbums, getPicUIAlbum, uploadToPicUI } from '@/api/external';
import { useUserStore } from '@/stores/user';
import Prism from 'prismjs';
import html2canvas from 'html2canvas';
import 'prism-themes/themes/prism-vsc-dark-plus.min.css';
import 'prismjs/components/prism-markup.min.js';
import 'prismjs/components/prism-css.min.js';
import 'prismjs/components/prism-clike.min.js';
import 'prismjs/components/prism-javascript.min.js';
import { apiGroups, type ApiEndpoint } from '@/api/api-docs';
import request from '@/utils/request';

const backgroundUrl = ref<string>('');
const selectedTool = ref<string | null>(null);
const userStore = useUserStore();
const scrollWrapRef = ref<HTMLElement | null>(null);
const toolGridRef = ref<HTMLElement | null>(null);
const cardStyles = ref<Record<string, { transform: string; opacity: number; zIndex: number }>>({});
const activeDot = ref(0);
const toolBaseWidth = ref(200);

function updateCardScales() {
  const wrap = scrollWrapRef.value;
  if (!wrap) return;
  const cards = wrap.querySelectorAll('.tool-card');
  const wrapRect = wrap.getBoundingClientRect();
  const wrapCenter = wrapRect.left + wrapRect.width / 2;
  const maxDist = wrapRect.width * 0.7;
  const styles: Record<string, any> = {};

  cards.forEach((card) => {
    const el = card as HTMLElement;
    const id = el.dataset.toolId;
    if (!id) return;
    const rect = el.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const dist = cardCenter - wrapCenter;
    const absDist = Math.abs(dist);
    const t = Math.min(1, absDist / maxDist);
    const scale = 1 - t * 0.3;
    const opacity = 1 - t * 0.85;
    // 旋转方向：左边正角度，右边负角度
    const rotate = dist * 0.12;
    // 保留最近一次（靠中间副本）的样式
    const prev = styles[id];
    if (!prev || scale > prev.scale) {
      styles[id] = {
        transform: `scale(${Math.max(0.6, scale)}) rotateY(${rotate}deg)`,
        opacity: Math.max(0.08, opacity),
        zIndex: Math.round((1 - t) * 100),
        scale,
      };
    }
  });

  // 转成 plain object
  const result: Record<string, any> = {};
  for (const [id, s] of Object.entries(styles)) {
    result[id] = { transform: s.transform, opacity: s.opacity, zIndex: s.zIndex };
  }
  cardStyles.value = result;

  // 计算当前选中哪个点（scalse 最大的那个）
  let maxScale = 0;
  let activeId = '';
  for (const [id, s] of Object.entries(styles)) {
    if (s.scale > maxScale) {
      maxScale = s.scale;
      activeId = id;
    }
  }
  const idx = toolList.findIndex(t => t.id === activeId);
  if (idx >= 0) activeDot.value = idx;
}

function onScroll() {
  updateCardScales();
  // 无限循环：到达边缘时跳转
  const wrap = scrollWrapRef.value;
  const grid = toolGridRef.value;
  if (!wrap || !grid || isDragging) return;
  const itemCount = toolList.length;
  if (itemCount === 0) return;
  const oneSetW = grid.scrollWidth / 3;
  const scrollL = wrap.scrollLeft;
  if (scrollL < oneSetW * 0.3) {
    wrap.scrollLeft = scrollL + oneSetW;
  } else if (scrollL > oneSetW * 2.7) {
    wrap.scrollLeft = scrollL - oneSetW;
  }
}

let dragStartX = 0;
let dragScrollLeft = 0;
let isDragging = false;

function onDragStart(e: MouseEvent) {
  const wrap = scrollWrapRef.value;
  if (!wrap) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragScrollLeft = wrap.scrollLeft;
  wrap.style.cursor = 'grabbing';
  wrap.style.userSelect = 'none';
}

function onDragMove(e: MouseEvent) {
  if (!isDragging) return;
  const wrap = scrollWrapRef.value;
  if (!wrap) return;
  const dx = e.clientX - dragStartX;
  const newScroll = dragScrollLeft - dx;
  wrap.scrollLeft = newScroll;
  // 拖拽时也检测循环跳转
  const grid = toolGridRef.value;
  if (!grid) return;
  const itemCount = toolList.length;
  if (itemCount === 0) return;
  const oneSetW = grid.scrollWidth / 3;
  if (wrap.scrollLeft < oneSetW * 0.3) {
    wrap.scrollLeft = wrap.scrollLeft + oneSetW;
    dragScrollLeft = dragScrollLeft + oneSetW;
  } else if (wrap.scrollLeft > oneSetW * 2.7) {
    wrap.scrollLeft = wrap.scrollLeft - oneSetW;
    dragScrollLeft = dragScrollLeft - oneSetW;
  }
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  const wrap = scrollWrapRef.value;
  if (wrap) {
    wrap.style.cursor = '';
    wrap.style.userSelect = '';
  }
}

function getCardStyle(id: string) {
  return cardStyles.value[id] || {};
}

function scrollToTool(idx: number) {
  const wrap = scrollWrapRef.value;
  const grid = toolGridRef.value;
  if (!wrap || !grid) return;
  const cards = wrap.querySelectorAll('.tool-card');
  const target = cards[idx] as HTMLElement | null;
  if (!target) return;
  const wrapRect = wrap.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offset = targetRect.left - wrapRect.left - (wrapRect.width - targetRect.width) / 2;
  wrap.scrollBy({ left: offset, behavior: 'smooth' });
}

const pageBgStyle = computed(() => ({
  backgroundImage: `url(${backgroundUrl.value})`,
}));

const toolList = [
  { id: 'compress', name: '压缩图片', icon: 'https://free.picui.cn/free/2026/05/26/6a1590eb9e507.jpg', desc: '调整图片质量，减小文件体积' },
  { id: 'resize', name: '修改图片大小', icon: 'https://free.picui.cn/free/2026/05/26/6a1590f31bb3c.jpeg', desc: '调整图片尺寸，按宽高或比例缩放' },
  { id: 'split', name: '图片分割', icon: 'https://free.picui.cn/free/2026/05/26/6a1590fd30c21.jpg', desc: '将图片分割成多张或裁剪区域' },
  { id: 'favicon', name: '网站图标获取', icon: 'https://free.picui.cn/free/2026/05/26/6a1590fac760a.jpeg', desc: '获取任意网站的 favicon 图标' },
  { id: 'upload', name: '图片上传', icon: 'https://free.picui.cn/free/2026/05/26/6a1590f0a8062.jpg', desc: '上传图片到相册', admin: true },
  { id: 'api', name: 'API 调试', icon: 'https://free.picui.cn/free/2026/05/26/6a1590f899774.jpeg', desc: '测试和调用后端 API 接口', admin: true },
  { id: 'jsrun', name: '运行 JS 代码', icon: 'https://free.picui.cn/free/2026/05/26/6a1590ff3d599.webp', desc: '在线执行 JavaScript 代码片段' },
  { id: 'cssedit', name: 'CSS 编辑', icon: 'https://free.picui.cn/free/2026/05/26/6a1590ee8474f.jpg', desc: '在线编写 CSS 并实时预览效果' },
];

const currentToolName = computed(() => {
  const tool = toolList.find(t => t.id === selectedTool.value);
  return tool ? tool.name : '';
});

function openTool(tool: (typeof toolList)[number]) {
  if (isDragging) return;
  if (tool.admin && !userStore.isAdmin) {
    ElMessage.warning('该工具仅管理员可用');
    return;
  }
  selectedTool.value = tool.id;
}

// 返回列表时重新初始化卡片
watch(selectedTool, (val) => {
  if (val === null) {
    nextTick(() => {
      const wrap = document.querySelector('.tool-scroll-wrap') as HTMLElement;
      const grid = document.querySelector('.tool-grid') as HTMLElement;
      if (wrap && grid) {
        wrap.scrollLeft = (grid.scrollWidth - wrap.clientWidth) / 2;
        updateCardScales();
      }
    });
  }
});

// ── 通用 ──
const formatBytes = (bytes: number): string => {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const downloadResult = (dataUrl: string, prefix: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${prefix}_${Date.now()}.png`;
  link.click();
};

const downloadAllSplit = async () => {
  for (let i = 0; i < splitResults.value.length; i++) {
    const link = document.createElement('a');
    link.href = splitResults.value[i];
    link.download = `split_part_${i + 1}.png`;
    link.click();
    // 浏览器限制，分批下载
    await new Promise(r => setTimeout(r, 300));
  }
  ElMessage.success('下载已开始');
};

const previewImage = (url: string) => {
  window.open(url, '_blank');
};

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ── 压缩 ──
const compressInputRef = ref<HTMLInputElement>();
const compressSource = ref('');
const compressSourceSize = ref('');
const compressResult = ref('');
const compressResultSize = ref('');
const compressQuality = ref(80);
const compressLoading = ref(false);
let compressFile: File | null = null;

const onCompressSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  compressFile = file;
  compressSource.value = URL.createObjectURL(file);
  compressSourceSize.value = formatBytes(file.size);
  compressResult.value = '';
  compressResultSize.value = '';
};

const handleCompress = async () => {
  if (!compressFile) return;
  compressLoading.value = true;
  try {
    const res: any = await compressImage({
      file: compressFile,
      quality: compressQuality.value,
    });
    if (res instanceof Blob) {
      compressResult.value = await blobToDataURL(res);
      compressResultSize.value = formatBytes(res.size);
    } else {
      ElMessage.error('压缩失败：返回数据格式异常');
    }
  } catch (err: any) {
    ElMessage.error('压缩失败：' + (err?.message || '未知错误'));
  } finally {
    compressLoading.value = false;
  }
};

// ── 修改大小 ──
const resizeInputRef = ref<HTMLInputElement>();
const resizeSource = ref('');
const resizeSourceSize = ref('');
const resizeSourceW = ref(0);
const resizeSourceH = ref(0);
const resizeResult = ref('');
const resizeResultSize = ref('');
const resizeMode = ref<'wh' | 'scale' | 'max'>('wh');
const resizeWidth = ref(800);
const resizeHeight = ref(600);
const resizeScale = ref(50);
const resizeMaxW = ref(1920);
const resizeMaxH = ref(1080);
const resizeLoading = ref(false);
let resizeFile: File | null = null;

const onResizeSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  resizeFile = file;
  resizeSource.value = URL.createObjectURL(file);
  resizeSourceSize.value = formatBytes(file.size);
  resizeResult.value = '';
  resizeResultSize.value = '';

  // 读取原图尺寸
  const img = new Image();
  img.onload = () => {
    resizeSourceW.value = img.naturalWidth;
    resizeSourceH.value = img.naturalHeight;
    resizeWidth.value = img.naturalWidth;
    resizeHeight.value = img.naturalHeight;
  };
  img.src = URL.createObjectURL(file);
};

const handleResize = async () => {
  if (!resizeFile) return;
  resizeLoading.value = true;
  try {
    const params: any = { file: resizeFile, quality: 90 };
    if (resizeMode.value === 'wh') {
      params.width = resizeWidth.value;
      params.height = resizeHeight.value;
    } else if (resizeMode.value === 'scale') {
      params.scale = resizeScale.value;
    } else if (resizeMode.value === 'max') {
      params.maxWidth = resizeMaxW.value;
      params.maxHeight = resizeMaxH.value;
    }

    const res: any = await compressImage(params);
    if (res instanceof Blob) {
      resizeResult.value = await blobToDataURL(res);
      resizeResultSize.value = formatBytes(res.size);
    } else {
      ElMessage.error('修改失败：返回数据格式异常');
    }
  } catch (err: any) {
    ElMessage.error('修改失败：' + (err?.message || '未知错误'));
  } finally {
    resizeLoading.value = false;
  }
};

// ── 分割 ──
const splitInputRef = ref<HTMLInputElement>();
const splitSource = ref('');
const splitSourceSize = ref('');
const splitResults = ref<string[]>([]);
const splitMode = ref<'grid' | 'crop'>('grid');
const splitRows = ref(2);
const splitCols = ref(2);
const cropX = ref(0);
const cropY = ref(0);
const cropW = ref(500);
const cropH = ref(500);
const splitLoading = ref(false);
let splitFile: File | null = null;

const onSplitSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  splitFile = file;
  splitSource.value = URL.createObjectURL(file);
  splitSourceSize.value = formatBytes(file.size);
  splitResults.value = [];
};

const handleSplit = async () => {
  if (!splitFile) return;
  splitLoading.value = true;
  try {
    const params: any = { file: splitFile, mode: splitMode.value };
    if (splitMode.value === 'grid') {
      params.rows = splitRows.value;
      params.cols = splitCols.value;
    } else {
      params.x = cropX.value;
      params.y = cropY.value;
      params.width = cropW.value;
      params.height = cropH.value;
    }

    const res = await splitImage(params);
    if (res.success && res.parts && res.parts.length > 0) {
      splitResults.value = res.parts;
      ElMessage.success(`分割完成，共 ${res.parts.length} 张`);
    } else {
      ElMessage.error(res.message || '分割失败');
    }
  } catch (err: any) {
    ElMessage.error('分割失败：' + (err?.message || '未知错误'));
  } finally {
    splitLoading.value = false;
  }
};

// ── 网站图标 ──
const faviconUrl = ref('');
const faviconDomain = ref('');
const faviconResult = ref('');
const faviconError = ref('');
const faviconLoading = ref(false);

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
  }
};

const fetchFavicon = () => {
  const url = faviconUrl.value.trim();
  if (!url) {
    ElMessage.warning('请输入网站地址');
    return;
  }
  faviconError.value = '';
  faviconResult.value = '';
  faviconLoading.value = true;

  const domain = getDomain(url);
  faviconDomain.value = domain;

  // 多个图标源，并行尝试
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://icon.horse/icon/${domain}`,
    `https://api.qqsuu.cn/api/favicon?url=${domain}`,
  ];

  let settled = false;

  for (const iconUrl of sources) {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; }, 2000);
    img.onload = () => {
      if (settled) return;
      clearTimeout(timer);
      settled = true;
      faviconResult.value = iconUrl;
      faviconLoading.value = false;
    };
    img.onerror = () => {
      clearTimeout(timer);
    };
    img.src = iconUrl;
  }

  // 2.5 秒后如果都没成功，直接显示 Google 的链接
  setTimeout(() => {
    if (!settled) {
      settled = true;
      faviconResult.value = sources[0];
      faviconLoading.value = false;
    }
  }, 2500);
};

const copyFaviconUrl = () => {
  navigator.clipboard.writeText(faviconResult.value).then(() => {
    ElMessage.success('已复制图标 URL');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

const downloadFavicon = () => {
  const link = document.createElement('a');
  link.href = faviconResult.value;
  link.download = `${faviconDomain.value}_favicon.png`;
  link.target = '_blank';
  link.click();
};

// ── 运行 JS 代码 ──
const jsCode = ref('');
const jsResult = ref('');
const jsRunning = ref(false);
const jsError = ref(false);

const exampleJsCode = `// 示例：计算斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = [];
for (let i = 0; i < 10; i++) {
  result.push(fibonacci(i));
}
console.log('斐波那契数列前10项:', result);
result;`;

const jsHighlightRef = ref<HTMLElement>();
const cssHighlightRef = ref<HTMLElement>();
const htmlHighlightRef = ref<HTMLElement>();

const highlightJs = () => nextTick(() => {
  if (jsHighlightRef.value) Prism.highlightElement(jsHighlightRef.value);
});
const highlightCss = () => nextTick(() => {
  if (cssHighlightRef.value) Prism.highlightElement(cssHighlightRef.value);
});
const highlightHtml = () => nextTick(() => {
  if (htmlHighlightRef.value) Prism.highlightElement(htmlHighlightRef.value);
});

const syncJsScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const pre = target.parentElement?.querySelector('.code-highlight-layer') as HTMLElement;
  if (pre) { pre.scrollTop = target.scrollTop; pre.scrollLeft = target.scrollLeft; }
};

const syncCssScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const pre = target.parentElement?.querySelector('.code-highlight-layer') as HTMLElement;
  if (pre) { pre.scrollTop = target.scrollTop; pre.scrollLeft = target.scrollLeft; }
};

const syncHtmlScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const pre = target.parentElement?.querySelector('.code-highlight-layer') as HTMLElement;
  if (pre) { pre.scrollTop = target.scrollTop; pre.scrollLeft = target.scrollLeft; }
};

const setJsExample = () => {
  jsCode.value = exampleJsCode;
};

const setCssExample = () => {
  cssCode.value = exampleCssCode;
};

const handleJsRun = () => {
  const code = jsCode.value.trim();
  if (!code) { ElMessage.warning('请输入要执行的代码'); return; }

  jsRunning.value = true;
  jsResult.value = '';
  jsError.value = false;

  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => logs.push('❌ ' + args.map(String).join(' ')),
    warn: (...args: unknown[]) => logs.push('⚠️ ' + args.map(String).join(' ')),
    info: (...args: unknown[]) => logs.push('ℹ️ ' + args.map(String).join(' ')),
  };

  try {
    const fn = new Function('console', code);
    const result = fn(fakeConsole);
    const output: string[] = [];
    if (logs.length > 0) output.push(...logs);
    if (result !== undefined) output.push('→ ' + JSON.stringify(result, null, 2));
    jsResult.value = output.join('\n') || 'undefined';
    jsError.value = false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    jsResult.value = [...logs, '❌ ' + msg].join('\n');
    jsError.value = true;
  } finally {
    jsRunning.value = false;
  }
};

// ── CSS 在线编辑 ──
const htmlCode = ref('');
const cssCode = ref('');
const cssPreviewRef = ref<HTMLIFrameElement>();

watch(jsCode, highlightJs);
watch(cssCode, () => { highlightCss(); updateCssPreview(); });
watch(htmlCode, () => { highlightHtml(); updateCssPreview(); });

const exampleHtmlCode = `<div class="card">
  <h2>Hello World</h2>
  <p>这是一张卡片，试试修改样式吧！</p>
</div>`;

const exampleCssCode = `/* 示例：卡片样式 */
.card {
  width: 200px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  font-family: Arial, sans-serif;
  text-align: center;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-4px);
}

.card h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.card p {
  margin: 0;
  font-size: 14px;
  opacity: 0.85;
}`;

const setHtmlExample = () => {
  htmlCode.value = exampleHtmlCode;
};

const cssExporting = ref(false);
const cssSelectMode = ref(false);
const cssSelecting = ref(false);
const cssSelectRect = ref<{ x: number; y: number; w: number; h: number } | null>(null);
const cssSelectStart = ref<{ x: number; y: number } | null>(null);
const cssFrameWrapRef = ref<HTMLElement>();

const cssSelectBoxStyle = computed(() => {
  const r = cssSelectRect.value;
  if (!r) return { display: 'none' };
  return {
    left: r.x + 'px',
    top: r.y + 'px',
    width: r.w + 'px',
    height: r.h + 'px',
  };
});

const toggleCssSelect = () => {
  cssSelectMode.value = !cssSelectMode.value;
  if (!cssSelectMode.value) {
    cssSelectRect.value = null;
    cssSelectStart.value = null;
  }
};

const onCssSelectStart = (e: MouseEvent) => {
  if (!cssSelectMode.value) return;
  const wrap = cssFrameWrapRef.value;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  cssSelectStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  cssSelectRect.value = null;
  cssSelecting.value = true;
};

const onCssSelectMove = (e: MouseEvent) => {
  if (!cssSelecting.value || !cssSelectStart.value) return;
  const wrap = cssFrameWrapRef.value;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  cssSelectRect.value = {
    x: Math.min(cssSelectStart.value.x, cx),
    y: Math.min(cssSelectStart.value.y, cy),
    w: Math.abs(cx - cssSelectStart.value.x),
    h: Math.abs(cy - cssSelectStart.value.y),
  };
};

const onCssSelectEnd = () => {
  if (!cssSelecting.value) return;
  cssSelecting.value = false;
  if (!cssSelectRect.value || cssSelectRect.value.w < 5 || cssSelectRect.value.h < 5) {
    cssSelectRect.value = null;
    ElMessage.warning('选择区域太小，请重新选择');
    return;
  }
  ElMessage.success('区域已选定，点击"导出选区"可导出此区域');
};

const exportCssAsImage = async () => {
  const iframe = cssPreviewRef.value;
  if (!iframe) { ElMessage.warning('请先编写 CSS 代码'); return; }

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc || !frameDoc.body) { ElMessage.warning('预览区域尚未加载'); return; }

  cssExporting.value = true;
  try {
    const canvas = await html2canvas(frameDoc.body, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });
    const link = document.createElement('a');
    link.download = `css-preview-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    ElMessage.success('图片已导出');
  } catch (err: any) {
    ElMessage.error('导出失败：' + (err?.message || '未知错误'));
  } finally {
    cssExporting.value = false;
  }
};

const exportCssSelection = async () => {
  const iframe = cssPreviewRef.value;
  if (!iframe) { ElMessage.warning('请先编写 CSS 代码'); return; }

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc || !frameDoc.body) { ElMessage.warning('预览区域尚未加载'); return; }

  const sel = cssSelectRect.value;
  if (!sel || sel.w < 5 || sel.h < 5) { ElMessage.warning('请先选择导出区域'); return; }

  const wrap = cssFrameWrapRef.value;
  if (!wrap) return;
  const scale = 2; // 与 html2canvas scale 一致

  cssExporting.value = true;
  try {
    const fullCanvas = await html2canvas(frameDoc.body, {
      backgroundColor: null,
      scale,
      useCORS: true,
      allowTaint: false,
    });

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sel.w * scale;
    cropCanvas.height = sel.h * scale;
    const ctx = cropCanvas.getContext('2d')!;
    ctx.drawImage(
      fullCanvas,
      sel.x * scale, sel.y * scale,
      sel.w * scale, sel.h * scale,
      0, 0,
      sel.w * scale, sel.h * scale
    );

    const link = document.createElement('a');
    link.download = `css-selection-${Date.now()}.png`;
    link.href = cropCanvas.toDataURL('image/png');
    link.click();
    ElMessage.success('选区已导出');
  } catch (err: any) {
    ElMessage.error('导出失败：' + (err?.message || '未知错误'));
  } finally {
    cssExporting.value = false;
  }
};

function updateCssPreview() {
  const iframe = cssPreviewRef.value;
  if (!iframe) return;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  const html = htmlCode.value || exampleHtmlCode;
  const css = cssCode.value;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>${css}</style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);
  doc.close();
};

// ── API 调试 ──
const apiExpanded = ref<string[]>(['database']);
const apiMethod = ref('POST');
const apiPath = ref('/api/data/query');
const apiForm = ref<Record<string, any>>({});
const apiLoading = ref(false);
const apiResponse = ref('');
const apiFiles = ref<Record<string, File>>({});
const apiCurrentEp = ref<ApiEndpoint | null>(null);

const apiParams = computed(() => apiCurrentEp.value?.requestParams || []);

function toggleApiGroup(name: string) {
  const i = apiExpanded.value.indexOf(name);
  i > -1 ? apiExpanded.value.splice(i, 1) : apiExpanded.value.push(name);
}

function selectApiEp(ep: ApiEndpoint) {
  apiCurrentEp.value = ep;
  apiMethod.value = ep.method;
  apiPath.value = ep.path;
  apiForm.value = {};
  apiFiles.value = {};
  apiResponse.value = '';
  if (ep.requestParams) {
    const d: Record<string, any> = {};
    ep.requestParams.forEach(p => {
      if (p.name === 'uniqueId') d[p.name] = 'user_1779243581625437300';
      else if (p.name === 'table') d[p.name] = '弹幕表';
      else if (p.type !== 'file') d[p.name] = '';
    });
    apiForm.value = d;
  }
}

function onApiFile(e: Event, name: string) {
  const t = e.target as HTMLInputElement;
  if (t.files?.[0]) apiFiles.value[name] = t.files[0];
}

const hasApiFile = computed(() => apiParams.value.some(p => p.type === 'file'));

function buildApiParams() {
  const params: Record<string, any> = {};
  apiParams.value.forEach(p => {
    const v = apiForm.value[p.name];
    if (v !== undefined && v !== '') {
      if (p.type === 'number') params[p.name] = Number(v);
      else if (p.name === 'data' || p.name === 'messages') {
        try { params[p.name] = JSON.parse(v); } catch { params[p.name] = v; }
      } else params[p.name] = v;
    }
  });
  return params;
}

async function sendApiReq() {
  if (!apiPath.value) return;
  apiLoading.value = true;
  apiResponse.value = '';
  try {
    let res;
    if (hasApiFile.value && apiMethod.value !== 'GET') {
      const fd = new FormData();
      apiParams.value.forEach(p => {
        if (p.type === 'file' && apiFiles.value[p.name]) fd.append(p.name, apiFiles.value[p.name]);
        else { const v = apiForm.value[p.name]; if (v) fd.append(p.name, v); }
      });
      res = await request.post(apiPath.value, fd);
    } else {
      const params = buildApiParams();
      switch (apiMethod.value) {
        case 'GET': res = await request.get(apiPath.value, params); break;
        case 'POST': res = await request.post(apiPath.value, params); break;
        case 'PUT': res = await request.put(apiPath.value, params); break;
        case 'DELETE': res = await request.delete(apiPath.value, params); break;
      }
    }
    apiResponse.value = JSON.stringify(res, null, 2);
  } catch (err: any) {
    apiResponse.value = err.response
      ? `❌ HTTP ${err.response.status}\n\n${JSON.stringify(err.response.data, null, 2)}`
      : `❌ ${err.message || '请求失败'}`;
  } finally {
    apiLoading.value = false;
  }
}

// ── 图片上传 ──
const upAlbum = ref('');
const upAlbumList = ref<{ name: string; image_num: number }[]>([]);
const upShowCreate = ref(false);
const upNewName = ref('');
const upCreating = ref(false);
const upDragging = ref(false);
const upInputRef = ref<HTMLInputElement>();
const upFiles = ref<{ file: File; preview: string; status: string; progress: number }[]>([]);
const upUploading = ref(0);
const upUploaded = ref(0);
const upResults = ref<{ name: string; success: boolean; message: string }[]>([]);

function onUpDrop(e: DragEvent) {
  upDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files?.length) upAddFiles(Array.from(files));
}
function onUpChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) upAddFiles(Array.from(input.files));
  input.value = '';
}
function upAddFiles(files: File[]) {
  const imgs = files.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) { ElMessage.warning('请选择图片'); return; }
  for (const f of imgs) {
    if (upFiles.value.some(x => x.file.name === f.name && x.file.size === f.size)) continue;
    upFiles.value.push({ file: f, preview: URL.createObjectURL(f), status: 'pending', progress: 0 });
  }
  ElMessage.success(`已添加 ${imgs.length} 个文件`);
}
function upClearFiles() {
  upFiles.value.forEach(f => URL.revokeObjectURL(f.preview));
  upFiles.value = [];
  upResults.value = [];
}

async function upStartUpload() {
  if (!userStore.isAdmin) { ElMessage.warning('仅管理员可上传'); return; }
  if (!upAlbum.value) { ElMessage.warning('请选择相册'); return; }
  if (!upFiles.value.length) { ElMessage.warning('请选择图片'); return; }
  upUploading.value = 0;
  upUploaded.value = 0;
  upResults.value = [];
  for (const item of upFiles.value) {
    if (item.status === 'success' || item.status === 'uploading') continue;
    upUploading.value++;
    item.status = 'uploading';
    item.progress = 0;
    try {
      const pi = setInterval(() => { if (item.progress < 80) item.progress += Math.random() * 15; }, 300);
      const res: any = await uploadToPicUI({ file: item.file, album: upAlbum.value });
      clearInterval(pi);
      const url = res?.data?.links?.url || res?.links?.url || res?.url || res?.data?.url;
      if (url) {
        item.status = 'success'; item.progress = 100;
        upUploaded.value++;
        upResults.value.push({ name: item.file.name, success: true, message: '上传成功' });
      } else {
        throw new Error(res?.message || '返回数据异常');
      }
    } catch (err: any) {
      item.status = 'error'; item.progress = 0;
      upResults.value.push({ name: item.file.name, success: false, message: err.message || '上传失败' });
    } finally { upUploading.value--; }
  }
  upFiles.value = upFiles.value.filter(f => f.status === 'error');
  const ok = upResults.value.filter(r => r.success).length;
  const fail = upResults.value.filter(r => !r.success).length;
  if (ok > 0 && fail === 0) ElMessage.success(`全部上传成功，共 ${ok} 张`);
  else if (ok > 0) ElMessage.warning(`成功 ${ok} 张，失败 ${fail} 张`);
  else ElMessage.error(`全部上传失败`);
}

async function upCreateAlbum() {
  const name = upNewName.value.trim();
  if (!name) { ElMessage.warning('请输入相册名称'); return; }
  upCreating.value = true;
  try {
    const empty = new File([new Blob([''], { type: 'image/png' })], '__init__.png', { type: 'image/png' });
    await uploadToPicUI({ file: empty, album: name });
    upAlbumList.value.push({ name, image_num: 0 });
    upAlbum.value = name;
    ElMessage.success(`相册 "${name}" 已创建`);
  } catch {
    upAlbumList.value.push({ name, image_num: 0 });
    upAlbum.value = name;
    ElMessage.success(`相册 "${name}" 已创建`);
  } finally {
    upShowCreate.value = false;
    upNewName.value = '';
    upCreating.value = false;
  }
}

async function upLoadAlbums() {
  try {
    const res: any = await getPicUIAlbums();
    let albums: { name: string; image_num: number }[] = [];
    if (res?.status === true && res?.data) {
      const raw = res.data;
      if (Array.isArray(raw)) albums = raw.map((a: Record<string, any>) => ({ name: a.name || '', image_num: a.image_num || 0 })).filter((a: Record<string, any>) => a.name);
      else if (raw.data && Array.isArray(raw.data)) albums = raw.data.map((a: Record<string, any>) => ({ name: a.name || '', image_num: a.image_num || 0 })).filter((a: Record<string, any>) => a.name);
    }
    upAlbumList.value = albums;
  } catch { console.log('获取相册列表失败'); }
}

onMounted(async () => {
  userStore.loadUserInfo();
  await userStore.refreshAdminStatus();
  try {
    const bgData = await getBackgrounds('在线工具') as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch {
    console.log('获取背景图失败');
  }
  // 默认加载示例 HTML
  htmlCode.value = exampleHtmlCode;
  // 初始滚动到中间位置（三份的中间一份）
  setTimeout(() => {
    const wrap = document.querySelector('.tool-scroll-wrap') as HTMLElement;
    const grid = document.querySelector('.tool-grid') as HTMLElement;
    if (wrap && grid) {
      wrap.scrollLeft = (grid.scrollWidth - wrap.clientWidth) / 2;
      updateCardScales();
    }
  }, 150);
  // 加载相册列表
  await upLoadAlbums();
  // 初始化卡片样式
  nextTick(() => { updateCardScales(); });
  window.addEventListener('resize', updateCardScales);
});
</script>

<style scoped>
/* ── 页面容器 ── */
.tool-page {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* ── 页面容器 ── */
.tool-page {
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
}

.page-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 0;
}

/* ── 标题 ── */
.tool-header {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 90px 20px 20px;
}

.hero-title {
  font-size: 3em;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: 8px;
}

.title-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(-30px) scale(0.5);
  animation: charBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.title-char:first-child {
  color: #e74c3c;
  font-size: 1.4em;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.5), 0 0 40px rgba(231, 76, 60, 0.2);
  animation: charBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
             charGlow 2s ease-in-out 0.6s infinite alternate;
}

.title-char:nth-child(n+2) {
  position: relative;
  top: -0.15em;
  font-size: 0.75em;
}

.title-char:nth-child(n+2)::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 3px;
  background: #e74c3c;
  border-radius: 2px;
  animation: linePulse 2s ease-in-out 0.6s infinite alternate;
}

@keyframes charBounceIn {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.3);
  }
  60% {
    opacity: 1;
    transform: translateY(4px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes charGlow {
  0% { text-shadow: 0 0 8px rgba(231, 76, 60, 0.4); }
  100% { text-shadow: 0 0 20px rgba(231, 76, 60, 0.8), 0 0 40px rgba(231, 76, 60, 0.3); }
}

@keyframes linePulse {
  0% { width: 60%; left: 20%; }
  100% { width: 100%; left: 0; }
}

/* ── 底部内容区 ── */
/* ── 横向滚动容器 ── */
.tool-scroll-wrap {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 10px 0;
  cursor: grab;
  perspective: 800px;
  perspective-origin: center center;
}
.tool-scroll-wrap::-webkit-scrollbar { display: none; }

.tool-grid {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  height: 100%;
  width: fit-content;
  padding: 0 50vw;
  transform-style: preserve-3d;
}

.tool-card {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  cursor: pointer;
  text-decoration: none;
  color: #fff;
  text-align: center;
  width: 180px;
  height: 240px;
  transition: transform 0.12s ease, opacity 0.12s ease;
  will-change: transform, opacity;
  backface-visibility: hidden;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tool-card:hover {
  border-color: rgba(231, 76, 60, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.tool-card-icon {
  position: absolute;
  inset: 0;
  z-index: 0;
  margin: 0;
  line-height: 0;
  font-size: 0;
}

.tool-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 0;
}

.tool-card-body {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background: linear-gradient(transparent, rgba(0,0,0,0.7) 40%);
  padding: 40px 14px 14px;
  pointer-events: none;
}

.tool-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 2px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.tool-card-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* 无图片时的样式 */
.tool-card-icon span {
  font-size: 2.8em;
  line-height: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ── 指示点 ── */
.tool-dots {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 4px 0 20px;
}

.tool-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.25s;
}

.tool-dot:hover {
  background: rgba(255, 255, 255, 0.45);
}

.tool-dot.active {
  background: #e74c3c;
  box-shadow: 0 0 6px rgba(231, 76, 60, 0.5);
  width: 10px;
  height: 10px;
}

/* ── 工具界面 ── */
.tool-interface {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  margin: 70px 24px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tool-interface .tool-section {
  flex: 1;
  overflow-y: auto;
  padding: 4px 28px 8px;
  min-height: 0;
}

.tool-interface-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.tool-interface-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.tool-section {
  padding: 0 4px;
}

/* ── 上传区 ── */
.upload-area {
  text-align: center;
  padding: 24px 0;
}

.file-input-hidden {
  display: none;
}

/* ── 预览 ── */
.preview-area {
  margin-top: 20px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.preview-box {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fafafa;
}

.preview-box h4 {
  margin: 0;
  padding: 10px 14px;
  font-size: 14px;
  color: #333;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.preview-img-wrap {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.preview-img-wrap img {
  max-width: 100%;
  max-height: 350px;
  border-radius: 6px;
  object-fit: contain;
}

.preview-placeholder {
  padding: 80px 20px;
  text-align: center;
  color: #bbb;
  font-size: 15px;
}

.preview-info {
  margin: 0;
  padding: 8px 14px;
  font-size: 12px;
  color: #999;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

/* ── 控制栏 ── */
.control-bar {
  background: #f8f8f8;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.control-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-item {
  flex: 1;
  min-width: 140px;
}

.control-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.resize-mode {
  justify-content: center;
}

/* ── 分割结果 ── */
.split-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px;
}

.split-thumb {
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.split-thumb img {
  width: 100%;
  display: block;
}

.split-thumb span {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
}

/* ── 结果操作 ── */
.result-actions {
  text-align: center;
  padding: 8px 0;
}

/* ── 网站图标 ── */
.favicon-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.favicon-input-row .el-input {
  flex: 1;
}

.favicon-result {
  margin-top: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.favicon-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.favicon-icon-wrap {
  width: 128px;
  height: 128px;
  border-radius: 20px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.favicon-icon-wrap img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.favicon-domain {
  font-size: 16px;
  font-weight: 600;
  color: #555;
}

.favicon-info {
  width: 100%;
  max-width: 500px;
}

.favicon-info p {
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
}

.favicon-url-copy {
  width: 100%;
}

.favicon-error {
  margin-top: 20px;
}

/* ── 运行 JS 代码 ── */
.jsrun-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 500px;
}

.jsrun-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.jsrun-output {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.jsrun-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.jsrun-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  letter-spacing: 1px;
  margin-right: auto;
}

/* ── 语法高亮编辑器 ── */
.code-editor-wrap {
  position: relative;
  flex: 1;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
}

.code-highlight-layer,
.code-textarea {
  position: absolute;
  inset: 0;
  padding: 18px;
  margin: 0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.7;
  tab-size: 2;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
  border: none;
  outline: none;
}

.code-highlight-layer {
  z-index: 1;
  background: #1e1e1e;
  color: #d4d4d4;
  pointer-events: none;
}

.code-highlight-layer code {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  background: none !important;
  color: inherit !important;
}

.code-textarea {
  z-index: 2;
  color: transparent;
  background: transparent;
  caret-color: white;
  resize: none;
}

.code-textarea::placeholder {
  color: #555;
}

.code-textarea:focus {
  outline: none;
}

.jsrun-result {
  flex: 1;
  padding: 18px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.7;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  background: #1e1e1e;
  color: #d4d4d4;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.jsrun-result.has-error {
  color: #f48771;
}

.jsrun-result pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
  word-break: break-all;
}

.jsrun-placeholder {
  color: #555;
  font-size: 13px;
  font-family: inherit;
}

/* ── CSS 在线编辑 ── */
.cssedit-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 500px;
}

.cssedit-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cssedit-editor .code-editor-sm {
  min-height: 120px;
  max-height: 180px;
}

.cssedit-editor .code-editor-wrap:not(.code-editor-sm) {
  flex: 1;
}

.cssedit-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cssedit-frame {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.cssedit-frame-wrap {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  background: #fff;
  position: relative;
  cursor: default;
}

.cssedit-frame-wrap.css-select-active {
  cursor: crosshair;
}

.css-select-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  cursor: crosshair;
}

.css-select-box {
  position: absolute;
  z-index: 11;
  border: 2px dashed #e74c3c;
  background: rgba(231, 76, 60, 0.08);
  pointer-events: none;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .tool-header {
    padding: 60px 20px 10px;
  }

  .hero-title {
    font-size: 2em;
  }

  .tool-scroll-wrap {
    padding: 10px 0;
  }

  .tool-card {
    width: 140px;
    height: 200px;
  }

  .tool-card-icon {
    font-size: 2.6em;
  }

  .tool-card.active {
    transform: scale(1);
  }

  .tool-card.near {
    transform: scale(0.85);
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .control-row {
    flex-direction: column;
  }

  .control-item {
    min-width: auto;
  }

  .jsrun-layout,
  .cssedit-layout,
  .api-layout {
    flex-direction: column;
    height: auto;
  }

  .jsrun-editor,
  .jsrun-output,
  .cssedit-editor,
  .cssedit-preview {
    height: 320px;
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: 24px 18px;
    width: 130px;
    height: 180px;
  }
  .tool-card-icon {
    font-size: 2.4em;
  }
  .tool-card-title {
    font-size: 15px;
  }
  .tool-card-desc {
    display: none;
  }
}

/* ── 图片上传 ── */
.upload-inline {
  padding: 8px 0;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.upload-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.upload-row-group {
  display: flex;
  gap: 8px;
  flex: 1;
}

.up-album-select {
  width: 200px;
}

.up-dropzone {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  margin-bottom: 16px;
}

.up-dropzone:hover,
.up-dragover {
  border-color: #3498db;
  background: #f0f8ff;
}

.up-dropicon {
  font-size: 36px;
  margin-bottom: 8px;
}

.up-dropzone p {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px;
}

.up-dropzone small {
  font-size: 12px;
  color: #bbb;
}

.up-files {
  margin-bottom: 12px;
}

.up-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.up-file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.up-file-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #fafafa;
}

.up-file-card img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.up-progress {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
}

.up-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.up-ok { background: #07c160; }
.up-fail { background: #e74c3c; }

.up-file-name {
  padding: 4px 6px;
  font-size: 11px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.up-del {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.up-file-card:hover .up-del {
  opacity: 1;
}

.up-results {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.up-results h4 {
  margin: 0 0 6px;
  font-size: 13px;
  color: #555;
}

.up-r-ok { color: #07c160; font-size: 12px; padding: 2px 0; }
.up-r-fail { color: #e74c3c; font-size: 12px; padding: 2px 0; }

/* ── API 调试 ── */
.api-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 500px;
}

.api-sidebar {
  width: 260px;
  flex-shrink: 0;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
  padding: 8px;
}

.api-group {
  margin-bottom: 4px;
}

.api-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  transition: background 0.2s;
}

.api-group-header:hover {
  background: #f0f0f0;
}

.api-group-name {
  flex: 1;
}

.api-group-count {
  font-size: 11px;
  color: #aaa;
  background: #eee;
  padding: 0 6px;
  border-radius: 8px;
}

.api-arrow {
  font-size: 10px;
  transition: transform 0.2s;
  color: #aaa;
}

.api-arrow.expanded {
  transform: rotate(90deg);
}

.api-group-body {
  padding: 2px 0 2px 12px;
}

.api-ep {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
}

.api-ep:hover {
  background: #f0f0f0;
  color: #333;
}

.api-ep.active {
  background: #fff2f0;
  color: #e74c3c;
}

.api-method {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  color: #fff;
  flex-shrink: 0;
}

.api-method.get { background: #2ecc71; }
.api-method.post { background: #3498db; }
.api-method.put { background: #f39c12; }
.api-method.delete { background: #e74c3c; }

.api-main {
  flex: 1;
  min-width: 0;
}

.api-form-card {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
}

.api-form-row {
  margin-bottom: 12px;
}

.api-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.api-select {
  width: 140px;
}

.api-params {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.api-param-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-param-label {
  font-size: 12px;
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.api-req {
  color: #e74c3c;
  margin-left: 2px;
}

.api-no-params {
  font-size: 12px;
  color: #bbb;
  padding: 8px 0;
}

.api-response {
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.api-response h4 {
  font-size: 13px;
  color: #555;
  margin: 0 0 8px;
}

.api-response pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
