/**
 * 用户相关类型定义
 * 对应数据库：密码表、用户表
 */

export enum UserType {
  Boss = 0,
  Admin = 1,
  User = 2,
  Visitor = 3,
}
//密码记录类型
export interface PasswordRecord {
  id?: number;
  账号: string;
  密码: string;
  唯一ID: string;
  原始密码?: string;
  管理员?: number;
  邮箱?: string;
}
//用户类型
export interface User {
  id?: number;
  账号: string;
  头像?: string;
  注册时间?: string;
  上次访问时间?: string;
  性别?: string;
  简介?: string;
  用户名?: string;
  其它?: string;
  邮箱?: string;
}
//当前用户类型
export interface CurrentUser {
  id: number;
  username: string;
  avatar: string;
  email: string | null;
  introduction: string | null;
  userType: UserType;
  accessToken: string;
  admire: string | null;
  userStatus: boolean;
  phoneNumber: string | null;
  gender: number | null;
  createTime: string;
}

export type CurrentAdmin = CurrentUser;

export interface LoginParams {
  account: string;
  password: string;
}

export interface RegisterParams {
  账号: string;
  密码: string;
  邮箱: string;
  头像: string;
}

export interface UserCloudLeaderboard {
  id?: number;
  账号: string;
  排行榜名称: string;
  排行榜数据: string;
  上次修改时间: string;
  排行榜字段: string;
  值字段: string;
}