<template>
  <div class="forum-new-page" :style="pageStyle">
    <div class="hero-overlay"></div>
    
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">
          {{ isEditMode ? "编辑帖子" : "发布新帖" }}
        </h1>
      </div>
      <div class="form-body">
        <div class="form-section">
          <label class="form-label">
            <span class="label-icon"><Edit /></span>
            帖子标题
          </label>
          <el-input 
            v-model="form.title" 
            placeholder="请输入帖子标题..." 
            maxlength="50"
            class="title-input"
          />
          <span class="char-count">{{ form.title.length }}/50</span>
        </div>
        
        <div class="form-section">
          <label class="form-label">
            <span class="label-icon"><Document /></span>
            内容编辑
          </label>
          
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="formatText('bold')"
                title="粗体"
              >
                B
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('italic')"
                title="斜体"
              >
                I
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('underline')"
                title="下划线"
              >
                U
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('strikethrough')"
                title="删除线"
              >
                S
              </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="formatText('h1')"
                title="标题1"
              >
                H1
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('h2')"
                title="标题2"
              >
                H2
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('h3')"
                title="标题3"
              >
                H3
              </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="formatText('quote')"
                title="引用"
              >
                引用
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('code')"
                title="代码块"
              >
                代码
              </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="formatText('link')"
                title="插入链接"
              >
                <Link />
              </button>
              <label class="toolbar-btn" title="上传图片">
                图片
                <input 
                  type="file" 
                  accept="image/*" 
                  class="file-input"
                  @change="handleImageUpload"
                />
              </label>
              <button 
                class="toolbar-btn" 
                @click="showImageUrlModal = true"
                title="通过URL插入图片"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <text x="16" y="21" font-size="10" fill="currentColor" font-weight="bold">URL</text>
                </svg>
              </button>
              <button 
                class="toolbar-btn" 
                @click="openAlbumPicker"
                title="从相册选择"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="2"/>
                  <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5-4 4-3-3-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="textColor" 
                  id="colorPicker"
                  class="text-color-picker"
                  @input="applyTextColor"
                />
                <label for="colorPicker" class="color-label" title="文字颜色">
                  颜色
                </label>
              </div>
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="bgColor" 
                  id="bgColorPicker"
                  class="text-color-picker"
                  @input="applyBgColor"
                />
                <label for="bgColorPicker" class="color-label" title="文字背景颜色">
                  背景
                </label>
              </div>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <div class="fontsize-wrapper">
                <button 
                  ref="fontSizeBtnRef"
                  class="toolbar-btn fontsize-btn"
                  @click="toggleFontSizeDropdown"
                  title="字体大小"
                >
                  <span style="font-size:10px">{{ fontSize }}px</span>
                </button>
                <Teleport to="body">
                  <div v-if="showFontSizeDropdown" class="fontsize-dropdown" :style="fontSizeDropdownStyle" @click.stop>
                    <div class="fontsize-custom">
                      <input 
                        ref="customSizeInputRef"
                        v-model="customFontSize"
                        type="number"
                        min="1"
                        max="200"
                        class="fontsize-input"
                        placeholder="自定义"
                        @keydown.enter="applyCustomFontSize"
                        @blur="applyCustomFontSize"
                      />
                      <button class="fontsize-apply" @click="applyCustomFontSize" title="应用">px</button>
                    </div>
                    <div class="fontsize-divider"></div>
                    <div 
                      v-for="size in fontSizes" 
                      :key="size"
                      class="fontsize-option"
                      :class="{ active: fontSize === size }"
                      @click="applyFontSize(size)"
                    >
                      <span :style="{ fontSize: size + 'px' }">{{ size }}px</span>
                    </div>
                  </div>
                </Teleport>
              </div>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="formatText('justifyLeft')"
                title="左对齐"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21M3 12H15M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('justifyCenter')"
                title="居中对齐"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21M6 12H18M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('justifyRight')"
                title="右对齐"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21M9 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            
            <div class="toolbar-divider"></div>
            
            <div class="toolbar-group">
              <button 
                class="toolbar-btn" 
                @click="removeFormat"
                title="清除样式"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M12 7V9M17 12H15M9 12H7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button 
                class="toolbar-btn" 
                @click="formatText('hr')"
                title="分割线"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button 
                class="toolbar-btn" 
                :class="{ 'has-format': copiedFormat !== null }"
                @click="copyFormat"
                title="复制样式"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 16V10H8V4H16M16 16C16 16.5304 15.7893 17.0391 15.4142 17.4142C15.0391 17.7893 14.5304 18 14 18H8C7.46957 18 6.96086 17.7893 6.58579 17.4142C6.21071 17.0391 6 16.5304 6 16V4C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button 
                class="toolbar-btn"
                :class="{ 'can-paste': copiedFormat !== null }"
                @click="pasteFormat"
                title="粘贴样式"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19V17M8 5C8 5.53043 8.21071 6.03914 8.58579 6.41421C8.96086 6.78929 9.46957 7 10 7H12C12.5304 7 13.0391 6.78929 13.4142 6.41421C13.7893 6.03914 14 5.53043 14 5M8 5C8 4.46957 8.21071 3.96086 8.58579 3.58579C8.96086 3.21071 9.46957 3 10 3H12C12.5304 3 13.0391 3.21071 13.4142 3.58579C13.7893 3.96086 14 4.46957 14 5M14 5H16C16.5304 5 17.0391 5.21071 17.4142 5.58579C17.7893 5.96086 18 6.46957 18 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12H11M21 12L18 9M21 12L18 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="editor-wrapper">
            <div class="editor-main">
              <div 
                ref="editorRef"
                class="editor-content"
                contenteditable="true"
                @input="onEditorInput"
                @keydown="onEditorKeydown"
                @scroll="onEditorScroll"
                placeholder="在这里输入内容..."
              ></div>
              
              <textarea 
                v-model="form.content" 
                class="hidden-content"
              ></textarea>
              
              <span class="char-count">{{ contentLength }}/5000</span>
            </div>
            
            <div class="right-sidebar">
              <!-- 封面上传区域 -->
              <div class="cover-section">
                <div class="section-header">
                  <span class="section-title">封面</span>
                </div>
                <div v-if="!coverUrl" class="cover-upload-small">
                  <div class="cover-upload-actions">
                    <div class="cover-upload-action" @click="triggerCoverUpload">
                      <input 
                        ref="coverFileInputRef"
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        class="file-input"
                        @change="handleCoverUpload"
                      />
                      <svg class="upload-icon-small" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span>上传</span>
                    </div>
                    <div class="cover-upload-action cover-upload-url" @click="setCoverByUrl">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <text x="16" y="21" font-size="10" fill="currentColor" font-weight="bold">URL</text>
                      </svg>
                      <span>URL</span>
                    </div>
                  </div>
                  <div v-if="uploadingCover" class="uploading-status-small">
                    <span>上传中...</span>
                  </div>
                </div>
                <div v-else class="cover-preview-small">
                  <img :src="coverUrl" alt="封面预览" class="cover-preview-img-small" />
                  <button class="remove-cover-btn-small" @click="removeCover">
                    ×
                  </button>
                </div>
              </div>
              
              <!-- 目录区域 -->
              <div v-if="tocHeadings.length > 0" class="toc-panel">
                <div class="toc-header">
                  <span class="toc-title">目录</span>
                </div>
                <div class="toc-list">
                  <a 
                    v-for="(heading, index) in tocHeadings" 
                    :key="index"
                    :href="'#' + heading.id"
                    class="toc-item"
                    :class="{ 'toc-h1': heading.level === 1, 'toc-h2': heading.level === 2, 'toc-h3': heading.level === 3, 'active': activeHeading === heading.id }"
                    @click.prevent="scrollToHeading(heading)"
                  >
                    {{ heading.text }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <label class="form-label">
            <span class="label-icon"><Edit /></span>
            分类
          </label>
          <el-select 
            v-model="form.category" 
            placeholder="请选择分类"
            class="category-select"
          >
            <el-option label="技术讨论" value="技术讨论" />
            <el-option label="生活分享" value="生活分享" />
            <el-option label="求助问答" value="求助问答" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>

        <div class="form-section">
          <label class="form-label">
            <span class="label-icon"><EditPen /></span>
            标签
          </label>
          <div class="tags-container">
            <div
              v-for="tag in selectedTags"
              :key="tag.名称"
              class="tag-item tag-item-selected"
              :style="{ backgroundColor: tag.代表颜色, borderColor: tag.代表颜色 }"
            >
              {{ tag.名称 }}
              <span class="tag-remove" @click="removeSelectedTag(tag)">&times;</span>
            </div>
            <button class="add-tag-btn" @click="openTagSelector">
              <Plus />
              选择标签
            </button>
          </div>
        </div>
      </div>
      
      <div class="form-footer">
        <el-button class="btn-cancel" @click="goBack">
          <ArrowLeft />
          取消
        </el-button>
        <el-button type="primary" class="btn-submit" @click="submitForm">
          {{ isEditMode ? "保存修改" : "发布帖子" }}
        </el-button>
      </div>
    </div>
    
    <el-dialog 
      title="插入链接" 
      v-model="showLinkModal"
      width="400px"
    >
      <el-form :model="linkForm" label-width="60px">
        <el-form-item label="链接">
          <el-input v-model="linkForm.url" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="显示文本">
          <el-input v-model="linkForm.text" placeholder="链接显示的文本" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLinkModal = false">取消</el-button>
        <el-button type="primary" @click="insertLink">插入</el-button>
      </template>
    </el-dialog>

    <!-- 通过 URL 插入图片弹窗 -->
    <el-dialog 
      title="通过 URL 插入图片" 
      v-model="showImageUrlModal"
      width="450px"
    >
      <el-form label-width="70px">
        <el-form-item label="图片URL">
          <el-input 
            v-model="imageUrlForm.url" 
            placeholder="请输入图片地址，如 https://example.com/image.jpg"
            @keydown.enter="insertImageByUrl"
          />
        </el-form-item>
        <el-form-item label="预览">
          <div v-if="imageUrlForm.url" class="image-url-preview">
            <img 
              :src="imageUrlForm.url" 
              alt="图片预览"
              @error="onImagePreviewError"
              @load="onImagePreviewLoad"
              :class="{ 'preview-error': previewError }"
            />
            <p v-if="previewError" class="preview-error-text">
              图片加载失败，请检查 URL 是否正确
            </p>
          </div>
          <div v-else class="image-url-placeholder">
            <span>输入 URL 后将显示预览</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeImageUrlModal">取消</el-button>
        <el-button type="primary" @click="insertImageByUrl" :disabled="!imageUrlForm.url">插入图片</el-button>
      </template>
    </el-dialog>

    <!-- 选择标签弹窗 -->
    <el-dialog 
      title="选择标签" 
      v-model="showTagSelectorModal"
      width="480px"
      class="tag-selector-dialog"
      @close="cancelTagSelection"
    >
      <div class="tag-selector-body">
        <!-- 已有标签列表 -->
        <div class="tag-selector-section">
          <div class="tag-selector-label">已有标签</div>
          <div v-if="allTags.length === 0" class="tag-selector-empty">
            暂无标签，请在下方创建
          </div>
          <div v-else class="tag-selector-grid">
            <div 
              v-for="tag in allTags" 
              :key="tag.名称"
              class="tag-selector-item"
              :class="{ selected: isTempTagSelected(tag) }"
              :style="{ borderColor: tag.代表颜色, backgroundColor: isTempTagSelected(tag) ? tag.代表颜色 : 'transparent' }"
              @click="toggleTempTag(tag)"
            >
              <span class="tag-selector-check">
                <svg v-if="isTempTagSelected(tag)" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </span>
              {{ tag.名称 }}
            </div>
          </div>
        </div>

        <div class="tag-selector-divider"></div>

        <!-- 创建新标签 -->
        <div class="tag-selector-section">
          <div class="tag-selector-label">创建新标签</div>
          <div class="tag-create-row">
            <input 
              v-model="newTagName" 
              placeholder="输入标签名称"
              maxlength="20"
              class="tag-create-input"
              @keydown.enter="handleAddTagInDialog"
            />
            <div class="tag-create-color-wrapper">
              <input 
                type="color" 
                v-model="newTagColor"
                class="tag-create-color"
              />
              <span class="tag-create-color-label" :style="{ backgroundColor: newTagColor }"></span>
            </div>
            <button class="tag-create-btn" @click="handleAddTagInDialog" :disabled="!newTagName.trim()">
              <Plus /> 创建
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelTagSelection">取消</el-button>
        <el-button type="primary" @click="confirmTagSelection">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 从相册选择图片弹窗 -->
    <el-dialog 
      title="从相册选择图片" 
      v-model="showAlbumPickerModal"
      width="650px"
      class="album-picker-dialog"
      @closed="closeAlbumPicker"
    >
      <!-- 相册列表 -->
      <div v-if="!albumPickerSelectedAlbum" class="album-picker-body">
        <div v-if="albumPickerLoading" class="album-picker-loading">
          加载相册中...
        </div>
        <div v-else-if="albumPickerAlbums.length === 0" class="album-picker-empty">
          暂无相册
        </div>
        <div v-else class="album-picker-grid">
          <div 
            v-for="album in albumPickerAlbums" 
            :key="album.name"
            class="album-picker-card"
            @click="selectAlbumPickerAlbum(album)"
          >
            <div class="album-picker-card-cover">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5-4 4-3-3-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="album-picker-card-info">
              <span class="album-picker-card-name">{{ album.name }}</span>
              <span class="album-picker-card-count">{{ album.image_num || 0 }} 张</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 相册内图片列表 -->
      <div v-else class="album-picker-body">
        <div class="album-picker-back">
          <button class="album-back-btn" @click="albumPickerSelectedAlbum = null">
            ← 返回相册列表
          </button>
          <span class="album-picker-current-name">{{ albumPickerSelectedAlbum.name }}</span>
        </div>
        <div v-if="albumPickerPhotosLoading" class="album-picker-loading">
          加载图片中...
        </div>
        <div v-else-if="albumPickerPhotos.length === 0" class="album-picker-empty">
          该相册暂无图片
        </div>
        <div v-else class="album-picker-photo-grid">
          <div 
            v-for="(photo, index) in albumPickerPhotos" 
            :key="index"
            class="album-picker-photo-item"
            @click="insertAlbumPhoto(photo)"
          >
            <img :src="photo.url" :alt="photo.name || '图片'" />
            <div class="album-picker-photo-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              插入
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 代码语言选择弹窗 -->
    <el-dialog 
      title="选择代码语言" 
      v-model="showCodeLanguageModal"
      width="450px"
      class="code-language-dialog"
    >
      <div class="language-grid">
        <div 
          v-for="lang in codeLanguages" 
          :key="lang.value"
          class="language-option"
          :class="{ active: codeLanguage === lang.value }"
          @click="codeLanguage = lang.value"
        >
          <span class="lang-icon">{{ lang.icon }}</span>
          <span class="lang-name">{{ lang.label }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCodeLanguageModal = false">取消</el-button>
        <el-button type="primary" @click="insertCodeBlockWithLanguage">插入代码块</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox, ElDialog } from "element-plus";
import { 
  Edit, EditPen, Document, Link, ArrowLeft, Plus
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { getForumTags, addForumTag, addForumPost, updateForumPost, getAlbums } from "@/api/data";
import { uploadToPicUI, getPicUIAlbum } from "@/api/external";
import { Forum, ForumTag } from "@/types/forum";
import constant from "@/utils/constant";
import Prism from "prismjs";
import "prism-themes/themes/prism-vsc-dark-plus.min.css";
// 基础语言组件（按依赖顺序导入）
import "prismjs/components/prism-markup.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-clike.min.js";
import "prismjs/components/prism-javascript.min.js";
// 依赖 clike 的语言
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-cpp.min.js";
import "prismjs/components/prism-csharp.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-rust.min.js";
import "prismjs/components/prism-ruby.min.js";
import "prismjs/components/prism-php.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-bash.min.js";
// 依赖 javascript 的语言
import "prismjs/components/prism-typescript.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-tsx.min.js";
// 其他独立语言
import "prismjs/components/prism-sql.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-yaml.min.js";
// 依赖 markup 的语言
import "prismjs/components/prism-markdown.min.js";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();


// 检查是否是编辑模式
const isEditMode = computed(() => {
  return editingPost.value != null;
});

const editingPost = ref<Forum | null>(null);

const form = ref({
  title: "",
  content: "",
  category: "技术讨论",
});

const editorRef = ref<HTMLDivElement | null>(null);

const showLinkModal = ref(false);
const uploading = ref(false);

// 保存弹窗打开前的光标位置
let savedRange: Range | null = null;

const saveCursorPosition = () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
};

const restoreCursorPosition = () => {
  if (savedRange) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  }
};

