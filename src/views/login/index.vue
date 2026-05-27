<template>
  <div class="auth-page" :style="{ backgroundImage: `url(${backgroundUrl})` }">
    <div class="auth-container">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      
      <!-- 卡片 -->
      <div class="auth-card">
        <!-- 头部切换 -->
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: isLogin }" 
            @click="isLogin = true"
          >
            <span class="tab-icon">👤</span>
            <span>登录</span>
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: !isLogin }" 
            @click="isLogin = false"
          >
            <span class="tab-icon">📝</span>
            <span>注册</span>
          </button>
        </div>
        
        <!-- 登录表单 -->
        <div v-if="isLogin" class="form-content">
          <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="0">
            <div class="form-group">
              <el-input 
                v-model="loginForm.account" 
                placeholder="账号" 
                class="input-field"
                prefix-icon="el-icon-user"
              />
            </div>
            <div class="form-group">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="密码" 
                class="input-field"
                prefix-icon="el-icon-lock"
                show-password
              />
            </div>
            <div class="form-group">
              <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loginLoading">
                <span>登录</span>
              </el-button>
            </div>
          </el-form>
        </div>
        
        <!-- 注册表单 -->
        <div v-else class="form-content">
          <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="0">
            <div class="form-group">
              <el-input 
                v-model="registerForm.account" 
                placeholder="账号" 
                class="input-field"
                prefix-icon="el-icon-user"
              />
            </div>
            <div class="form-group">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="密码" 
                class="input-field"
                prefix-icon="el-icon-lock"
                show-password
              />
            </div>
            <div class="form-group">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="确认密码" 
                class="input-field"
                prefix-icon="el-icon-lock"
                show-password
              />
            </div>
            <div class="form-group">
              <div class="email-code-wrapper">
                <el-input 
                  v-model="registerForm.email" 
                  placeholder="邮箱（必填）" 
                  class="input-field email-input"
                  prefix-icon="el-icon-mail"
                />
                <el-button 
                  class="send-code-btn" 
                  :disabled="sendCodeDisabled || codeCountdown > 0" 
                  @click="handleSendCode"
                  :loading="sendingCode"
                >
                  {{ codeCountdown > 0 ? `${codeCountdown}s` : '发送验证码' }}
                </el-button>
              </div>
            </div>
            <div class="form-group">
              <el-input 
                v-model="registerForm.code" 
                placeholder="验证码" 
                class="input-field"
                prefix-icon="el-icon-key"
                maxlength="6"
              />
            </div>
            <div class="form-group avatar-upload-group">
              <label class="avatar-label">
                <div class="avatar-preview">
                  <img v-if="avatarPreview" :src="avatarPreview" alt="头像预览" />
                  <span v-else class="avatar-placeholder">+</span>
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  class="avatar-input"
                  @change="handleAvatarUpload"
                />
              </label>
              <span class="avatar-tip">点击上传头像（必填）</span>
            </div>
            <div class="form-group">
              <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="registerLoading">
                <span>注册</span>
              </el-button>
            </div>
          </el-form>
        </div>
        
        <!-- 提示信息 -->
        <div class="tips">
          <span v-if="isLogin">还没有账号？</span>
          <span v-else>已有账号？</span>
          <button class="link-btn" @click="isLogin = !isLogin">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, inject } from "vue";
import { useRouter } from "vue-router";
import { login, register } from "@/api/user";
import { getBackgrounds } from "@/api/data";
import { sendMail } from "@/api/external";
import { useUserStore } from "@/stores/user";
import constant from '@/utils/constant';

const router = useRouter();
const userStore = useUserStore();
const showToast = inject('showToast') as (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
const backgroundUrl = ref<string>("");

// 切换登录/注册
const isLogin = ref(true);

// 加载状态
const loginLoading = ref(false);
const registerLoading = ref(false);

// 头像预览
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

// 表单引用
const loginFormRef = ref();
const registerFormRef = ref();

// 登录表单
const loginForm = reactive({
  account: "",
  password: "",
});

// 注册表单
const registerForm = reactive({
  account: "",
  password: "",
  confirmPassword: "",
  email: "",
  code: "",
});

// 验证码相关
const sendingCode = ref(false);
const codeCountdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const generatedCode = ref(""); // 前端生成的验证码

// 验证验证码有效性
const isCodeValid = computed(() => {
  // 没有发送过验证码则直接视为无效
  if (!generatedCode.value) return false;
  return registerForm.code === generatedCode.value;
});

// 发送验证码按钮是否可用
const sendCodeDisabled = computed(() => {
  return !registerForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email);
});

// 登录验证规则
const loginRules = {
  account: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

// 注册验证规则
const registerRules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "账号长度在3-20个字符之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 9, message: "密码至少9位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码为6位数字", trigger: "blur" },
  ],
};

// 处理头像上传
const handleAvatarUpload = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showToast("头像文件不能超过2MB", 'error');
      return;
    }
    
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("只支持JPG、PNG、GIF、WebP格式的图片", 'error');
      return;
    }
    
    avatarFile.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// 登录
