/**
 * 用户相关 API 模块
 * 包含注册、登录、注销、修改密码等功能
 */
import http from "@/utils/request";
import constant from "@/utils/constant";

/**
 * 用户注册
 * @param data.account - 账号 (必填)
 * @param data.password - 密码 (必填，至少9位)
 * @param data.avatar - 头像文件 (必填)
 * @param data.email - 邮箱地址 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息（账号已存在等错误也会返回）
 * @returns uniqueId - 用户唯一ID
 * @returns avatar - 用户头像地址
 */
export function register(data: {
  account: string;
  password: string;
  avatar: File;
  email: string;
}): Promise<{
  success: boolean;
  message: string;
  uniqueId: string;
  avatar: string;
}> {
  const formData = new FormData();
  formData.append("account", data.account);
  formData.append("password", data.password);
  formData.append("avatar", data.avatar);
  formData.append("email", data.email);
  return http.post(`${constant.baseURL}/api/user/register`, formData, false);
}

/**
 * 用户登录
 * @param data.account - 账号 (必填)
 * @param data.password - 密码 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 * @returns uniqueId - 用户唯一ID
 * @returns avatar - 用户头像地址
 */
export function login(data: {
  account: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  uniqueId: string;
  avatar?: string;
}> {
  return http.post(`${constant.baseURL}/api/user/login`, data);
}

/**
 * 注销账号
 * @param data.uniqueId - 用户唯一ID (必填)
 * @param data.password - 密码验证 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function logout(data: {
  uniqueId: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/user/logout`, data);
}

/**
 * 修改密码
 * @param data.account - 账号 (必填)
 * @param data.password - 原密码 (必填)
 * @param data.newPassword - 新密码 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function updatePassword(data: {
  account: string;
  password: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/user/update-password`, data);
}


/**
 * 消耗金币
 * @param data.uniqueId - 用户唯一ID (必填)
 * @param data.gold - 要消耗的金币数量 (必填)
 * @param data.reason - 消耗原因 (可选)
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export function consumeGold(data: {
  uniqueId: string;
  gold: number;
  reason?: string;
}): Promise<{ success: boolean; message: string }> {
  return http.post(`${constant.baseURL}/api/user/consume-coins`, data);
}

/**
 * 验证是否为管理员
 * @param data.account - 账号 (必填)
 * @param data.password - 密码 (必填)
 * @returns success - 是否成功
 * @returns message - 提示信息
 * @returns isAdmin - 是否为管理员
 */
export function checkAdmin(data: {
  account: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  isAdmin: boolean;
}> {
  return http.post(`${constant.baseURL}/api/user/check-admin`, data);
}

// 弹幕相关API
/**
 * 发送弹幕
 * @param danmuData - 弹幕数据
 * @param options - 可选参数
 * @param options.uniqueId - 唯一ID (用于验证)
 * @param options.account - 账号 (用于显示)
 * @param options.avatar - 头像地址
 * @returns success - 是否成功
 * @returns message - 提示信息
 */
export async function sendDanmu(danmuData: {
  弹幕内容: string;
  弹幕颜色?: string;
  所属页面?: string;
  唯一ID?: string;
}, options?: {
  uniqueId?: string;
  account?: string;
  avatar?: string;
}): Promise<{ success: boolean; message: string }> {
  const avatar = options?.avatar || constant.guestAvatar;
  const uniqueId = options?.uniqueId || '';
  const account = options?.account || '游客';
  
  const data = {
    弹幕内容: danmuData.弹幕内容,
    弹幕颜色: danmuData.弹幕颜色 || '#FFFFFF',
    发送时间: new Date().toISOString().slice(0, 19).replace('T', ' '),
    账号数据: JSON.stringify({
      账号: account,
      头像: avatar
    }),
    唯一ID: danmuData.唯一ID,
  };
  
  try {
    const params: {
      table: string;
      data: typeof data;
      uniqueId?: string;
    } = {
      table: "弹幕表",
      data: data,
    };
    
    if (uniqueId) {
      params.uniqueId = uniqueId;
    }
    
    const res = await http.post(`${constant.baseURL}/api/data/insert`, params);
    return res as { success: boolean; message: string };
  } catch (error) {
    const err = error as { response?: { status?: number; data?: any }; message?: string };
    console.error("发送弹幕失败:", err.response?.data || error);
    throw error;
  }
}

/**
 * 获取弹幕列表
 * @param page - 页面标识 (可选，仅用于查询过滤，因为弹幕表本身没有此字段)
 * @param senderAccount - 发起者账号 (可选)
 * @returns success - 是否成功
 * @returns data - 弹幕列表
 */
export async function getDanmuList(page?: string, senderAccount?: string, uniqueId?: string): Promise<{
  success: boolean;
  data: Array<{
    id: number;
    弹幕内容: string;
    弹幕颜色: string;
    发送时间: string;
    账号数据: {
      账号: string;
      头像: string;
    };
  }>;
}> {
  let whereClause = "";
  const params: string[] = [];
  
  // 注意：弹幕表中没有所属页面字段，这里只是简单匹配，如果需要按页面过滤，
  // 可能需要额外的机制或后端支持
  if (page) {
    // 因为弹幕表没有所属页面字段，这里暂不添加过滤条件
    // 或者后端可能需要特殊处理
  }
  
  if (senderAccount) {
    params.push(`JSON_EXTRACT(账号数据, '$.账号') = '${senderAccount}'`);
  }
  
  if (params.length > 0) {
    whereClause = params.join(" AND ");
  }
  
  try {
    const queryParams: {
      table: string;
      fields: string[];
      where: string;
      order: string;
      sort: string;
      limit: number;
      uniqueId?: string;
    } = {
      table: "弹幕表",
      fields: [],
      where: whereClause,
      order: "id",
      sort: "desc",
      limit: 50,
    };
    
    if (uniqueId) {
      queryParams.uniqueId = uniqueId;
    }
    
    const res = await http.post(`${constant.baseURL}/api/data/query`, queryParams);
    
    if (!res.success) {
      throw new Error("查询弹幕列表失败");
    }
    
    // 将查询结果转换为所需格式
    const danmuList = res.data.map((item: any) => {
      // 解析存储的账号数据
      let accountData = {
        账号: '游客',
        头像: ''
      };
      
      try {
        // 解析JSON格式的账号数据
        accountData = JSON.parse(item.账号数据);
      } catch (e) {
        // 如果不是JSON格式，使用默认值
      }
      
      return {
        id: item.id,
        弹幕内容: item.弹幕内容,
        弹幕颜色: item.弹幕颜色,
        发送时间: item.发送时间,
        账号数据: accountData
      };
    });
    
    return {
      success: res.success,
      data: danmuList
    };
  } catch (error) {
    const err = error as { response?: { status?: number; data?: any }; message?: string };
    console.error("获取弹幕列表失败:", error);
    console.error("错误状态:", err.response?.status);
    console.error("错误响应:", err.response?.data);
    console.error("传递的uniqueId:", uniqueId);
    console.error("查询参数:", { table: "弹幕表", fields: [], where: whereClause });
    throw error;
  }
}