// 通过 URL 插入图片
const showImageUrlModal = ref(false);
const previewError = ref(false);
const imageUrlForm = ref({
  url: "",
});

const closeImageUrlModal = () => {
  showImageUrlModal.value = false;
  imageUrlForm.value.url = "";
  previewError.value = false;
};

const onImagePreviewError = () => {
  previewError.value = true;
};

const onImagePreviewLoad = () => {
  previewError.value = false;
};

const insertImageByUrl = () => {
  const url = imageUrlForm.value.url.trim();
  if (!url) {
    ElMessage.error("请输入图片地址");
    return;
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    ElMessage.error("请输入以 http:// 或 https:// 开头的图片地址");
    return;
  }
  
  const editor = editorRef.value;
  if (!editor) return;
  
  editor.focus();
  
  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  img.style.borderRadius = '8px';
  img.style.margin = '4px';
  img.style.display = 'inline-block';
  img.style.verticalAlign = 'middle';
  
  img.onerror = () => {
    console.error("图片加载失败，URL:", url);
    ElMessage.error("图片加载失败，请检查URL是否正确");
    img.remove();
  };
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
    
    // 在图片后添加换行
    const br = document.createElement('br');
    img.parentNode?.insertBefore(br, img.nextSibling);
    
    // 将光标定位到图片后面
    setTimeout(() => {
      const newRange = document.createRange();
      newRange.setStartAfter(br);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }, 0);
  } else {
    editor.appendChild(document.createElement('br'));
    editor.appendChild(img);
    editor.appendChild(document.createElement('br'));
  }
  
  editor.focus();
  ElMessage.success("图片已插入");
  closeImageUrlModal();
};

