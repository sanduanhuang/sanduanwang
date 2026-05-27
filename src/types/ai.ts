/**
 * AI相关类型定义
 * 对应数据库：AI上下文、AI生成图
 */

export interface AIContext {
  id?: number;
  唯一ID: string;
  历史对话: string;
}

export interface AIGeneratedImage {
  id?: number;
  唯一ID: string;
  描述: string;
  图片: string;
  创建日期: string;
}
//AI聊天参数类型
export interface AIChatParams {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  apiKey?: string;
}
//AI聊天响应类型
export interface AIChatResponse {
  success: boolean;
  result?: object;
  response?: string;
  message?: string;
}
//AI图片参数类型
export interface AIImageParams {
  prompt: string;
  model?: string;
  apiKey?: string;
}
//AI图片响应类型
export interface AIImageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    imageSize: string;
    fileSize: number;
  };
  message?: string;
}

