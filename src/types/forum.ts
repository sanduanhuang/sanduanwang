/**
 * 论坛相关类型定义
 * 对应数据库：论坛
 */
//论坛类型
export interface Forum {
  id?: number;
  标题: string;
  内容: string;
  创建时间: string;
  更新时间: string;
  标签: ForumTag[];
  分类: string;
  封面: string;
  用户信息: UserInfo;
  阅读?: number;
}

//用户信息类型
export interface UserInfo {
  账号: string;
  头像: string;
  用户名?: string;
}

export interface Reply {
  id?: number;
  唯一ID: string;
  所属论坛编号: number | string;
  回复的对象数据: ReplyObject;
  用户数据: UserInfo;
  评论的内容: string;
  附带的图片: string;
  创建时间: string;
  更新时间: string;
  发送日期?: string;
  父回复ID?: number;
}
//回复的对象数据
export interface ReplyObject {
  唯一ID: string;
  是否是帖子: boolean;
  用户信息?: UserInfo;
  论坛信息?: Forum;
}



//论坛帖子列表参数类型
export interface ForumListParams {
  唯一ID?: string;
  发起者账号?: string;
  所属页面?: string;
  分类?: string;
}

export interface ForumTag {
  id?: number;
  名称: string;
  创建时间: string;
  代表颜色: string;
}

export interface danmu {
  id?: number;
  弹幕内容: string;
  弹幕颜色: string;
  发送时间: string;
  账号数据: {
    账号: string;
    头像: string;
  };
}