// 相册选择相关
const showAlbumPickerModal = ref(false);
const albumPickerLoading = ref(false);
const albumPickerAlbums = ref<{ name: string; image_num: number }[]>([]);
const albumPickerSelectedAlbum = ref<{ name: string; image_num: number } | null>(null);
const albumPickerPhotosLoading = ref(false);
const albumPickerPhotos = ref<{ url: string; name: string }[]>([]);

const openAlbumPicker = async () => {
  showAlbumPickerModal.value = true;
  albumPickerLoading.value = true;
  albumPickerSelectedAlbum.value = null;
  albumPickerPhotos.value = [];
  try {
    // 和相册页面一样，从本地相册表获取（管理员可见全部，非管理员仅可见指定的）
    const albumData = await getAlbums() as any;
    
    let albumNames: string[] = [];
    if (Array.isArray(albumData)) {
      albumNames = albumData.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    } else if (albumData?.data && Array.isArray(albumData.data)) {
      albumNames = albumData.data.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    } else if (albumData?.rows && Array.isArray(albumData.rows)) {
      albumNames = albumData.rows.map((item: any) => item.name || item.albumName || item.title || item.value || item['相册名']).filter(Boolean);
    }

    // 并行获取每个相册的封面和图片数量
    const results = await Promise.allSettled(
      albumNames.map(name => getPicUIAlbum(name))
    );

    const albums: { name: string; image_num: number }[] = [];
    results.forEach((result, index) => {
      const albumName = albumNames[index];
      if (result.status === 'fulfilled') {
        const res = result.value as any;
        let imageCount = 0;
        if (res?.status === true) {
          let images: any[] = [];
          if (res.data?.data) images = res.data.data;
          else if (Array.isArray(res.data)) images = res.data;
          imageCount = images.length;
        }
        albums.push({ name: albumName, image_num: imageCount });
      } else {
        albums.push({ name: albumName, image_num: 0 });
      }
    });

    albumPickerAlbums.value = albums;
  } catch (e) {
    console.error('获取相册列表失败', e);
    albumPickerAlbums.value = [];
  } finally {
    albumPickerLoading.value = false;
  }
};

const selectAlbumPickerAlbum = async (album: { name: string; image_num: number }) => {
  albumPickerSelectedAlbum.value = album;
  albumPickerPhotosLoading.value = true;
  albumPickerPhotos.value = [];
  try {
    const response = await getPicUIAlbum(album.name) as any;
    if (response?.status === true) {
      let images: any[] = [];
      if (response.data?.data) {
        images = response.data.data;
      } else if (Array.isArray(response.data)) {
        images = response.data;
      }
      albumPickerPhotos.value = images
        .map((item: any) => ({
          url: item.links?.url || item.url || '',
          name: item.name || item.filename || item.title || '',
        }))
        .filter((item: any) => item.url);
    }
  } catch (e) {
    console.error('加载相册图片失败', e);
  } finally {
    albumPickerPhotosLoading.value = false;
  }
};

const insertAlbumPhoto = (photo: { url: string; name: string }) => {
  const editor = editorRef.value;
  if (!editor) return;
  
  editor.focus();
  
  const img = document.createElement('img');
  img.src = photo.url;
  img.alt = photo.name || '';
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  img.style.borderRadius = '8px';
  img.style.margin = '4px';
  img.style.display = 'inline-block';
  img.style.verticalAlign = 'middle';
  
  img.onerror = () => {
    console.error('图片加载失败，URL:', photo.url);
    ElMessage.error('图片加载失败');
    img.remove();
  };
  
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
    const br = document.createElement('br');
    img.parentNode?.insertBefore(br, img.nextSibling);
    setTimeout(() => {
      const newRange = document.createRange();
      newRange.setStartAfter(br);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }, 0);
  } else {
    editor.appendChild(document.createElement('br'));
    editor.appendChild(img);
    editor.appendChild(document.createElement('br'));
  }
  
  editor.focus();
  ElMessage.success('图片已插入');
  showAlbumPickerModal.value = false;
};

const closeAlbumPicker = () => {
  albumPickerSelectedAlbum.value = null;
  albumPickerPhotos.value = [];
};

// 代码语言相关
const showCodeLanguageModal = ref(false);
const codeLanguage = ref("javascript");

interface CodeLanguage {
  label: string;
  value: string;
  icon: string;
}

const codeLanguages: CodeLanguage[] = [
  { label: "JavaScript", value: "javascript", icon: "🟨" },
  { label: "TypeScript", value: "typescript", icon: "🔵" },
  { label: "HTML", value: "html", icon: "🟠" },
  { label: "CSS", value: "css", icon: "🟣" },
  { label: "Vue", value: "vue", icon: "🟢" },
  { label: "React JSX", value: "jsx", icon: "⚛️" },
  { label: "React TSX", value: "tsx", icon: "⚛️" },
  { label: "Python", value: "python", icon: "🐍" },
  { label: "Java", value: "java", icon: "☕" },
  { label: "Go", value: "go", icon: "🔷" },
  { label: "C++", value: "cpp", icon: "⚙️" },
  { label: "C#", value: "csharp", icon: "🎯" },
  { label: "Rust", value: "rust", icon: "🦀" },
  { label: "Ruby", value: "ruby", icon: "💎" },
  { label: "PHP", value: "php", icon: "🐘" },
  { label: "SQL", value: "sql", icon: "🗄️" },
  { label: "JSON", value: "json", icon: "📋" },
  { label: "YAML", value: "yaml", icon: "📄" },
  { label: "Markdown", value: "markdown", icon: "📝" },
  { label: "Bash/Shell", value: "bash", icon: "💻" },
  { label: "Docker", value: "docker", icon: "🐳" },
  { label: "Git", value: "git", icon: "🔀" },
];

const linkForm = ref({
  url: "",
  text: "",
});

// 标签相关
const allTags = ref<ForumTag[]>([]);
const selectedTags = ref<ForumTag[]>([]);
const showTagSelectorModal = ref(false);
const newTagName = ref("");
const newTagColor = ref("#667eea");

// 弹窗内的临时选中状态（确认后才同步到 selectedTags）
const tempSelectedTags = ref<ForumTag[]>([]);

const openTagSelector = () => {
  // 打开时，将当前已选标签同步到临时列表
  tempSelectedTags.value = selectedTags.value.map(t => ({ ...t }));
  showTagSelectorModal.value = true;
};

const confirmTagSelection = () => {
  selectedTags.value = tempSelectedTags.value.map(t => ({ ...t }));
  showTagSelectorModal.value = false;
};

const cancelTagSelection = () => {
  tempSelectedTags.value = [];
  newTagName.value = "";
  showTagSelectorModal.value = false;
};

const isTempTagSelected = (tag: ForumTag) => {
  return tempSelectedTags.value.some(t => t.名称 === tag.名称);
};

const toggleTempTag = (tag: ForumTag) => {
  const index = tempSelectedTags.value.findIndex(t => t.名称 === tag.名称);
  if (index > -1) {
    tempSelectedTags.value.splice(index, 1);
  } else {
    tempSelectedTags.value.push({ ...tag });
  }
};

const removeSelectedTag = (tag: ForumTag) => {
  const index = selectedTags.value.findIndex(t => t.名称 === tag.名称);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  }
};

// 封面相关
const coverUrl = ref("");
const coverFileInputRef = ref<HTMLInputElement | null>(null);
const uploadingCover = ref(false);

const textColor = ref("#333333");
const bgColor = ref("#ffff00");

// 字体大小
const fontSize = ref(16);

const fontSizeBtnRef = ref<HTMLElement | null>(null);
const customSizeInputRef = ref<HTMLInputElement | null>(null);

const showFontSizeDropdown = ref(false);
const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const customFontSize = ref("");

const toggleFontSizeDropdown = () => {
  // 打开下拉前保存光标位置
  if (!showFontSizeDropdown.value) {
    saveCursorPosition();
  }
  showFontSizeDropdown.value = !showFontSizeDropdown.value;
};

const applyCustomFontSize = () => {
  const val = parseInt(customFontSize.value);
  if (isNaN(val) || val < 1) {
    customFontSize.value = "";
    return;
  }
  const size = Math.min(Math.max(val, 1), 200);
  applyFontSize(size);
  customFontSize.value = "";
};

// 打开下拉时聚焦到自定义输入框
watch(showFontSizeDropdown, (val) => {
  if (val) {
    nextTick(() => {
      customSizeInputRef.value?.focus();
    });
  }
});

const fontSizeDropdownStyle = computed(() => {
  if (!showFontSizeDropdown.value || !fontSizeBtnRef.value) {
    return { display: 'none' };
  }
  const rect = fontSizeBtnRef.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    zIndex: 10000,
  } as Record<string, string>;
});

