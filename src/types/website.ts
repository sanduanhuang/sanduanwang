/**
 * 网站推荐相关类型定义
 * 对应数据库：网站推荐
 */

export interface Website {
  id?: number;
  名字: string;
  图标: string;
  网站url: string;
  介绍: string;
  所属分类: "工具" | "娱乐" | "AI" | "编程";
}

export interface WebsiteListParams {
  current?: number;
  size?: number;
  所属分类?: string;
}