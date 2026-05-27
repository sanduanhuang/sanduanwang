/**
 * AI 功能 API 模块
 * 提供AI图片生成、文本检查、图片识别、视频生成等功能
 */
import http from "@/utils/request";
import constant from "@/utils/constant";

/**
 * AI图片生成（上传到图床）
 * @param data.uniqueId - 用户唯一ID (必填)
 * @param data.prompt - 图片描述 (必填)
 * @param data.model - 模型名称，默认 cogview-3-flash (可选)
 * @returns success - 是否成功
 * @returns data.url - 生成的图片URL
 * @returns data.prompt - 图片描述
 */
export function generateAiImage(data: {
  uniqueId: string;
  prompt: string;
  model?: string;
}): Promise<{
  success: boolean;
  data: {
    url: string;
    prompt: string;
  };
}> {
  return http.post(`${constant.baseURL}/api/ai/image/generate`, data);
}

/**
 * 文本合规检查
 * @description 检查文本内容是否合规
 * @param data.text - 待检查文本 (必填)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns result.isCompliant - 是否合规
 * @returns result.reason - 不合规原因
 * @returns result.suggestion - 修改建议
 */
export function checkTextCompliance(data: {
  text: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  result: {
    isCompliant: boolean;
    reason: string;
    suggestion: string;
  };
}> {
  return http.post(`${constant.baseURL}/api/text/check-compliance`, data);
}

/**
 * 图片识别
 * @description 对图片进行详细描述
 * @param data.image - 图片(base64或URL) (必填)
 * @param data.prompt - 提问内容，默认"请详细描述这张图片" (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns message - 提示信息
 * @returns result - 识别结果描述
 */
export function recognizeImage(data: {
  image: string;
  prompt?: string;
  apiKey?: string;
}): Promise<{ success: boolean; message: string; result: string }> {
  return http.post(`${constant.baseURL}/api/image/recognize`, data);
}

/**
 * 视频生成
 * @param data.prompt - 视频描述 (必填)
 * @param data.image - 参考图片 (可选)
 * @param data.apiKey - API密钥 (可选)
 * @returns success - 是否成功
 * @returns data.videoUrl - 视频URL
 * @returns data.taskId - 任务ID
 * @returns data.raw - 原始响应
 */
export function generateVideo(data: {
  prompt: string;
  image?: string;
  apiKey?: string;
}): Promise<{
  success: boolean;
  data: {
    videoUrl: string;
    taskId: string;
    raw: unknown;
  };
}> {
  return http.post(`${constant.baseURL}/api/video/generate`, data);
}