const applyFontSize = (size: number) => {
  showFontSizeDropdown.value = false;
  fontSize.value = size;
  
  if (!editorRef.value) return;
  editorRef.value.focus();
  
  // 恢复之前保存的光标位置
  restoreCursorPosition();
  
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  
  if (selection.isCollapsed) {
    // 没有选中文字：插入带样式的 span 并将光标定位到其内部
    const markerId = `fs-${Date.now()}`;
    document.execCommand('insertHTML', false, `<span id="${markerId}" style="font-size:${size}px">\u200B</span>`);
    
    const marker = editorRef.value.querySelector(`#${markerId}`);
    if (marker) {
      marker.removeAttribute('id');
      const textNode = marker.firstChild;
      if (textNode) {
        const newRange = document.createRange();
        newRange.setStart(textNode, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    return;
  }
  
  // 有选中文字：用 insertHTML 包裹，兼容 contenteditable 的复杂内容
  const selectedText = range.toString();
  if (!selectedText) return;
  
  // HTML 转义，防止特殊字符破坏结构
  const escaped = selectedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  document.execCommand('insertHTML', false, `<span style="font-size:${size}px">${escaped}\u200B</span>`);
  
  // 将光标定位到 span 内部末尾（零宽空格之后），后续输入保持字体大小
  const spans = editorRef.value.querySelectorAll('span[style*="font-size"]');
  const lastSpan = spans[spans.length - 1];
  if (lastSpan) {
    const textNode = lastSpan.firstChild;
    if (textNode) {
      const newRange = document.createRange();
      newRange.setStart(textNode, (textNode as Text).length);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }
};

// 点击外部关闭字体大小下拉
const closeFontSizeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (showFontSizeDropdown.value && 
      !target.closest('.fontsize-wrapper') && 
      !target.closest('.fontsize-dropdown')) {
    showFontSizeDropdown.value = false;
  }
};

// 黑色背景
const pageStyle = { backgroundColor: '#1a1a1a' };

const contentLength = computed(() => {
  if (!editorRef.value) return 0;
  void tocVersion.value;
  return editorRef.value.innerText.length;
});

interface TocHeading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

const activeHeading = ref<string>("");
// 目录更新触发器，每次编辑器内容变化时递增
const tocVersion = ref(0);

const tocHeadings = computed(() => {
  // 依赖 editorRef 和 tocVersion，内容变化时重新计算
  if (!editorRef.value) return [];
  void tocVersion.value;
  
  const headings: TocHeading[] = [];
  const editor = editorRef.value;
  const headingElements = editor.querySelectorAll('h1, h2, h3');
  
  headingElements.forEach((el, index) => {
    const id = `heading-${index}`;
    if (!el.id) {
      el.id = id;
    }
    headings.push({
      id: el.id || id,
      text: el.innerText,
      level: parseInt(el.tagName.substring(1)),
      element: el as HTMLElement,
    });
  });
  
  return headings;
});

const onEditorScroll = () => {
  if (!editorRef.value) return;
  
  const editor = editorRef.value;
  const scrollTop = editor.scrollTop;
  const headings = tocHeadings.value;
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    const offsetTop = heading.element.offsetTop;
    
    if (scrollTop >= offsetTop - 20) {
      activeHeading.value = heading.id;
      return;
    }
  }
  
  if (headings.length > 0) {
    activeHeading.value = headings[0].id;
  }
};

const scrollToHeading = (heading: TocHeading) => {
  if (!editorRef.value) return;
  
  editorRef.value.scrollTop = heading.element.offsetTop;
  activeHeading.value = heading.id;
};

// 检查光标是否在代码块内部
const isInsideCodeBlock = (): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  
  let node = selection.getRangeAt(0).startContainer;
  // 遍历父节点直到 editor 容器
  while (node && node !== editorRef.value) {
    if (node instanceof HTMLElement) {
      if (node.tagName === 'PRE' || 
          node.tagName === 'CODE' ||
          node.closest('.code-editor-header') ||
          node.closest('pre[class*="language-"]')) {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
};

const formatText = (command: string) => {
  if (!editorRef.value) return;
  
  editorRef.value.focus();
  
  // 如果在代码块内，禁用部分格式操作
  if (isInsideCodeBlock()) {
    if (['code', 'h1', 'h2', 'h3', 'quote', 'bold', 'italic', 'underline', 'strikethrough', 
         'justifyLeft', 'justifyCenter', 'justifyRight', 'link', 'hr'].includes(command)) {
      ElMessage.warning('代码块内不能使用此格式');
      return;
    }
  }
  
  switch (command) {
    case "bold":
      document.execCommand("bold", false);
      break;
    case "italic":
      document.execCommand("italic", false);
      break;
    case "underline":
      document.execCommand("underline", false);
      break;
    case "strikethrough":
      document.execCommand("strikeThrough", false);
      break;
    case "h1":
      document.execCommand("formatBlock", false, "h1");
      break;
    case "h2":
      document.execCommand("formatBlock", false, "h2");
      break;
    case "h3":
      document.execCommand("formatBlock", false, "h3");
      break;
    case "quote": {
      // 检查是否已在引用内，是则取消
      const sel = window.getSelection();
      let inQuote = false;
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).startContainer;
        while (node && node !== editorRef.value) {
          if ((node as HTMLElement).tagName === 'BLOCKQUOTE') { inQuote = true; break; }
          node = (node as HTMLElement).parentNode;
        }
      }
      document.execCommand("formatBlock", false, inQuote ? "p" : "blockquote");
      break;
    }
    case "code":
      if (isInsideCodeBlock()) {
        ElMessage.warning('代码块内不能嵌套代码块');
        return;
      }
      showCodeLanguageModal.value = true;
      break;
    case "link":
      saveCursorPosition();
      showLinkModal.value = true;
      break;
    case "justifyLeft":
      document.execCommand("justifyLeft", false);
      break;
    case "justifyCenter":
      document.execCommand("justifyCenter", false);
      break;
    case "justifyRight":
      document.execCommand("justifyRight", false);
      break;
    case "hr":
      document.execCommand("insertHorizontalRule", false);
      break;
  }
};

const insertLink = () => {
  if (!linkForm.value.url) {
    ElMessage.error("请输入链接地址");
    return;
  }
  
  const editor = editorRef.value;
  if (!editor) return;
  
  editor.focus();
  
  // 恢复之前保存的光标位置
  restoreCursorPosition();
  
  const selection = window.getSelection();
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const linkText = linkForm.value.text || selectedText || '链接';
    
    const a = document.createElement('a');
    a.href = linkForm.value.url;
    a.textContent = linkText;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.rel = 'noopener noreferrer';
    
    range.deleteContents();
    range.insertNode(a);
    
    const br = document.createElement('br');
    a.parentNode?.insertBefore(br, a.nextSibling);
  }
  
  showLinkModal.value = false;
  linkForm.value = { url: "", text: "" };
};

const removeFormat = () => {
  document.execCommand("removeFormat", false);
};

// 格式刷：保存的样式
const copiedFormat = ref<Record<string, string> | null>(null);

const copyFormat = () => {
  if (!editorRef.value) return;
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    ElMessage.warning('请先选中要复制样式的文字');
    return;
  }
  
  const range = selection.getRangeAt(0);
  let node = range.startContainer;
  // 如果选中的是文本节点，取父元素
  let el = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
  if (!el) {
    ElMessage.warning('无法获取样式');
    return;
  }
  
  const style = window.getComputedStyle(el);
  copiedFormat.value = {
    'font-size': style.fontSize,
    'font-weight': style.fontWeight,
    'font-style': style.fontStyle,
    'text-decoration': style.textDecoration,
    'color': style.color,
    'background-color': style.backgroundColor,
    'text-align': style.textAlign,
  };
  
  ElMessage.success('样式已复制，请选择要粘贴样式的文字');
};

const pasteFormat = () => {
  if (!copiedFormat.value) {
    ElMessage.warning('请先复制样式');
    return;
  }
  
  if (!editorRef.value) return;
  editorRef.value.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    ElMessage.warning('请先选中要粘贴样式的文字');
    return;
  }
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;
  
  // 构建样式字符串
  const styleStr = Object.entries(copiedFormat.value)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  
  // HTML 转义
  const escaped = selectedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  document.execCommand('insertHTML', false, `<span style="${styleStr}">${escaped}</span>`);
  
  ElMessage.success('样式已粘贴');
};

const insertCodeBlockWithLanguage = () => {
  showCodeLanguageModal.value = false;
  
  if (!editorRef.value) return;
  
  editorRef.value.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选中，在末尾添加
    editorRef.value.appendChild(document.createElement('br'));
    const pre = createCodeBlock(codeLanguage.value);
    editorRef.value.appendChild(pre);
    editorRef.value.appendChild(document.createElement('br'));
    return;
  }
  
  const range = selection.getRangeAt(0);
  
  // 获取选中的内容
  const selectedText = range.toString();
  
  // 创建代码块
  const pre = createCodeBlock(codeLanguage.value);
  const code = pre.querySelector('code');
  if (code && selectedText) {
    code.textContent = selectedText;
  }
  
  // 删除选中内容并插入代码块
  range.deleteContents();
  range.insertNode(pre);
  
  // 在代码块后添加换行
  const br = document.createElement('br');
  pre.parentNode?.insertBefore(br, pre.nextSibling);
  
  // 应用 Prism 语法高亮
  if (code) {
    Prism.highlightElement(code);
  }
  
  // 将光标定位到代码块后面
  setTimeout(() => {
    const newRange = document.createRange();
    newRange.setStartAfter(br);
    newRange.collapse(true);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }, 0);
};

