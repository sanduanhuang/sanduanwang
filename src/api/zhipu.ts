/**
 * 智谱AI (Zhipu) API 模块
 * 提供大模型对话、图片生成、翻译、视觉识别等功能
 */
import http from "@/utils/request";
import constant from "@/utils/constant";

/**
 * AI对话
 * @param data.messages - 消息数组 [{role, content}] (必填)
 * @param data.model - 模型名称，默认 glm-4-flash (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns result - AI原始响应
 */
export function chat(data: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  apiKey?: string;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/zhipu/chat`, data);
}

/**
 * AI上下文对话
 * @description 支持多轮对话，自动维护上下文
 * @param data.uniqueId - 用户唯一ID (必填)
 * @param data.message - 用户消息 (必填)
 * @param data.model - 模型名称，默认 glm-4-flash (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns message - 提示信息
 * @returns response - AI回复内容
 */
export function chatWithContext(data: {
  uniqueId: string;
  message: string;
  model?: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    reply: string;
    history: Array<{ role: string; content: string }>;
  };
}> {
  return http.post(`${constant.baseURL}/api/zhipu/chat-with-context`, data);
}

/**
 * AI图片生成
 * @param data.prompt - 图片描述 (必填)
 * @param data.model - 模型名称，默认 cogview-3-flash (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns result - 生成结果
 */
export function generateImage(data: {
  prompt: string;
  model?: string;
  apiKey?: string;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/zhipu/image`, data);
}

/**
 * AI翻译
 * @param data.text - 待翻译文本 (必填)
 * @param data.source - 源语言，默认 auto (可选)
 * @param data.target - 目标语言 (必填)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns data.originalText - 原文
 * @returns data.translatedText - 译文
 * @returns data.source - 源语言
 * @returns data.target - 目标语言
 */
export function translate(data: {
  text: string;
  source?: string;
  target: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  data: {
    originalText: string;
    translatedText: string;
    source: string;
    target: string;
  };
}> {
  return http.post(`${constant.baseURL}/api/zhipu/translate`, data);
}

/**
 * 删除AI上下文
 * @description 清除用户的对话历史记录
 * @param uniqueId - 用户唯一ID (必填，路径参数)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function deleteContext(uniqueId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return http.delete(`${constant.baseURL}/api/zhipu/context/${uniqueId}`);
}

/**
 * AI视觉识别
 * @description 对图片进行详细描述或问答
 * @param data.image - 图片(base64或URL) (必填)
 * @param data.prompt - 提问内容，默认"请详细描述这张图片" (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns result - AI原始响应
 */
export function vision(data: {
  image: string;
  prompt?: string;
  apiKey?: string;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/zhipu/vision`, data);
}

/**
 * AI视频生成
 * @param data.prompt - 视频描述 (必填)
 * @param data.image - 参考图片 (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns result - 生成结果
 */
export function generateVideo(data: {
  prompt: string;
  image?: string;
  apiKey?: string;
}): Promise<{ success: boolean; result: unknown }> {
  return http.post(`${constant.baseURL}/api/zhipu/video`, data);
}
