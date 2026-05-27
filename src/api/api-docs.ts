export interface RequestParam {
  name: string;
  type: string;
  required: boolean;
  desc: string;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  desc: string;
  requestParams?: RequestParam[];
  response?: unknown;
}

function p(name: string, info: string): RequestParam {
  const parts = info.split(')');
  const typeDesc = parts[0] || '';
  const desc = (parts[1] || '').trim();
  const type = typeDesc.replace(/\(.*/, '').trim();
  const required = typeDesc.includes('必填');
  return { name, type, required, desc };
}

export interface ApiGroup {
  name: string;
  icon: string;
  endpoints: ApiEndpoint[];
}

export const apiGroups: ApiGroup[] = [
  {
    name: "database", icon: "🗄️",
    endpoints: [
      { path: "/api/user/register", method: "POST", desc: "用户注册",
        requestParams: [p("account","string (必填) 账号"), p("password","string (必填) 密码"), p("email","string (必填) 邮箱"), p("avatar","file (可选) 头像")] },
      { path: "/api/user/login", method: "POST", desc: "登录验证",
        requestParams: [p("account","string (必填) 账号"), p("password","string (必填) 密码")] },
      { path: "/api/user/logout", method: "POST", desc: "注销账号",
        requestParams: [p("uniqueId","string (必填) 唯一ID"), p("password","string (必填) 密码验证")] },
      { path: "/api/user/update-password", method: "POST", desc: "修改密码",
        requestParams: [p("account","string (必填) 账号"), p("password","string (必填) 原密码"), p("newPassword","string (必填) 新密码")] },
      { path: "/api/user/get-unique-id", method: "POST", desc: "获取唯一ID",
        requestParams: [p("account","string (必填) 账号")] },
      { path: "/api/user/check-admin", method: "POST", desc: "验证管理员",
        requestParams: [p("account","string (必填) 账号"), p("password","string (必填) 密码")] },
      { path: "/api/data/query", method: "POST", desc: "动态查询数据",
        requestParams: [p("table","string (必填) 表名"), p("fields","[string] (可选) 字段列表"), p("where","string (可选) 查询条件"), p("uniqueId","string (必填) 唯一ID"), p("order","string (可选) 排序字段"), p("sort","string (可选,默认asc) asc或desc"), p("limit","number (可选) 限制条数"), p("offset","number (可选) 分页偏移")] },
      { path: "/api/data/insert", method: "POST", desc: "动态插入数据",
        requestParams: [p("table","string (必填) 表名"), p("data","object (必填) 要插入的数据"), p("account","string (必填) 账号"), p("password","string (必填) 密码")] },
      { path: "/api/data/update", method: "POST", desc: "动态更新数据",
        requestParams: [p("table","string (必填) 表名"), p("data","object (必填) 要更新的数据"), p("where","string (必填) 更新条件"), p("account","string (必填) 账号"), p("password","string (必填) 密码")] },
      { path: "/api/data/delete", method: "POST", desc: "动态删除数据",
        requestParams: [p("table","string (必填) 表名"), p("where","string (必填) 删除条件"), p("account","string (必填) 账号"), p("password","string (必填) 密码")] },
      { path: "/api/ai/images/:uniqueId", method: "GET", desc: "获取AI图片列表",
        requestParams: [p("uniqueId","string (必填) 唯一ID")] },
    ],
  },
  {
    name: "zhipu", icon: "🤖",
    endpoints: [
      { path: "/api/zhipu/chat", method: "POST", desc: "AI对话",
        requestParams: [p("messages","[object] (必填) 消息数组"), p("model","string (可选,默认glm-4-flash) 模型"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/zhipu/chat-with-context", method: "POST", desc: "AI上下文对话",
        requestParams: [p("uniqueId","string (必填) 唯一ID"), p("message","string (必填) 用户消息"), p("model","string (可选) 模型"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/zhipu/image", method: "POST", desc: "AI图片生成",
        requestParams: [p("prompt","string (必填) 图片描述"), p("model","string (可选) 模型"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/zhipu/translate", method: "POST", desc: "AI翻译",
        requestParams: [p("text","string (必填) 待翻译文本"), p("source","string (可选) 源语言"), p("target","string (必填) 目标语言"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/zhipu/context/:uniqueId", method: "DELETE", desc: "删除AI上下文",
        requestParams: [p("uniqueId","string (必填) 唯一ID")] },
      { path: "/api/zhipu/vision", method: "POST", desc: "AI视觉识别",
        requestParams: [p("image","string (必填) 图片base64或URL"), p("prompt","string (可选) 描述"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/zhipu/video", method: "POST", desc: "AI视频生成",
        requestParams: [p("prompt","string (必填) 视频描述"), p("image","string (可选) 参考图片"), p("apiKey","string (可选) API密钥")] },
    ],
  },
  {
    name: "ai", icon: "🧠",
    endpoints: [
      { path: "/api/ai/image/generate", method: "POST", desc: "AI图片生成(上传图床)",
        requestParams: [p("uniqueId","string (必填) 唯一ID"), p("prompt","string (必填) 图片描述"), p("model","string (可选,默认cogview-3-flash) 模型")] },
      { path: "/api/text/check-compliance", method: "POST", desc: "文本合规检查",
        requestParams: [p("text","string (必填) 文本内容"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/image/recognize", method: "POST", desc: "图片识别",
        requestParams: [p("image","string (必填) 图片base64或URL"), p("prompt","string (可选) 描述"), p("apiKey","string (可选) API密钥")] },
      { path: "/api/video/generate", method: "POST", desc: "视频生成",
        requestParams: [p("prompt","string (必填) 视频描述"), p("image","string (可选) 参考图片"), p("apiKey","string (可选) API密钥")] },
    ],
  },
  {
    name: "external", icon: "🔗",
    endpoints: [
      { path: "/api/gitee/upload", method: "POST", desc: "Gitee图床上传",
        requestParams: [p("file","file (必填) 上传文件"), p("token","string (可选) 令牌"), p("path","string (可选) 自定义路径")] },
      { path: "/api/voice/synthesis", method: "POST", desc: "语音合成",
        requestParams: [p("text","string (必填) 文本"), p("voice","string (可选) 语音"), p("rate","number (可选) 语速"), p("volume","number (可选) 音量")] },
      { path: "/api/voice/recognition", method: "POST", desc: "语音识别",
        requestParams: [p("audio","string (必填) 音频base64"), p("format","string (可选) 格式")] },
      { path: "/api/image/compress", method: "POST", desc: "图片压缩",
        requestParams: [p("file","file (必填) 图片"), p("quality","number (可选) 质量"), p("scale","number (可选) 缩放"), p("width","number (可选) 宽度"), p("height","number (可选) 高度"), p("maxWidth","number (可选) 最大宽度"), p("maxHeight","number (可选) 最大高度")] },
      { path: "/api/image/split", method: "POST", desc: "图片分割/裁剪",
        requestParams: [p("file","file (必填) 图片"), p("mode","string (可选) 模式"), p("rows","number (可选) 行数"), p("cols","number (可选) 列数"), p("x","number (可选) X"), p("y","number (可选) Y"), p("width","number (可选) 宽度"), p("height","number (可选) 高度")] },
      { path: "/api/picui/upload", method: "POST", desc: "PicUI图床上传",
        requestParams: [p("file","file (必填) 上传文件")] },
      { path: "/api/picui/albums", method: "GET", desc: "PicUI相册列表" },
      { path: "/api/picui/album/:name", method: "GET", desc: "PicUI相册图片",
        requestParams: [p("name","string (必填) 相册名称")] },
      { path: "/api/picui/delete", method: "POST", desc: "删除PicUI图片",
        requestParams: [p("imageId","string (必填) 图片ID")] },
      { path: "/api/payphp/create-order", method: "POST", desc: "创建支付订单",
        requestParams: [p("amount","string (必填) 金额"), p("orderNo","string (可选) 订单号"), p("subject","string (可选) 主题"), p("body","string (可选) 描述"), p("notifyUrl","string (可选) 回调地址")] },
      { path: "/api/payphp/query-order", method: "POST", desc: "查询订单",
        requestParams: [p("orderNo","string (必填) 订单号")] },
      { path: "/api/payphp/close-order", method: "POST", desc: "关闭订单",
        requestParams: [p("orderNo","string (必填) 订单号")] },
      { path: "/api/payphp/balance", method: "GET", desc: "查询余额" },
      { path: "/api/payphp/notify", method: "POST", desc: "支付回调" },
      { path: "/api/mail/send", method: "POST", desc: "发送邮件",
        requestParams: [p("tomail","string (必填) 目标邮箱"), p("fromTitle","string (必填) 邮件标题"), p("subject","string (必填) 邮件主题"), p("content","string (必填) 邮件内容"), p("smtpCode","string (可选) SMTP授权码"), p("smtpEmail","string (可选) 发件邮箱"), p("smtpCodeType","string (可选) 邮箱类型"), p("isTextContent","boolean (可选) 纯文本"), p("colakey","string (可选) LuckyCola Key")] },
    ],
  },
];