const createCodeBlock = (language = 'javascript') => {
  const pre = document.createElement('pre');
  pre.className = `language-${language}`;
  pre.setAttribute('data-language', language);
  pre.style.cssText = `
    background: #1e1e1e !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    margin: 1.5rem 0 !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
    position: relative !important;
    padding: 0 !important;
    border: none !important;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  `;
  
  // 创建 VSCode 风格标题栏
  const header = document.createElement('div');
  header.className = 'code-editor-header';
  header.contentEditable = 'false';
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #252526;
    border-radius: 8px 8px 0 0;
    user-select: none;
    border-bottom: 1px solid #3c3c3c;
  `;
  
  // 窗口按钮：红黄绿
  const btnColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
  btnColors.forEach(color => {
    const btn = document.createElement('span');
    btn.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${color};
      display: inline-block;
      flex-shrink: 0;
    `;
    header.appendChild(btn);
  });
  
  // 语言标题
  const title = document.createElement('span');
  title.className = 'editor-title';
  const langInfo = codeLanguages.find(l => l.value === language);
  title.textContent = langInfo ? langInfo.label : language;
  title.style.cssText = `
    color: #cccccc;
    margin-left: 12px;
    font-size: 13px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    letter-spacing: 0.3px;
  `;
  header.appendChild(title);
  
  pre.appendChild(header);
  
  // 代码内容区域
  const codeWrapper = document.createElement('div');
  codeWrapper.className = 'code-editor-content';
  codeWrapper.style.cssText = `
    padding: 16px;
    overflow-x: auto;
    background: #1e1e1e;
  `;
  
  const code = document.createElement('code');
  code.className = `language-${language}`;
  code.textContent = '// 在这里输入代码';
  
  codeWrapper.appendChild(code);
  pre.appendChild(codeWrapper);
  
  return pre;
};

// 为编辑器中的代码块应用 Prism 语法高亮
const highlightEditorCode = () => {
  if (!editorRef.value) return;
  
  const codeBlocks = editorRef.value.querySelectorAll('.code-editor-content code[class*="language-"]');
  codeBlocks.forEach((block) => {
    Prism.highlightElement(block as HTMLElement);
  });
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!editorRef.value) {
    ElMessage.error("编辑器未就绪");
    return;
  }
  
  editorRef.value.focus();
  await nextTick();
  
  uploading.value = true;
  
  try {
    console.log("开始上传图片:", file.name);
    const result = await uploadToPicUI({ file, album: "论坛图库" });
    console.log("上传结果类型:", typeof result);
    console.log("上传结果:", JSON.stringify(result, null, 2));
    
    let imgUrl: string | null = null;
    
    if (typeof result === 'string') {
      imgUrl = result;
    } else if (result && typeof result === 'object') {
      const resultObj = result as Record<string, unknown>;
      
      if ('url' in resultObj && typeof resultObj.url === 'string') {
        imgUrl = resultObj.url;
      } else if ('data' in resultObj && resultObj.data && typeof resultObj.data === 'object') {
        const data = resultObj.data as Record<string, unknown>;
        
        if ('url' in data && typeof data.url === 'string') {
          imgUrl = data.url;
        } else if ('links' in data && data.links && typeof data.links === 'object') {
          const links = data.links as Record<string, unknown>;
          
          if ('url' in links && typeof links.url === 'string') {
            imgUrl = links.url;
          }
        }
      } else if ('links' in resultObj && resultObj.links && typeof resultObj.links === 'object') {
        const links = resultObj.links as Record<string, unknown>;
        
        if ('url' in links && typeof links.url === 'string') {
          imgUrl = links.url;
        }
      }
    }
    
    if (imgUrl) {
        if (!imgUrl.startsWith('http')) {
          imgUrl = imgUrl.startsWith('//') ? `https:${imgUrl}` : 
                   imgUrl.startsWith('/') ? `https://picui.cn${imgUrl}` : 
                   `https://picui.cn/${imgUrl}`;
        }
        
        console.log("图片URL:", imgUrl);
        
        const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const hasImgExt = imgExts.some(ext => imgUrl?.toLowerCase().includes(ext));
        
        if (!hasImgExt && !imgUrl.includes('picui.cn')) {
          console.error("返回的URL不是有效的图片地址:", imgUrl);
          ElMessage.error("上传失败，返回的URL不是图片地址");
          return;
        }
        
        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        img.style.margin = '4px';
        
        img.onerror = () => {
          console.error("图片加载失败，URL:", imgUrl);
          ElMessage.error("图片加载失败，请检查网络或URL是否正确");
          img.remove();
        };
        
        img.onload = () => {
          console.log("图片加载成功");
        };
        
        // 在光标位置插入图片
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          
          // 在图片后添加换行
          const br = document.createElement('br');
          img.parentNode?.insertBefore(br, img.nextSibling);
          
          // 将光标定位到图片后面
          setTimeout(() => {
            const newRange = document.createRange();
            newRange.setStartAfter(br);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }, 0);
        } else {
          // 如果没有光标位置，添加到末尾
          editorRef.value.appendChild(document.createElement('br'));
          editorRef.value.appendChild(img);
          editorRef.value.appendChild(document.createElement('br'));
        }
        
        editorRef.value.focus();
        
        console.log("图片已插入编辑器");
        ElMessage.success("图片上传成功");
      } else {
      console.error("无法获取图片URL:", result);
      ElMessage.error("上传失败，无法获取图片URL");
    }
  } catch (error) {
    console.error("上传图片失败:", error);
    ElMessage.error("上传失败，请稍后重试");
  } finally {
    uploading.value = false;
    target.value = "";
  }
};

const initImageResize = () => {
  if (!editorRef.value) return;
  
  editorRef.value.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    if (target.nodeName === 'IMG') {
      // 允许浏览器默认行为（选中图片以便使用 Delete/Backspace 删除）
      e.stopPropagation();
      
      document.querySelectorAll('.editor-content img').forEach(img => {
        img.style.outline = '';
        img.style.boxShadow = '';
      });
      
      target.style.outline = '2px solid rgba(102, 126, 234, 0.8)';
      target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.2)';
      
      removeResizeHandles();
      
      createResizeHandles(target as HTMLImageElement);
    } else if (!target.classList.contains('resize-handle')) {
      removeResizeHandles();
      document.querySelectorAll('.editor-content img').forEach(img => {
        img.style.outline = '';
        img.style.boxShadow = '';
      });
    }
  });
};

const positionAllHandles = () => {
  document.querySelectorAll('.resize-handle').forEach(handle => {
    const img = (handle as HTMLElement).dataset.imgId 
      ? document.querySelector(`[data-resize-id="${(handle as HTMLElement).dataset.imgId}"]`) as HTMLImageElement
      : null;
    if (img) {
      updateHandlePosition(img, handle as HTMLElement, (handle as HTMLElement).dataset.position || '');
    }
  });
};

const createResizeHandles = (img: HTMLImageElement) => {
  const imgId = `resize-${Date.now()}`;
  img.dataset.resizeId = imgId;
  
  const handlePositions = [
    { position: 'top-left', cursor: 'nwse-resize' },
    { position: 'top-right', cursor: 'nesw-resize' },
    { position: 'bottom-left', cursor: 'nesw-resize' },
    { position: 'bottom-right', cursor: 'nwse-resize' },
    { position: 'top', cursor: 'ns-resize' },
    { position: 'bottom', cursor: 'ns-resize' },
    { position: 'left', cursor: 'ew-resize' },
    { position: 'right', cursor: 'ew-resize' }
  ];
  
  handlePositions.forEach(({ position, cursor }) => {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.dataset.position = position;
    handle.dataset.imgId = imgId;
    handle.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      background: rgba(102, 126, 234, 1);
      border: 2px solid white;
      border-radius: 50%;
      cursor: ${cursor};
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startResize(e, img, position);
    });
    
    // 将手柄插入到图片的父容器，与图片同级
    img.parentNode?.insertBefore(handle, img.nextSibling);
  });
  
  positionAllHandles();
  
  // 编辑器滚动时更新手柄位置
  editorRef.value?.addEventListener('scroll', onEditorResizeScroll);
};

const removeResizeHandles = () => {
  const handles = document.querySelectorAll('.resize-handle');
  handles.forEach(h => h.remove());
  editorRef.value?.removeEventListener('scroll', onEditorResizeScroll);
};

// 编辑器滚动时更新手柄位置
const onEditorResizeScroll = () => {
  positionAllHandles();
};