const handleLogin = async () => {
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  loginLoading.value = true;

  try {
    const result = await login({
      account: loginForm.account,
      password: loginForm.password,
    });

    if (result.success) {
      userStore.login({
        account: loginForm.account,
        password: loginForm.password,
        uniqueId: result.uniqueId,
        avatar: result.avatar,
      });
      showToast("登录成功！", 'success');
      router.push("/");
    } else {
      showToast(result.message || "登录失败", 'error');
    }
  } catch (error: any) {
    console.error("登录失败:", error);
    const errMsg = error?.response?.data?.message || error?.message || "登录失败，请稍后重试";
    showToast(errMsg, 'error');
  } finally {
    loginLoading.value = false;
  }
};

// 生成6位随机验证码
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码
const handleSendCode = async () => {
  if (sendCodeDisabled.value) {
    showToast("请输入有效的邮箱地址", 'error');
    return;
  }

  sendingCode.value = true;

  try {
    // 生成6位验证码
    const code = generateCode();
    generatedCode.value = code;

    const result = await sendMail({
      tomail: registerForm.email,
      fromTitle: "三段荒の窝",
      subject: "邮箱验证码",
      content: `
        <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#ff6b6b,#ee5a5a);padding:30px;border-radius:10px 10px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">三段荒の窝</h1>
          </div>
          <div style="background:#fff;padding:30px;border:1px solid #eee;border-radius:0 0 10px 10px;">
            <p style="font-size:16px;color:#333;">您好！</p>
            <p style="font-size:16px;color:#333;">您正在注册三段荒の窝账号，请使用以下验证码完成注册：</p>
            <div style="text-align:center;margin:30px 0;">
              <span style="display:inline-block;padding:15px 40px;background:#f5f5f5;border-radius:8px;font-size:32px;font-weight:bold;color:#ff6b6b;letter-spacing:8px;">${code}</span>
            </div>
            <p style="font-size:14px;color:#999;">验证码有效期为5分钟，请勿泄露给他人。</p>
            <p style="font-size:14px;color:#999;">如果您没有进行此操作，请忽略此邮件。</p>
          </div>
          <div style="text-align:center;padding:20px;color:#999;font-size:12px;">
            <p>此邮件由系统自动发送，请勿回复</p>
          </div>
        </div>
      `,
      isTextContent: false,
    });

    if (result && (result as any).success !== false) {
      showToast("验证码已发送到您的邮箱，请注意查收", 'success');
      // 开始倒计时
      codeCountdown.value = 60;
      countdownTimer = setInterval(() => {
        codeCountdown.value--;
        if (codeCountdown.value <= 0) {
          if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
          }
        }
      }, 1000);
    } else {
      showToast((result as any)?.message || "验证码发送失败，请稍后重试", 'error');
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    showToast("验证码发送失败，请检查邮箱是否正确", 'error');
  } finally {
    sendingCode.value = false;
  }
};

// 注册
const handleRegister = async () => {
  const valid = await registerFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  if (!avatarFile.value) {
    showToast("请上传头像", 'error');
    return;
  }

  // 验证验证码
  if (!isCodeValid.value) {
    showToast(generatedCode.value ? "验证码错误，请重新输入" : "请先获取邮箱验证码", 'error');
    return;
  }

  registerLoading.value = true;

  try {
    const result = await register({
      account: registerForm.account,
      password: registerForm.password,
      avatar: avatarFile.value,
      email: registerForm.email,
    });

    if (result.success) {
      userStore.login({
        account: registerForm.account,
        password: registerForm.password,
        uniqueId: result.uniqueId,
        avatar: result.avatar,
      });
      showToast("注册成功！", 'success');
      router.push("/");
    } else {
      // 后端返回错误信息，如账号已存在等
      showToast(result.message || "注册失败", 'error');
    }
  } catch (error: any) {
    console.error("注册失败:", error);
    const errMsg = error?.response?.data?.message || error?.message || "注册失败，请稍后重试";
    showToast(errMsg, 'error');
  } finally {
    registerLoading.value = false;
  }
};

// 清理倒计时定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
});

onMounted(async () => {
  try {
    const bgData = await getBackgrounds("登录注册") as { url: string };
    if (bgData && bgData.url) {
      backgroundUrl.value = bgData.url;
    }
  } catch (bgError) {
    console.log("获取背景图失败");
  }
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation-delay: -2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 30%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* 卡片样式 */
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-height: 80vh; /* 固定最大高度，防止遮挡导航栏 */
  overflow-y: auto; /* 超出部分可滚动 */
}

/* 标签切换 */
.auth-tabs {
  display: flex;
  margin-bottom: 30px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.tab-icon {
  font-size: 18px;
}

/* 表单内容 */
.form-content {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

/* 邮箱+验证码按钮行 */
.email-code-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.email-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  height: 48px !important;
  padding: 0 16px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%) !important;
  color: #fff !important;
  border: none !important;
  font-size: 14px !important;
  white-space: nowrap;
  transition: all 0.3s ease !important;
}

.send-code-btn:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
  transform: translateY(-1px);
}

.send-code-btn:disabled {
  background: #ccc !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.input-field {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

/* 头像上传 */
.avatar-upload-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-label {
  cursor: pointer;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  border-color: #ff6b6b;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 32px;
  color: #ccc;
}

.avatar-input {
  display: none;
}

.avatar-tip {
  font-size: 13px;
  color: #999;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 提示链接 */
.tips {
  text-align: center;
  font-size: 14px;
  color: #999;
}

.link-btn {
  margin-left: 8px;
  color: #ff6b6b;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.link-btn:hover {
  color: #ee5a5a;
  text-decoration: underline;
}
</style>