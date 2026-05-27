/**
 * 动态数据操作 API 模块
 * 提供灵活的数据库 CRUD 操作接口
 */
import http from "@/utils/request";
import constant from "@/utils/constant";
import type { Forum, ForumTag, Reply } from "@/types";
import { chat, translate } from "./zhipu";
import { generateAiImage } from "./ai";

/**
 * 动态查询数据
 * @param data.table - 表名 (必填)
 * @param data.fields - 字段列表，默认全部 (可选)
 * @param data.where - 查询条件，SQL字符串或对象 (可选)
 * @param data.order - 排序字段 (可选)
 * @param data.sort - 排序方向，asc 或 desc (可选)
 * @param data.limit - 限制返回数量 (可选)
 * @param data.offset - 偏移量 (可选)
 * @param data.uniqueId - 用户唯一ID (可选)
 * @returns success - 是否成功
 * @returns data - 查询结果数组
 */
export function query(data: {
  table: string;
  fields?: string[];
  where?: string | Record<string, unknown>;
  order?: string;
  sort?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  uniqueId?: 'user_1779243581625437300';
}): Promise<{ success: boolean; data: unknown[] }> {
  return http.post(`${constant.baseURL}/api/data/query`, data);
}

/**
 * 动态插入数据
 * @param data.table - 表名 (必填)
 * @param data.data - 要插入的数据对象 (必填)
 * @param data.uniqueId - 用户唯一ID (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function insert(data: {
  table: string;
  data: Record<string, unknown>;
  uniqueId: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/data/insert`, data);
}

/**
 * 动态更新数据
 * @description 非管理员只能操作自己账号的数据
 * @param data.table - 表名 (必填)
 * @param data.data - 要更新的数据对象 (必填)
 * @param data.where - 更新条件，SQL字符串 (必填)
 * @param data.uniqueId - 用户唯一ID (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function update(data: {
  table: string;
  data: Record<string, unknown>;
  where: string;
  uniqueId: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/data/update`, data);
}

/**
 * 动态删除数据
 * @description 非管理员只能操作自己账号的数据
 * @param data.table - 表名 (必填)
 * @param data.where - 删除条件，SQL字符串 (必填)
 * @param data.uniqueId - 用户唯一ID (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function deleteData(data: {
  table: string;
  where: string;
  uniqueId: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/data/delete`, data);
}

/**
 * 获取AI生成的图片列表
 * @param uniqueId - 用户唯一ID (必填，路径参数)
 * @returns success - 是否成功
 * @returns data - 图片列表数组
 */
export function getAiImages(uniqueId: string): Promise<{
  success: boolean;
  data: unknown[];
}> {
  return http.get(`${constant.baseURL}/api/ai/images/${uniqueId}`);
}