const startResize = (e: MouseEvent, img: HTMLImageElement, position: string) => {
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = img.offsetWidth;
  const startHeight = img.offsetHeight;
  const startLeft = img.offsetLeft;
  const startTop = img.offsetTop;
  const aspectRatio = startWidth / startHeight;
  
  // 滚动时更新手柄位置
  editorRef.value?.addEventListener('scroll', onEditorResizeScroll);
  
  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;
    
    switch (position) {
      case 'bottom-right':
        newWidth = Math.max(50, startWidth + dx);
        newHeight = Math.max(50, newWidth / aspectRatio);
        break;
      case 'bottom-left':
        newWidth = Math.max(50, startWidth - dx);
        newHeight = Math.max(50, newWidth / aspectRatio);
        newLeft = startLeft + dx;
        break;
      case 'top-right':
        newWidth = Math.max(50, startWidth + dx);
        newHeight = Math.max(50, newWidth / aspectRatio);
        newTop = startTop + dy;
        break;
      case 'top-left':
        newWidth = Math.max(50, startWidth - dx);
        newHeight = Math.max(50, newWidth / aspectRatio);
        newLeft = startLeft + dx;
        newTop = startTop + dy;
        break;
      case 'right':
        newWidth = Math.max(50, startWidth + dx);
        newHeight = newWidth / aspectRatio;
        break;
      case 'left':
        newWidth = Math.max(50, startWidth - dx);
        newHeight = newWidth / aspectRatio;
        newLeft = startLeft + dx;
        break;
      case 'bottom':
        newHeight = Math.max(50, startHeight + dy);
        newWidth = newHeight * aspectRatio;
        break;
      case 'top':
        newHeight = Math.max(50, startHeight - dy);
        newWidth = newHeight * aspectRatio;
        newTop = startTop + dy;
        break;
    }
    
    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;
    img.style.maxWidth = 'none';
    
    positionAllHandles();
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    editorRef.value?.removeEventListener('scroll', onEditorResizeScroll);
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const updateHandlePosition = (img: HTMLImageElement, handle: HTMLElement, position: string) => {
  const handleSize = 12;
  const halfHandle = handleSize / 2;
  const w = img.offsetWidth;
  const h = img.offsetHeight;
  const x = img.offsetLeft;
  const y = img.offsetTop;
  
  switch (position) {
    case 'top-left':
      handle.style.left = `${x - halfHandle}px`;
      handle.style.top = `${y - halfHandle}px`;
      break;
    case 'top-right':
      handle.style.left = `${x + w - halfHandle}px`;
      handle.style.top = `${y - halfHandle}px`;
      break;
    case 'bottom-left':
      handle.style.left = `${x - halfHandle}px`;
      handle.style.top = `${y + h - halfHandle}px`;
      break;
    case 'bottom-right':
      handle.style.left = `${x + w - halfHandle}px`;
      handle.style.top = `${y + h - halfHandle}px`;
      break;
    case 'top':
      handle.style.left = `${x + w / 2 - halfHandle}px`;
      handle.style.top = `${y - halfHandle}px`;
      break;
    case 'bottom':
      handle.style.left = `${x + w / 2 - halfHandle}px`;
      handle.style.top = `${y + h - halfHandle}px`;
      break;
    case 'left':
      handle.style.left = `${x - halfHandle}px`;
      handle.style.top = `${y + h / 2 - halfHandle}px`;
      break;
    case 'right':
      handle.style.left = `${x + w - halfHandle}px`;
      handle.style.top = `${y + h / 2 - halfHandle}px`;
      break;
  }
};

const applyTextColor = () => {
  if (!editorRef.value) return;
  editorRef.value.focus();
  document.execCommand("foreColor", false, textColor.value);
};

const applyBgColor = () => {
  if (!editorRef.value) return;
  editorRef.value.focus();
  document.execCommand("hiliteColor", false, bgColor.value);
};

let highlightTimeout: number | null = null;

const onEditorKeydown = (e: KeyboardEvent) => {
  // Escape 关闭字体大小下拉
  if (e.key === 'Escape') {
    showFontSizeDropdown.value = false;
  }
  
  // Enter 处理
  if (e.key === 'Enter') {
    // Shift+Enter 退出代码块
    if (e.shiftKey && handleCodeBlockExit(e)) return;
    // 在引用内空行时退出引用
    handleQuoteExit(e);
  }
};

// 在代码块内按 Shift+Enter，退出代码块
const handleCodeBlockExit = (e: KeyboardEvent): boolean => {
  if (!editorRef.value) return false;

  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return false;

  let node = selection.getRangeAt(0).startContainer;
  let preEl: HTMLElement | null = null;
  let el: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
  const editor = editorRef.value;
  while (el && el !== editor) {
    if (el.tagName === 'PRE') { preEl = el; break; }
    el = el.parentElement;
  }
  if (!preEl) return false;

  e.preventDefault();
  const p = document.createElement('p');
  p.innerHTML = '<br>';
  preEl.parentNode?.insertBefore(p, preEl.nextSibling);

  const newRange = document.createRange();
  newRange.setStart(p, 0);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
  editor.focus();
  return true;
};

// 在引用块内按 Enter，如果当前行为空则退出引用
const handleQuoteExit = (e: KeyboardEvent) => {
  const editor = editorRef.value;
  if (!editor) return;
  
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  
  // 查找最近的 blockquote 和当前块元素
  let node: Node | null = selection.getRangeAt(0).startContainer;
  let blockquote: HTMLElement | null = null;
  let currentBlock: HTMLElement | null = null;
  
  let el: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
  while (el && el !== editor) {
    if (el.tagName === 'BLOCKQUOTE') {
      blockquote = el;
    }
    // 记录最内层的块级元素（且不是 blockquote 自身）
    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI'].includes(el.tagName) && el !== blockquote) {
      currentBlock = el;
    }
    el = el.parentElement;
  }
  
  if (!blockquote) return;
  
  // 判断当前块是否为空
  const isBlockEmpty = (block: HTMLElement) => {
    const text = block.textContent?.replace(/\u200B/g, '').trim() || '';
    return text === '' && block.querySelectorAll('img, iframe, video').length === 0;
  };
  
  // 如果当前在空行上，退出引用块
  if (currentBlock && isBlockEmpty(currentBlock)) {
    e.preventDefault();
    
    currentBlock.remove();
    
    // 如果引用块已空，整个移除引用
    if (isBlockEmpty(blockquote)) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      blockquote.parentNode?.replaceChild(p, blockquote);
      
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      editor.focus();
      return;
    }
    
    // 在引用块后插入新段落并移入光标
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    blockquote.parentNode?.insertBefore(p, blockquote.nextSibling);
    
    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    editor.focus();
  }
};

const onEditorInput = () => {
  if (editorRef.value) {
    form.value.content = editorRef.value.innerHTML;
  }
  
  // 触发目录刷新
  tocVersion.value++;
  
  // 防抖高亮代码块（用户停止输入后 2000ms 应用高亮，降低卡顿）
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
  highlightTimeout = window.setTimeout(() => {
    highlightEditorCode();
    highlightTimeout = null;
  }, 2000);
};

const submitForm = async () => {
  if (!form.value.title.trim()) {
    ElMessage.error("请输入帖子标题");
    return;
  }
  
  const content = editorRef.value?.innerHTML || "";
  if (!content.trim()) {
    ElMessage.error("请输入帖子内容");
    return;
  }
  
  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    router.push("/login");
    return;
  }
  
  try {
    const userInfo = userStore.userInfo;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    if (isEditMode.value && editingPost.value) {
      // 编辑模式，更新帖子
      const data: Partial<Forum> = {
        标题: form.value.title,
        内容: content,
        分类: form.value.category,
        更新时间: now,
        标签: selectedTags.value,
        封面: coverUrl.value,
      };

      // 构建 where 条件，优先使用 id
      let whereClause = "";
      if (editingPost.value.id) {
        whereClause = `id = ${editingPost.value.id}`;
      } else if (editingPost.value.唯一ID) {
        whereClause = `唯一ID = '${editingPost.value.唯一ID}'`;
      } else {
        // 如果没有 id 和唯一ID，使用账号
        const postAccount = editingPost.value.用户信息?.账号 || editingPost.value.用户信息?.account;
        whereClause = `用户信息 LIKE '%${postAccount}%'`;
      }
      console.log("更新条件:", whereClause);

      await updateForumPost(userInfo.uniqueId, data, whereClause);
      ElMessage.success("帖子更新成功");
    } else {
      // 新建模式，添加帖子
      const data: Forum = {
        唯一ID: userInfo.uniqueId,
        标题: form.value.title,
        内容: content,
        分类: form.value.category,
        创建时间: now,
        更新时间: now,
        标签: selectedTags.value,
        封面: coverUrl.value,
        用户信息: {
          账号: userInfo.account,
          头像: userInfo.avatar || "",
          用户名: userInfo.username || userInfo.account,
        },
      };

      await addForumPost(userInfo.uniqueId, data);
      ElMessage.success("帖子发布成功");
    }
    
    router.push("/forum");
  } catch (error) {
    console.error("发布帖子失败:", error);
    ElMessage.error(isEditMode.value ? "更新失败，请稍后重试" : "发布失败，请稍后重试");
  }
};

const goBack = () => {
  router.push("/forum");
};

