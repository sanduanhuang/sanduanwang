/**
 * 外部服务 API 模块
 * 提供图床上传、语音合成、语音识别、图片处理、支付等功能
 */
import http from "@/utils/request";
import constant from "@/utils/constant";

/**
 * 语音合成
 * @description 将文本转换为语音
 * @param data.text - 要转换的文本 (必填)
 * @param data.voice - 语音角色，默认 zh-CN-XiaoxiaoNeural (可选)
 * @param data.rate - 语速，默认 0 (可选)
 * @param data.volume - 音量，默认 1 (可选)
 * @returns success - 是否成功
 * @returns result - 合成结果
 */
export function voiceSynthesis(data: {
  text: string;
  voice?: string;
  rate?: number;
  volume?: number;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/voice/synthesis`, data);
}

/**
 * 语音识别
 * @description 将语音转换为文本
 * @param data.audio - 音频文件(base64) (必填)
 * @param data.format - 音频格式，默认 wav (可选)
 * @returns success - 是否成功
 * @returns result - 识别结果
 */
export function voiceRecognition(data: {
  audio: string;
  format?: string;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/voice/recognition`, data);
}

/**
 * 图片压缩
 * @param data.file - 要压缩的图片文件 (必填)
 * @param data.quality - 压缩质量，默认 80 (可选)
 * @param data.scale - 缩放比例 (可选)
 * @param data.width - 目标宽度 (可选)
 * @param data.height - 目标高度 (可选)
 * @param data.maxWidth - 最大宽度 (可选)
 * @param data.maxHeight - 最大高度 (可选)
 * @returns 压缩后的图片二进制数据
 */
export function compressImage(data: {
  file: File;
  quality?: number;
  scale?: number;
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
}): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.quality) formData.append("quality", String(data.quality));
  if (data.scale) formData.append("scale", String(data.scale));
  if (data.width) formData.append("width", String(data.width));
  if (data.height) formData.append("height", String(data.height));
  if (data.maxWidth) formData.append("maxWidth", String(data.maxWidth));
  if (data.maxHeight) formData.append("maxHeight", String(data.maxHeight));
  return http.postBlob(`${constant.baseURL}/api/image/compress`, formData);
}

/**
 * 图片分割/裁剪
 * @description 将一张图片分割成多张，或进行裁剪
 * @param data.file - 要处理的图片文件 (必填)
 * @param data.mode - 处理模式，默认 grid (可选) - grid:分割模式, crop:裁剪模式
 * @param data.rows - 分割行数，默认 2 (可选)
 * @param data.cols - 分割列数，默认 2 (可选)
 * @param data.x - 裁剪起点X坐标，crop模式使用 (可选)
 * @param data.y - 裁剪起点Y坐标，crop模式使用 (可选)
 * @param data.width - 裁剪宽度，crop模式使用 (可选)
 * @param data.height - 裁剪高度，crop模式使用 (可选)
 * @returns success - 是否成功
 * @returns message - 提示信息
 * @returns parts - 分割后的图片数组
 */
export function splitImage(data: {
  file: File;
  mode?: string;
  rows?: number;
  cols?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): Promise<{
  success: boolean;
  message: string;
  parts: string[];
}> {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.mode) formData.append("mode", data.mode);
  if (data.rows) formData.append("rows", String(data.rows));
  if (data.cols) formData.append("cols", String(data.cols));
  if (data.x !== undefined) formData.append("x", String(data.x));
  if (data.y !== undefined) formData.append("y", String(data.y));
  if (data.width) formData.append("width", String(data.width));
  if (data.height) formData.append("height", String(data.height));
  return http.post(`${constant.baseURL}/api/image/split`, formData, false);
}

/**
 * PicUI图床上传
 * @param data.file - 要上传的文件 (必填)
 * @param data.album - 相册名称，默认 "背景图" (必填)
 * @returns 直接返回PicUI API响应
 */
export function uploadToPicUI(data: { file: File, album: string }): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("album", data.album);
  return http.post(`${constant.baseURL}/api/picui/upload`, formData, false);
}

/**
 * 获取PicUI相册列表
 * @returns 直接返回PicUI API响应
 */
export function getPicUIAlbums(): Promise<unknown> {
  return http.get(`${constant.baseURL}/api/picui/albums`);
}