// 辅助函数：解析 JSON 字符串，容错处理
const parseJson = (str: unknown, defaultValue: unknown = null) => {
  if (typeof str !== 'string' || !str) {
    return defaultValue;
  }
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

/**
 * 获取论坛帖子列表
 * @param uniqueId - 用户唯一ID (可选)
 * @returns success - 是否成功
 * @returns data - 帖子列表数组
 */
export async function getForumPosts(uniqueId: string='user_1779243581625437300'): Promise<Record<string, unknown>[]> {
  const res = await query({
    table: "论坛",
    fields: [],
    where: "",
    order: "id",
    sort: "desc",
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询论坛帖子失败");
  }
  
  // 解析 JSON 字段（空值保护）
  const posts = (res.data as unknown[]) || [];
  return posts.map(post => {
    const postData = post as Record<string, unknown>;
    return {
      ...postData,
      标签: parseJson(postData.标签, []),
      用户信息: parseJson(postData.用户信息, {})
    } as Forum;
  });
}



/**
 * 添加论坛帖子
 * @param uniqueId - 用户唯一ID (必填)
 * @param data - 要插入的数据对象 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export async function addForumPost(uniqueId: string, data:Record<string, unknown>): Promise<unknown> {
  // 转换对象为 JSON 字符串
  const saveData = {
    ...data,
    标签: JSON.stringify(data.标签 || []),
    用户信息: JSON.stringify(data.用户信息 || {})
  };
  
  const res = await insert({
    table: "论坛",
    data: saveData,
    uniqueId: uniqueId,
  });
  
  if (!res.success) {
    throw new Error("添加论坛帖子失败");
  }
  return res.message;
}

/**
 * 更新论坛帖子
 * @param uniqueId - 用户唯一ID (必填)
 * @param data - 要更新的数据对象 (必填)
 * @param where - 更新条件，SQL字符串 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export async function updateForumPost(uniqueId: string, data:Record<string, unknown>, where: string): Promise<unknown> {
  // 转换对象为 JSON 字符串
  const saveData = {
    ...data
  };
  if (saveData.标签 !== undefined) {
    saveData.标签 = JSON.stringify(saveData.标签);
  }
  if (saveData.用户信息 !== undefined) {
    saveData.用户信息 = JSON.stringify(saveData.用户信息);
  }
  
  const res = await update({
    table: "论坛",
    data: saveData,
    where: where,
    uniqueId: uniqueId,
  });
  if (!res.success) {
    throw new Error("更新论坛帖子失败");
  }
  return res.message;
}

//添加论坛帖子标签
export async function addForumTag(uniqueId: string, data:ForumTag ): Promise<unknown> {
  const res = await insert({
    table: "论坛标签",
    data:data,
    uniqueId: uniqueId,
  });
  
  if (!res.success) {
    throw new Error("添加论坛帖子标签失败");
  }
  return res.message;
}
//获取论坛帖子标签列表
export async function getForumTags(uniqueId: string='user_1779243581625437300'): Promise<ForumTag[]> {
  const res = await query({
    table: "论坛标签",
    fields: [],
    where: "",
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询论坛帖子标签失败");
  }
  return res.data as ForumTag[];
}




//根据名字获取背景图
export async function getBackgrounds(name: string='首页'): Promise<unknown> {
  const res = await query({
    table: "背景图",
    fields: ["url"],
    where: "名称 = '" + name + "'",
    uniqueId: "user_1779243581625437300",
  });
   
  if (!res.success) {
    throw new Error("查询背景图失败");
  }
  return res.data[0] as {"url":string};
}

//作者相册表列表
export async function getAlbums(uniqueId: string='user_1779243581625437300'): Promise<unknown> {
  const res = await query({
    table: "相册表",
    fields: [],
    where: "",
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询相册表失败");
  }
  return res.data;
}

/**
 * 获取帖子回复列表
 * @param postId - 帖子唯一ID (必填)
 * @param uniqueId - 用户唯一ID (可选)
 * @returns success - 是否成功
 * @returns data - 回复列表数组
 */
export async function getReplies(postId: string | number, uniqueId: string='user_1779243581625437300', sort: 'asc' | 'desc' = 'desc'): Promise<unknown> {
  const isNumeric = !isNaN(Number(postId));
  const where = isNumeric 
    ? "所属论坛编号 = " + postId 
    : "所属论坛编号 = '" + postId + "'";
  
  const res = await query({
    table: "回复表",
    fields: [],
    where: where,
    order: "发送日期",
    sort: sort,
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询回复失败");
  }
  return res.data || [];
}

/**
 * 添加回复
 * @param uniqueId - 用户唯一ID (必填)
 * @param data - 要插入的回复数据对象 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export async function addReply(uniqueId: string, data: Record<string, unknown>): Promise<unknown> {
  const res = await insert({
    table: "回复表",
    data: data,
    uniqueId: uniqueId,
  });
  
  if (!res.success) {
    throw new Error("添加回复失败");
  }
  return res.message;
}

/**
 * 获取留言板所有留言
 * @param uniqueId - 用户唯一ID (必填)
 * @returns success - 是否成功
 * @returns data - 留言列表数组
 */
export async function getMessages(uniqueId: string='user_1779243581625437300', sort: 'asc' | 'desc' = 'desc'): Promise<unknown> {
  const res = await query({
    table: "留言板",
    fields: [],
    where: "",
    order: "发送日期",
    sort: sort,
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询留言失败");
  }
  return res.data;
}

/**
 * 添加留言
 * @param uniqueId - 用户唯一ID (必填)
 * @param data - 要插入的留言数据对象 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export async function addMessage(uniqueId: string, data: Record<string, unknown>): Promise<unknown> {
  const res = await insert({
    table: "留言板",
    data: data,
    uniqueId: uniqueId,
  });
  
  if (!res.success) {
    throw new Error("添加留言失败");
  }
  return res.message;
}

/**
 * 获取可@列表（所有可提及的账号）
 */
export async function getAtList(): Promise<{ id: number; 账号: string }[]> {
  try {
    const res = await query({
      table: "可at列表",
      fields: ["id", "账号"],
      where: "",
      uniqueId: "user_1779243581625437300",
    });
    return (res.data || []) as { id: number; 账号: string }[];
  } catch {
    return [];
  }
}

// AI 账号信息
const AI_UNIQUE_ID = "user_1779233324706940700";
const AI_NAME = "智谱AI";
const AI_IMAGE_NAME = "智谱AI-文生图";
const AI_TRANSLATE_NAME = "智谱AI-翻译";
const AI_AVATAR = "https://free.picui.cn/free/2026/05/20/6a0cf41b1ea52.png";


/**
 * 检测内容是否@了智谱AI，如果是则自动调用AI回复
 * @param content - 用户消息内容
 * @param table - 目标表名（"留言板" 或 "回复表"）
 * @param parentData - 如果是回复表，需要传入关联数据（可选）
 * @param parentId - 父回复ID，AI将回复在该ID下（可选）
 */
export async function triggerAiAutoReply(
  content: string,
  table: "留言板" | "回复表",
  parentData?: Record<string, unknown>,
  parentId?: number | string
): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  // ── 处理 @智谱AI-文生图 ──
  if (content.includes("@" + AI_IMAGE_NAME)) {
    let prompt = content.replace("@" + AI_IMAGE_NAME, "").trim();
    if (!prompt) prompt = "画一幅美丽的风景画";

    try {
      const res = await generateAiImage({
        uniqueId: AI_UNIQUE_ID,
        prompt: prompt,
        model: "cogview-3-flash",
      });

      const imageUrl = res?.data?.url;
      if (!res?.success || !imageUrl) {
        console.error("图片生成失败:", res?.message);
        return;
      }

      const userData = JSON.stringify({
        账号: AI_NAME,
        头像: AI_AVATAR,
        用户名: AI_NAME,
      });

      // 回复内容：纯文本，图片通过附带的图片字段显示
      const reply = `🧑‍🎨 根据「${prompt}」生成：`;

      if (table === "留言板") {
        await addMessage(AI_UNIQUE_ID, {
          唯一ID: AI_UNIQUE_ID,
          内容: reply,
          用户数据: userData,
          回复的对象数据: JSON.stringify(parentData || {}),
          父回复ID: parentId || 0,
          发送日期: now,
          附带的图片: imageUrl,
        });
      } else {
        await addReply(AI_UNIQUE_ID, {
          唯一ID: AI_UNIQUE_ID,
          内容: reply,
          用户数据: userData,
          所属论坛编号: parentData?.所属论坛编号 || "",
          回复的对象数据: JSON.stringify(parentData || {}),
          父回复ID: parentId || 0,
          发送日期: now,
          附带的图片: imageUrl,
        });
      }
    } catch (err) {
      console.error("AI图片生成回复失败:", err);
    }
    return;
  }

  // ── 处理 @智谱AI-翻译 ──
  if (content.includes("@" + AI_TRANSLATE_NAME)) {
    let textToTranslate = content.replace("@" + AI_TRANSLATE_NAME, "").trim();
    if (!textToTranslate) {
      textToTranslate = "你好世界";
    }

    try {
      const res = await translate({
        text: textToTranslate,
        target: "en",
      });

      const translatedText = res?.data?.translatedText;
      if (!res?.success || !translatedText) {
        console.error("翻译失败:", res?.message);
        return;
      }

      const userData = JSON.stringify({
        账号: AI_NAME,
        头像: AI_AVATAR,
        用户名: AI_NAME,
      });

      const reply = `🌐 翻译结果：\n${translatedText}`;

      if (table === "留言板") {
        await addMessage(AI_UNIQUE_ID, {
          唯一ID: AI_UNIQUE_ID,
          内容: reply,
          用户数据: userData,
          回复的对象数据: JSON.stringify(parentData || {}),
          父回复ID: parentId || 0,
          发送日期: now,
        });
      } else {
        await addReply(AI_UNIQUE_ID, {
          唯一ID: AI_UNIQUE_ID,
          内容: reply,
          用户数据: userData,
          所属论坛编号: parentData?.所属论坛编号 || "",
          回复的对象数据: JSON.stringify(parentData || {}),
          父回复ID: parentId || 0,
          发送日期: now,
        });
      }
    } catch (err) {
      console.error("AI翻译回复失败:", err);
    }
    return;
  }

  // ── 处理 @智谱AI（文字对话） ──
  if (!content.includes("@" + AI_NAME)) return;

  let question = content.replace("@" + AI_NAME, "").trim();
  if (!question) question = "你好";

  try {
    const res = await chat({
      messages: [{ role: "user", content: `你是${AI_NAME}，一个智能AI助手。请友好简洁地回答：${question}` }],
      model: "glm-4-flash",
    });

    const result = res?.result as any;
    const reply = result?.choices?.[0]?.message?.content;
    if (!res?.success || !reply) return;

    const userData = JSON.stringify({
      账号: AI_NAME,
      头像: AI_AVATAR,
      用户名: AI_NAME,
    });

    if (table === "留言板") {
      await addMessage(AI_UNIQUE_ID, {
        唯一ID: AI_UNIQUE_ID,
        内容: reply,
        用户数据: userData,
        回复的对象数据: JSON.stringify(parentData || {}),
        父回复ID: parentId || 0,
        发送日期: now,
      });
    } else {
      await addReply(AI_UNIQUE_ID, {
        唯一ID: AI_UNIQUE_ID,
        内容: reply,
        用户数据: userData,
        所属论坛编号: parentData?.所属论坛编号 || "",
        回复的对象数据: JSON.stringify(parentData || {}),
        父回复ID: parentId || 0,
        发送日期: now,
      });
    }
  } catch (err) {
    console.error("AI自动回复失败:", err);
  }
}

//查询用户表最近登录的10个用户
export async function getUser(uniqueId: string='user_1779243581625437300'): Promise<unknown> {
  const res = await query({
    table: "用户表",
    fields: [],
    where: "",
    order: "上次访问时间",
    sort: "desc",
    limit: 10,
    uniqueId: uniqueId,
  });
   
  if (!res.success) {
    throw new Error("查询用户表失败");
  }
  return res.data;
}

/**
 * 增加论坛阅读量
 * @param id - 论坛帖子ID（必填）
 * @returns success - 是否成功
 * @returns message - 结果消息
 * @returns data - {id, beforeViews, afterViews}
 */
export async function increaseForumView(id: number): Promise<{
  success: boolean;
  message: string;
  data: {
    id: number;
    beforeViews: number;
    afterViews: number;
  };
}> {
  return http.post(`${constant.baseURL}/api/forum/increase-view`, { id });
}