// 标签相关函数 - 在弹窗内创建新标签
const handleAddTagInDialog = async () => {
  if (!newTagName.value.trim()) {
    ElMessage.error("请输入标签名称");
    return;
  }

  if (!userStore.isLoggedIn) {
    ElMessage.error("请先登录");
    return;
  }

  // 检查是否已存在同名标签
  if (allTags.value.some(t => t.名称 === newTagName.value.trim())) {
    ElMessage.warning("该标签已存在");
    return;
  }

  try {
    const newTag: ForumTag = {
      名称: newTagName.value.trim(),
      代表颜色: newTagColor.value,
      创建时间: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    await addForumTag(userStore.userInfo.uniqueId, newTag);
    
    // 添加到标签列表
    allTags.value.push(newTag);
    // 自动选中刚创建的标签
    tempSelectedTags.value.push({ ...newTag });
    
    ElMessage.success("标签添加成功");
    newTagName.value = "";
  } catch (error) {
    console.error("添加标签失败:", error);
    ElMessage.error("添加标签失败，请稍后重试");
  }
};

// 封面上传相关
const triggerCoverUpload = () => {
  coverFileInputRef.value?.click();
};

const handleCoverUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // 验证文件类型
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validImageTypes.includes(file.type)) {
    ElMessage.error("请上传有效的图片文件 (JPG/PNG/GIF/WebP)");
    return;
  }
  
  // 验证文件大小 (限制 5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error("图片大小不能超过 5MB");
    return;
  }
  
  uploadingCover.value = true;
  
  try {
    const result = await uploadToPicUI({ file, album: "论坛封面" });
    
    // 处理返回结果，提取 URL
    let imgUrl: string | null = null;
    if (typeof result === 'string') {
      imgUrl = result;
    } else if (result && typeof result === 'object') {
      const resultObj = result as Record<string, unknown>;
      if ('url' in resultObj && typeof resultObj.url === 'string') {
        imgUrl = resultObj.url;
      } else if ('data' in resultObj && resultObj.data && typeof resultObj.data === 'object') {
        const data = resultObj.data as Record<string, unknown>;
        if ('url' in data && typeof data.url === 'string') {
          imgUrl = data.url;
        } else if ('links' in data && data.links && typeof data.links === 'object') {
          const links = data.links as Record<string, unknown>;
          if ('url' in links && typeof links.url === 'string') {
            imgUrl = links.url;
          }
        }
      } else if ('links' in resultObj && resultObj.links && typeof resultObj.links === 'object') {
        const links = resultObj.links as Record<string, unknown>;
        if ('url' in links && typeof links.url === 'string') {
          imgUrl = links.url;
        }
      }
    }
    
    if (imgUrl) {
      // 确保 URL 有正确的协议
      if (!imgUrl.startsWith('http')) {
        imgUrl = imgUrl.startsWith('//') ? `https:${imgUrl}` : 
                 imgUrl.startsWith('/') ? `https://picui.cn${imgUrl}` : 
                 `https://picui.cn/${imgUrl}`;
      }
      coverUrl.value = imgUrl;
      ElMessage.success("封面上传成功");
    } else {
      throw new Error("无法获取图片 URL");
    }
  } catch (error) {
    console.error("封面上传失败:", error);
    ElMessage.error("封面上传失败，请稍后重试");
  } finally {
    uploadingCover.value = false;
    // 重置 input
    if (target) {
      target.value = "";
    }
  }
};

const removeCover = () => {
  coverUrl.value = "";
};

const setCoverByUrl = () => {
  ElMessageBox.prompt('请输入封面图片地址', '封面 URL', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPlaceholder: 'https://example.com/cover.jpg',
    inputPattern: /^https?:\/\/.+/,
    inputErrorMessage: '请输入以 http:// 或 https:// 开头的链接',
  }).then(({ value }) => {
    const url = value.trim();
    // 简单验证图片是否可加载
    const img = new Image();
    img.onload = () => {
      coverUrl.value = url;
      ElMessage.success('封面已设置');
    };
    img.onerror = () => {
      ElMessage.warning('图片加载失败，但仍会使用该URL');
      coverUrl.value = url;
    };
    img.src = url;
  }).catch(() => {
    // 用户取消
  });
};

onMounted(async () => {
  // 点击外部关闭字体大小下拉
  document.addEventListener('click', closeFontSizeDropdown);
  
  await userStore.loadUserInfo();
  await userStore.refreshAdminStatus();
  
  // 获取标签列表
  try {
    const tags = await getForumTags();
    allTags.value = tags;
  } catch (tagError) {
    console.log('获取标签列表失败');
  }
  
  // 从 localStorage 读取编辑数据
  const savedEditData = localStorage.getItem('editPostData');
  if (savedEditData) {
    try {
      const post = JSON.parse(savedEditData);
      console.log("接收到的帖子数据:", post);
      editingPost.value = post;
      
      // 尝试多个可能的字段名
      form.value.title = post.标题 || post.title || "";
      form.value.content = post.内容 || post.content || "";
      form.value.category = post.分类 || post.category || "技术讨论";
      coverUrl.value = post.封面 || post.cover || "";
      
      // 处理标签
      const tags = post.标签 || post.tags;
      if (tags) {
        selectedTags.value = Array.isArray(tags) ? tags : [];
      }
      
      console.log("填充后的数据:", {
        title: form.value.title,
        content: form.value.content,
        category: form.value.category,
        cover: coverUrl.value,
        tags: selectedTags.value
      });
      
      nextTick(() => {
        if (editorRef.value) {
          editorRef.value.innerHTML = form.value.content;
          initImageResize();
          // 对已有代码块应用 Prism 高亮
          setTimeout(() => highlightEditorCode(), 100);
        }
      });
      
      // 清除 localStorage 中的临时数据
      localStorage.removeItem('editPostData');
    } catch (e) {
      console.error("解析编辑数据失败:", e);
      localStorage.removeItem('editPostData');
    }
  } else {
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.focus();
        initImageResize();
      }
    });
  }
});
</script>

