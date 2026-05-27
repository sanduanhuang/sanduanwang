<template>
  <div class="tiptap-editor-wrapper" @click="onEditorClick">
    <EditorContent :editor="editor" class="tiptap-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

// 导入需要用到的语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import ruby from 'highlight.js/lib/languages/ruby'
import php from 'highlight.js/lib/languages/php'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'

const lowlight = createLowlight(common)
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('csharp', csharp)
lowlight.register('go', go)
lowlight.register('rust', rust)
lowlight.register('ruby', ruby)
lowlight.register('php', php)
lowlight.register('bash', bash)
lowlight.register('sql', sql)
lowlight.register('json', json)
lowlight.register('yaml', yaml)
lowlight.register('markdown', markdown)

// 可调整大小的图片扩展
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width') || el.style.width || null,
        renderHTML: (attrs) => {
          if (!attrs.width) return {}
          return { width: attrs.width, style: `width: ${attrs.width}` }
        },
      },
    }
  },
})

// 向编辑器注入 setImageWidth 命令
const ImageWithWidth = ResizableImage.configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: {
    style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 4px 0; cursor: pointer;',
  },
})

// 自定义字体大小扩展
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize?.replace(/['"]/g, '') || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {}
          return { style: `font-size: ${attrs.fontSize}px` }
        },
      },
    }
  },
}).configure({ types: ['textStyle'] })

// 向编辑器注入 setFontSize 方法
const FontSizeExtension = TextStyle.extend({
  addCommands() {
    return {
      setFontSize:
        (size: number) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: `${size}px` }).run()
        },
    }
  },
})

const emit = defineEmits<{
  (e: 'update', html: string): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

const editor = useEditor({
  content: '',
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      codeBlock: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    ImageWithWidth,
    Placeholder.configure({
      placeholder: '在这里输入内容...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'javascript',
    }),
    FontSizeExtension,
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-content-inner',
    },
    handleKeyDown: (view, event) => {
      emit('keydown', event)
      return false // 让 TipTap 继续处理
    },
  },
  onUpdate: () => {
    if (editor.value) {
      emit('update', editor.value.getHTML())
    }
  },
})

// 暴露编辑器操作方法给父组件
const execCmd = (cmd: string, value?: any) => {
  if (!editor.value) return
  const chain = editor.value.chain().focus()

  switch (cmd) {
    case 'bold': chain.toggleBold().run(); break
    case 'italic': chain.toggleItalic().run(); break
    case 'underline': chain.toggleUnderline().run(); break
    case 'strikethrough': chain.toggleStrike().run(); break
    case 'h1': chain.toggleHeading({ level: 1 }).run(); break
    case 'h2': chain.toggleHeading({ level: 2 }).run(); break
    case 'h3': chain.toggleHeading({ level: 3 }).run(); break
    case 'quote': chain.toggleBlockquote().run(); break
    case 'code': chain.toggleCodeBlock().run(); break
    case 'hr': chain.setHorizontalRule().run(); break
    case 'justifyLeft': chain.setTextAlign('left').run(); break
    case 'justifyCenter': chain.setTextAlign('center').run(); break
    case 'justifyRight': chain.setTextAlign('right').run(); break
    case 'link': setLink(value); break
    case 'image': insertImage(value); break
    case 'textColor': chain.setColor(value).run(); break
    case 'bgColor': chain.toggleHighlight({ color: value }).run(); break
    case 'fontSize': chain.setFontSize(value).run(); break
    case 'imageWidth': setImageWidth(value); break
    case 'removeFormat': chain.unsetAllMarks().clearNodes().run(); break
    default: break
  }
}

const setLink = (url: string) => {
  if (!editor.value) return
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  } else {
    editor.value.chain().focus().unsetLink().run()
  }
}

const insertImage = (src: string) => {
  if (!editor.value) return
  editor.value.chain().focus().setImage({ src }).run()
}

const getHTML = () => editor.value?.getHTML() || ''
const setContent = (html: string) => editor.value?.commands.setContent(html)
const isActive = (name: string, attrs?: Record<string, any>) => editor.value?.isActive(name, attrs)
const focus = () => editor.value?.chain().focus().run()

// 设置选中图片的宽度
const setImageWidth = (width: string) => {
  if (!editor.value) return
  const { state, dispatch } = editor.value.view
  const { selection } = state
  const node = selection.node
  if (node && node.type.name === 'image') {
    const pos = selection.$anchor.pos
    const tr = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, width })
    dispatch(tr)
  }
}

// 替换选中文本为代码块，支持指定语言
const replaceWithCodeBlock = (language: string) => {
  if (!editor.value) return
  const { view } = editor.value
  const { state, dispatch } = view
  const { selection } = state
  const { from, to, empty } = selection

  if (!empty) {
    // 有选中文本，替换为代码块
    const selectedText = state.doc.textBetween(from, to)
    const tr = state.tr
      .delete(from, to)
      .insert(from, state.schema.nodes.codeBlock.create({ language }, state.schema.text(selectedText || ' ')))
    dispatch(tr)
  } else {
    // 无选中，直接插入代码块
    const tr = state.tr.insert(from, state.schema.nodes.codeBlock.create({ language }))
    dispatch(tr)
  }
  editor.value.chain().focus().run()
}

// 从相册插入图片
const insertImageFromAlbum = (src: string) => {
  insertImage(src)
}

// 复制格式
let copiedMarks: Record<string, any> | null = null

