/**
 * 通用类型定义
 */

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

//分页状态类型
export interface PaginationState {
  current: number;
  size: number;
  total: number;
}
//分页响应类型
export interface PaginationResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}
//分页参数类型
export interface PaginationParams {
  current?: number;
  size?: number;
  noPagination?: boolean;
}

export interface ApiWrapperOptions {
  allowEmpty?: boolean;
  silent?: boolean;
}
//API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
//登录响应类型
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    uniqueId: string;
  };
}
//注册响应类型
/**
 * 注册响应类型
 * 对应数据库：用户
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  uniqueId?: string;
  avatar?: string;
}