/**
 * 获取PicUI相册图片
 * @param name - 相册名称 (必填，路径参数)
 * @returns 直接返回PicUI API响应
 */
export function getPicUIAlbum(name: string): Promise<unknown> {
  return http.get(`${constant.baseURL}/api/picui/album/${name}`);
}

/**
 * 删除PicUI相册中的图片
 * @param data.imageId - 图片ID (必填)
 * @returns 直接返回PicUI API响应
 */
export function deletePicUIImage(data: { imageId: string }): Promise<unknown> {
  return http.post(`${constant.baseURL}/api/picui/delete`, {
    imageId: data.imageId,
  });
}

/**
 * 从指定相册获取随机图片
 * @param albumName - 相册名称，例如 "背景图"
 * @returns 随机图片URL
 */
export async function getRandomImageFromAlbum(albumName: string = "背景图"): Promise<string> {
  interface PicUIResponse {
    status?: boolean;
    data?: {
      data?: Array<{ links?: { url?: string } }>;
    };
    message?: string;
  }

  const response = await getPicUIAlbum(albumName) as PicUIResponse;
  const images = response?.data?.data;

  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new Error(`相册 "${albumName}" 为空或不存在`);
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const imageUrl = images[randomIndex]?.links?.url;

  if (!imageUrl) {
    throw new Error(`相册 "${albumName}" 图片格式错误`);
  }

  return imageUrl;
}



/**
 * 创建支付订单
 * @param data.amount - 金额 (必填)
 * @param data.orderNo - 商户订单号 (可选)
 * @param data.subject - 订单主题 (可选)
 * @param data.body - 订单描述 (可选)
 * @param data.notifyUrl - 支付回调地址 (可选)
 * @returns 直接返回PayPHP API响应
 */
export function createPayOrder(data: {
  amount: string;
  orderNo?: string;
  subject?: string;
  body?: string;
  notifyUrl?: string;
}): Promise<unknown> {
  return http.post(`${constant.baseURL}/api/payphp/create-order`, data);
}

/**
 * 查询订单状态
 * @param data.orderNo - 商户订单号 (必填)
 * @returns 直接返回PayPHP API响应
 */
export function queryPayOrder(data: { orderNo: string }): Promise<unknown> {
  return http.post(`${constant.baseURL}/api/payphp/query-order`, data);
}

/**
 * 关闭订单
 * @param data.orderNo - 商户订单号 (必填)
 * @returns 直接返回PayPHP API响应
 */
export function closePayOrder(data: { orderNo: string }): Promise<unknown> {
  return http.post(`${constant.baseURL}/api/payphp/close-order`, data);
}

/**
 * 查询支付账户余额
 * @returns 直接返回PayPHP API响应
 */
export function getPayBalance(): Promise<unknown> {
  return http.get(`${constant.baseURL}/api/payphp/balance`);
}

/**
 * 支付回调通知
 * @description 接收支付平台的回调数据
 * @param data - 支付平台回调参数
 * @returns success 字符串
 */
export function payNotify(data: unknown): Promise<string> {
  return http.post(`${constant.baseURL}/api/payphp/notify`, data);
}

/**
 * 发送邮件（通过LuckyCola）
 * @description 发送QQ/163/126邮件
 * @param data.tomail - 目标邮箱 (必填)
 * @param data.fromTitle - 邮件标题 (必填)
 * @param data.subject - 邮件主题 (必填)
 * @param data.content - 邮件内容，支持HTML (必填)
 * @param data.smtpCode - SMTP授权码 (可选，默认读取配置)
 * @param data.smtpEmail - 发件邮箱 (可选，默认读取配置)
 * @param data.smtpCodeType - 邮箱类型 qq/163/126 (可选，默认qq)
 * @param data.isTextContent - 内容是否为纯文本 (可选，默认false)
 * @param data.colakey - LuckyCola Key (可选，默认读取配置)
 * @returns 直接返回LuckyCola API响应
 */
export function sendMail(data: {
  tomail: string;
  fromTitle: string;
  subject: string;
  content: string;
  smtpCode?: string;
  smtpEmail?: string;
  smtpCodeType?: string;
  isTextContent?: boolean;
  colakey?: string;
}): Promise<unknown> {
  return http.post(`${constant.baseURL}/api/mail/send`, data);
}
