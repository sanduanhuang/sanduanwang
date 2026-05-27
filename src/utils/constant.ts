// 所有 /api/* 请求由 Cloudflare Pages Function 反向代理到上游服务器
// 上游地址通过 Cloudflare Dashboard 环境变量 API_UPSTREAM 配置，无需重新部署
let baseURL = "";

// 已废弃 - 保留以兼容旧代码
export function fetchApiConfig(): void {
  console.log("API 请求已通过 Cloudflare Pages Functions 代理");
}

const constant = {
  get baseURL() {
    return baseURL;
  },
  set baseURL(url: string) {
    baseURL = url;
  },
  // 今日诗词API接口
  jinrishici: "https://v1.jinrishici.com/all.json",
  // picui图片上传接口
  get qiniuUploadImages() {
    return `${baseURL}/picui/upload`;
  },
  // picui图片上传入口（预留）
  qiniuUploadEntrance: "",
  // 收藏视频地址（预留）
  favoriteVideo: "",
  // 主题色1（过渡前颜色）
  before_color_1: "#db3434",
  // 主题色2（过渡后渐变颜色）
  after_color_1: "linear-gradient(45deg, var(--red), #cd4c4a)",
  // 评论页面主题色
  commentPageColor: "var(--green6)",
  // 默认用户ID
  userId: 1,
  // 站点名称
  siteName: "三段荒の窝",
  // 站长邮箱（预留）
  bossEmail: "392935754@qq.com",
  // QQ号码（预留）
  qqNumber: "392935754",
  // 微信号（预留）
  wechatId: "",
  // 默认头像地址（预留）
  defaultAvatar: "https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg",
  //游客头像
  guestAvatar: "https://free.picui.cn/free/2026/05/22/6a0f750dbc650.webp",
  // 默认背景图地址（预留）
  defaultBackground: "",
  // 游戏页面地址
  gameURL: "https://game.eean.cn/pc/game",
  // Meting音乐API地址（网易云音乐第三方API）
  metingApiURL: "https://api.i-meto.com/meting/api",
};

export default constant;