const copyFormat = () => {
  if (!editor.value) return
  const { state } = editor.value
  const { from, to, empty } = state.selection
  if (empty) return false

  const marks: Record<string, any> = {}
  state.doc.nodesBetween(from, to, (node) => {
    if (node.marks.length > 0) {
      node.marks.forEach(mark => {
        marks[mark.type.name] = { ...mark.attrs }
      })
    }
  })
  copiedMarks = marks
  return true
}

const pasteFormat = () => {
  if (!editor.value || !copiedMarks) return
  const chain = editor.value.chain().focus()
  Object.entries(copiedMarks).forEach(([name, attrs]) => {
    // 只处理常见的标记类型
    if (['bold', 'italic', 'underline', 'strike', 'textStyle', 'highlight', 'textAlign', 'color'].includes(name)) {
      if (Object.keys(attrs).length > 0) {
        ;(chain as any).setMark(name, attrs)
      }
    }
  })
  chain.run()
}

const onEditorClick = () => {
  editor.value?.chain().focus().run()
}

defineExpose({
  execCmd,
  getHTML,
  setContent,
  isActive,
  focus,
  replaceWithCodeBlock,
  insertImageFromAlbum,
  copyFormat,
  pasteFormat,
  get editorRef() { return editor },
})
</script>

<style scoped>
.tiptap-editor-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 700px;
  overflow-y: auto;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 12px;
}

.tiptap-content {
  width: 100%;
  height: 100%;
  min-height: 400px;
  outline: none;
}

.tiptap-content-inner {
  width: 100%;
  height: 100%;
  min-height: 400px;
  outline: none;
  padding: 16px;
  line-height: 1.8;
  font-size: 16px;
  color: #ffffff;
  background: #1e1e1e;
}

/* TipTap 全局样式 - 需要非 scoped 覆盖 */
:deep(.tiptap-content-inner) {
  outline: none;
  min-height: 400px;
  color: #ffffff;
  background: #1e1e1e;
}

:deep(.tiptap-content-inner p) {
  margin: 0.5em 0;
}

:deep(.tiptap-content-inner h1),
:deep(.tiptap-content-inner h2),
:deep(.tiptap-content-inner h3) {
  margin: 1.5em 0 0.5em;
  color: #ffffff;
  font-weight: bold;
  line-height: 1.4;
}

:deep(.tiptap-content-inner h1) {
  font-size: 2em;
  border-bottom: 1px solid #333;
  padding-bottom: 0.3em;
}
:deep(.tiptap-content-inner h2) {
  font-size: 1.6em;
  border-bottom: 1px solid #333;
  padding-bottom: 0.2em;
}
:deep(.tiptap-content-inner h3) { font-size: 1.3em; }

:deep(.tiptap-content-inner blockquote) {
  border-left: 3px solid #667eea;
  padding: 8px 16px;
  margin: 12px 0;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 0 8px 8px 0;
  color: #b0b0b0;
  font-style: italic;
}

:deep(.tiptap-content-inner a) {
  color: #667eea;
  text-decoration: underline;
  cursor: pointer;
}

:deep(.tiptap-content-inner img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
  display: inline-block;
  vertical-align: middle;
}

:deep(.tiptap-content-inner hr) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, #667eea, transparent);
  margin: 24px 0;
}

:deep(.tiptap-content-inner pre) {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.tiptap-content-inner pre code) {
  color: #d4d4d4;
  background: none;
  padding: 0;
  font-size: inherit;
}

:deep(.tiptap-content-inner code) {
  background: rgba(255, 255, 255, 0.1);
  color: #e06c75;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

:deep(.tiptap-content-inner ul),
:deep(.tiptap-content-inner ol) {
  padding-left: 24px;
  margin: 0.5em 0;
}

:deep(.tiptap-content-inner li) {
  margin: 0.3em 0;
}

:deep(.tiptap-content-inner p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #666;
  pointer-events: none;
  float: left;
  height: 0;
}

/* lowlight 代码高亮颜色 */
:deep(.hljs-keyword) { color: #c586c0; }
:deep(.hljs-string) { color: #ce9178; }
:deep(.hljs-number) { color: #b5cea8; }
:deep(.hljs-comment) { color: #6a9955; font-style: italic; }
:deep(.hljs-built_in) { color: #dcdcaa; }
:deep(.hljs-function) { color: #dcdcaa; }
:deep(.hljs-title) { color: #dcdcaa; }
:deep(.hljs-params) { color: #d4d4d4; }
:deep(.hljs-literal) { color: #569cd6; }
:deep(.hljs-type) { color: #569cd6; }
:deep(.hljs-attr) { color: #9cdcfe; }
:deep(.hljs-selector-tag) { color: #d7ba7d; }
:deep(.hljs-meta) { color: #d4d4d4; }
:deep(.hljs-tag) { color: #569cd6; }
:deep(.hljs-name) { color: #569cd6; }
:deep(.hljs-attribute) { color: #9cdcfe; }
:deep(.hljs-variable) { color: #9cdcfe; }
:deep(.hljs-regexp) { color: #d16969; }
:deep(.hljs-link) { color: #569cd6; }
:deep(.hljs-symbol) { color: #569cd6; }
:deep(.hljs-section) { color: #ffd700; }
:deep(.hljs-addition) { color: #b5cea8; }
:deep(.hljs-deletion) { color: #ce9178; }
</style>
