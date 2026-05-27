/**
 * API调用日志类型定义
 * 对应数据库：API调用
 */
//API调用日志类型
export interface APICallLog {
  id?: number;
  api: string;
  次数: number;
  调用日志: string;
  名称: string;
}
//API调用日志列表参数类型
export interface APICallLogListParams {
  current?: number;
  size?: number;
  api?: string;
  名称?: string;
}