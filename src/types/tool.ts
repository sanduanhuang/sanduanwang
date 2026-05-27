/**
 * 在线工具相关类型定义
 * 对应数据库：在线工具
 */

export interface OnlineTool {
  id?: number;
  名字: string;
  图标: string;
  介绍: string;
  创建时间: string;
  工具类型: string;
}

export interface OnlineToolListParams {
  current?: number;
  size?: number;
  工具类型?: string;
}