<style scoped>
.forum-new-page {
  min-height: 100vh;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.form-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.form-header {
  padding: 30px 30px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 20px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.form-body {
  padding: 30px;
}

.form-section {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.label-icon {
  color: rgba(102, 126, 234, 0.8);
}

.title-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.title-input:focus {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.category-select {
  width: 320px;
  padding: 14px 18px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.category-select:focus {
  border-color: rgba(102, 126, 234, 0.6);
  outline: none;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(102, 126, 234, 0.5);
  color: white;
}

/* 复制样式按钮 — 已保存样式时高亮 */
.toolbar-btn.has-format {
  background: rgba(102, 126, 234, 0.6) !important;
  color: white !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

/* 粘贴样式按钮 — 可粘贴时高亮 */
.toolbar-btn.can-paste {
  color: rgba(255, 255, 255, 0.9) !important;
}

.toolbar-btn.can-paste:hover {
  background: rgba(76, 175, 80, 0.5) !important;
  color: white !important;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
}

.color-picker-wrapper {
  position: relative;
}

.text-color-picker {
  position: absolute;
  width: 36px;
  height: 36px;
  opacity: 0;
  cursor: pointer;
}

.color-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.color-label:hover {
  background: rgba(102, 126, 234, 0.5);
  color: white;
}

/* 字体大小选择器 */

.fontsize-btn {
  font-size: 12px !important;
  min-width: 50px !important;
}

.fontsize-dropdown {
  background: #2d2d2d;
  border: 1px solid #555;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
  min-width: 80px;
}

.fontsize-option {
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.8);
  transition: all 0.15s;
  text-align: center;
}

.fontsize-option:hover {
  background: rgba(102, 126, 234, 0.3);
  color: white;
}

.fontsize-option.active {
  background: rgba(102, 126, 234, 0.5);
  color: white;
}

.fontsize-custom {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
}

.fontsize-input {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: 1px solid #555;
  border-radius: 6px;
  padding: 6px 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
  width: 0;
  min-width: 0;
  transition: border-color 0.2s;
}

.fontsize-input:focus {
  border-color: rgba(102, 126, 234, 0.6);
}

.fontsize-input::placeholder {
  color: rgba(255,255,255,0.4);
}

/* 隐藏 number 输入框的上下箭头 */
.fontsize-input::-webkit-outer-spin-button,
.fontsize-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.fontsize-input[type=number] {
  -moz-appearance: textfield;
}

.fontsize-apply {
  background: rgba(102, 126, 234, 0.5);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  font-weight: 600;
}

.fontsize-apply:hover {
  background: rgba(102, 126, 234, 0.8);
}

.fontsize-divider {
  height: 1px;
  background: rgba(255,255,255,0.15);
  margin: 4px 0;
}

.editor-content {
  position: relative;
  max-height: 700px;
  min-height: 500px;
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.8;
  color: #d4d4d4;
  outline: none;
  transition: all 0.3s;
}

.editor-content:focus {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editor-content[placeholder]:empty:before {
  content: attr(placeholder);
  color: rgba(255, 255, 255, 0.25);
  pointer-events: none;
}





.editor-content pre[class*="language-"] {
  background: #1e1e1e !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  margin: 1.5rem 0 !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
  position: relative !important;
  padding: 0 !important;
  border: none !important;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

.editor-content pre[class*="language-"] .code-editor-header {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 16px !important;
  background: #252526 !important;
  border-radius: 8px 8px 0 0 !important;
  user-select: none !important;
  border-bottom: 1px solid #3c3c3c !important;
}

.editor-content pre[class*="language-"] .code-editor-content {
  padding: 16px !important;
  overflow-x: auto !important;
  background: #1e1e1e !important;
}

.editor-content pre[class*="language-"] .code-editor-content code {
  background: transparent !important;
  padding: 0 !important;
  color: inherit !important;
  font-family: inherit !important;
  font-size: inherit !important;
  text-shadow: none !important;
}

/* 覆盖 Prism 默认的 pre 样式 */
.editor-content pre[class*="language-"]::before,
.editor-content pre[class*="language-"]::after {
  display: none !important;
}

.editor-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}

.editor-content code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
  color: #e06c75;
}

.editor-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 4px;
  display: inline-block;
  vertical-align: middle;
  user-select: auto;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}



.editor-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.editor-main {
  flex: 1;
  min-width: 0;
}

.right-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cover-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 15px;
  position: sticky;
  top: 20px;
}

.section-header {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.cover-upload-small {
  width: 100%;
  min-height: 120px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  padding: 12px;
}

.cover-upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cover-upload-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 16px 20px;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;
}

.cover-upload-action:hover {
  background: rgba(102, 126, 234, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.cover-upload-action span {
  font-size: 12px;
}

.upload-icon-small {
  color: rgba(255, 255, 255, 0.5);
}

.uploading-status-small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.cover-preview-small {
  width: 100%;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cover-preview-img-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-cover-btn-small {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.remove-cover-btn-small:hover {
  background: rgba(255, 59, 48, 0.8);
}

.toc-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 15px;
  position: sticky;
  top: 175px;
  max-height: 450px;
  overflow-y: auto;
}

.toc-header {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.toc-title {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 14px;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toc-item {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover {
  background: rgba(102, 126, 234, 0.2);
  color: rgba(255, 255, 255, 0.95);
}

.toc-item.active {
  background: rgba(102, 126, 234, 0.4);
  color: white;
}

.toc-h1 {
  font-weight: 600;
}

.toc-h2 {
  padding-left: 20px;
}

.toc-h3 {
  padding-left: 35px;
  font-size: 12px;
}

.hidden-content {
  display: none;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel, .btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-submit {
  background: rgba(102, 126, 234, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-submit:hover {
  background: rgba(102, 126, 234, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.upload-area {
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(102, 126, 234, 0.05);
  backdrop-filter: blur(10px);
}

.upload-area:hover {
  border-color: rgba(102, 126, 234, 0.8);
  background: rgba(102, 126, 234, 0.1);
}

.upload-area svg {
  font-size: 48px;
  color: rgba(102, 126, 234, 0.8);
  margin-bottom: 15px;
}

.upload-area p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.file-input {
  display: none;
}

/* 代码语言选择器样式 */
.language-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 6px 0;
  max-height: 380px;
  overflow-y: auto;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.05);
}

.language-option:hover {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(102, 126, 234, 0.08);
}

.language-option.active {
  border-color: rgba(102, 126, 234, 0.8);
  background: rgba(102, 126, 234, 0.15);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.lang-icon {
  font-size: 18px;
  line-height: 1;
}

.lang-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}







.uploading {
  text-align: center;
  padding: 40px;
}

.uploading svg {
  font-size: 32px;
  color: rgba(102, 126, 234, 0.8);
}

/* 标签相关样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  min-height: 42px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 2px solid;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.tag-item-selected {
  cursor: default;
}

.tag-item-selected:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
  flex-shrink: 0;
}

.tag-remove:hover {
  background: rgba(255, 59, 48, 0.8);
  color: white;
}

.add-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  height: 36px;
}

.add-tag-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.add-tag-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  color: rgba(255, 255, 255, 0.9);
}

/* 标签选择器弹窗样式 */
.tag-selector-body {
  max-height: 460px;
  overflow-y: auto;
}

.tag-selector-section {
  margin-bottom: 4px;
}

.tag-selector-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  padding: 0 2px;
}

.tag-selector-empty {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  padding: 16px 0;
  text-align: center;
}

.tag-selector-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-selector-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px 6px 10px;
  border: 2px solid;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  user-select: none;
}

.tag-selector-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: white;
}

.tag-selector-item.selected {
  color: white;
  font-weight: 500;
}

.tag-selector-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.tag-selector-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.tag-create-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-create-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.tag-create-input:focus {
  border-color: rgba(102, 126, 234, 0.6);
}

.tag-create-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.tag-create-color-wrapper {
  position: relative;
  flex-shrink: 0;
}

.tag-create-color {
  position: absolute;
  width: 36px;
  height: 36px;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.tag-create-color-label {
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: border-color 0.2s;
}

.tag-create-color-label:hover {
  border-color: rgba(102, 126, 234, 0.6);
}

.tag-create-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: rgba(102, 126, 234, 0.6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
}

.tag-create-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.85);
}

.tag-create-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 封面上传样式 */
.cover-upload-area {
  position: relative;
  width: 100%;
  height: 220px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.cover-upload-area:hover {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(102, 126, 234, 0.1);
}

.upload-placeholder,
.uploading-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.upload-icon,
.loading-icon {
  color: rgba(102, 126, 234, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.cover-preview-container {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.cover-preview-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.remove-cover-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-cover-btn:hover {
  background: rgba(220, 53, 69, 0.8);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .form-container {
    margin: 0 10px;
  }
  
  .form-body {
    padding: 20px;
  }
  
  .editor-toolbar {
    gap: 4px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
  }
  
  .editor-wrapper {
    flex-direction: column;
  }
  
  .toc-panel {
    display: none;
  }
}

/* 图片 URL 预览 */
.image-url-preview {
  width: 100%;
  min-height: 100px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-url-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.image-url-preview img.preview-error {
  display: none;
}

.preview-error-text {
  color: #e06c75;
  font-size: 13px;
  padding: 20px;
  text-align: center;
}

.image-url-placeholder {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

/* 相册选择器样式 */
.album-picker-body {
  min-height: 200px;
  max-height: 460px;
  overflow-y: auto;
}

.album-picker-loading,
.album-picker-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.album-picker-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.album-picker-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.album-picker-card:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.album-picker-card-cover {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.album-picker-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.album-picker-card-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-picker-card-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.album-picker-back {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.album-back-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 6px 14px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.album-back-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
  color: white;
}

.album-picker-current-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.album-picker-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.album-picker-photo-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.album-picker-photo-item:hover {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

.album-picker-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-picker-photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-picker-photo-item:hover .album-picker-photo-overlay {
  opacity: 1;
}
</style>

<!-- 非 scoped 样式：作用于运行时动态创建的元素 -->
<style>
.editor-content a {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  color: #5fa8d3 !important;
  text-decoration: none !important;
  background: rgba(95, 168, 211, 0.1) !important;
  border: 1px solid rgba(95, 168, 211, 0.25) !important;
  border-radius: 6px !important;
  padding: 1px 8px !important;
  transition: all 0.2s !important;
  white-space: nowrap !important;
}

.editor-content a::before {
  content: '🔗' !important;
  font-size: 0.85em !important;
}

.editor-content a:hover {
  background: rgba(95, 168, 211, 0.2) !important;
  border-color: rgba(95, 168, 211, 0.5) !important;
  color: #7cc5e8 !important;
}

.editor-content h1 {
  font-size: 1.8em !important;
  color: #e0e0e0 !important;
  margin: 16px 0 !important;
  padding-bottom: 8px !important;
  border-bottom: 2px solid rgba(102, 126, 234, 0.5) !important;
  font-weight: bold !important;
}

.editor-content h2 {
  font-size: 1.5em !important;
  color: #d4d4d4 !important;
  margin: 14px 0 !important;
  font-weight: bold !important;
}

.editor-content h3 {
  font-size: 1.2em !important;
  color: #cccccc !important;
  margin: 12px 0 !important;
  font-weight: bold !important;
}

.editor-content blockquote {
  border-left: 4px solid rgba(102, 126, 234, 0.6) !important;
  padding: 10px 20px !important;
  margin: 16px 0 !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 0 8px 8px 0 !important;
  color: #aaaaaa !important;
  font-style: italic !important;
}

.editor-content hr {
  border: none !important;
  margin: 32px 0 !important;
  height: 1px !important;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.15) 15%, rgba(102, 126, 234, 0.5) 50%, rgba(102, 126, 234, 0.15) 85%, transparent 100%) !important;
  position: relative !important;
  overflow: visible !important;
}

.editor-content hr::after {
  content: '✦' !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  color: rgba(102, 126, 234, 0.6) !important;
  font-size: 14px !important;
  background: #1e1e1e !important;
  padding: 0 12px !important;
  line-height: 1 !important;
}

/* 标签选择器弹窗 — 黑色半透明磨砂材质 */
.tag-selector-dialog {
  background: rgba(20, 20, 20, 0.85) !important;
  backdrop-filter: blur(24px) saturate(1.2) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;
}

.tag-selector-dialog .el-dialog__header {
  padding: 20px 24px 12px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.tag-selector-dialog .el-dialog__title {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

.tag-selector-dialog .el-dialog__headerbtn {
  top: 20px !important;
  right: 20px !important;
}

.tag-selector-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 18px !important;
}

.tag-selector-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.tag-selector-dialog .el-dialog__body {
  padding: 20px 24px !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.tag-selector-dialog .el-dialog__footer {
  padding: 12px 24px 20px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* 弹窗内按钮暗色适配 */
.tag-selector-dialog .el-button--primary {
  background: rgba(102, 126, 234, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

.tag-selector-dialog .el-button--primary:hover {
  background: rgba(102, 126, 234, 0.9) !important;
}

.tag-selector-dialog .el-button--default {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.tag-selector-dialog .el-button--default:hover {
  background: rgba(255, 255, 255, 0.18) !important;
  color: white !important;
}

/* 相册选择器弹窗 — 同样黑色半透明磨砂材质 */
.album-picker-dialog {
  background: rgba(20, 20, 20, 0.85) !important;
  backdrop-filter: blur(24px) saturate(1.2) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;
}

.album-picker-dialog .el-dialog__header {
  padding: 20px 24px 12px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.album-picker-dialog .el-dialog__title {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

.album-picker-dialog .el-dialog__headerbtn {
  top: 20px !important;
  right: 20px !important;
}

.album-picker-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 18px !important;
}

.album-picker-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.album-picker-dialog .el-dialog__body {
  padding: 20px 24px !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
</style>