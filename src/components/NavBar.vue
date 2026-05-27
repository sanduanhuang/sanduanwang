<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">
          <SiteName />
        </router-link>
      </div>
      <ul class="navbar-menu">
        <li><router-link to="/" class="nav-link">首页</router-link></li>
        <li class="dropdown-wrapper">
          <router-link to="/forum" class="nav-link">
            论坛
            <el-icon class="nav-arrow"><ArrowDown /></el-icon>
          </router-link>
          <div class="navbar-dropdown-menu">
            <router-link to="/forum/timeline">时间轴</router-link>
            <span class="dropdown-link" @click="checkAuthAndGoNew">新增帖子</span>
          </div>
        </li>
        <li class="dropdown-wrapper">
          <span class="nav-link dropdown-trigger">
            互动
            <el-icon class="nav-arrow"><ArrowDown /></el-icon>
          </span>
          <div class="navbar-dropdown-menu">
            <router-link to="/tools">在线工具</router-link>
            <router-link to="/websites">网站推荐</router-link>
            <router-link to="/games">从夯到拉排行</router-link>
          </div>
        </li>

        <li><router-link to="/message" class="nav-link">留言板</router-link></li>
        <li><router-link to="/album" class="nav-link">相册</router-link></li>
      </ul>
      <div class="navbar-actions">
        <div v-if="userStore.isLoggedIn && userStore.userInfo" class="user-menu">
          <el-dropdown @command="handleUserCommand">
            <div class="user-avatar-wrapper">
              <img 
                :src="userStore.userInfo.avatar || defaultAvatar" 
                class="user-avatar" 
                alt="用户头像" 
              />
              <span class="user-name">{{ userStore.userInfo.account }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <div class="dropdown-divider"></div>
                <el-dropdown-item command="logout" style="color: #ff6b6b;">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <router-link v-else to="/login" class="login-link">
          <el-button type="primary" size="small">登录</el-button>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { ArrowDown } from "@element-plus/icons-vue";
import SiteName from "./SiteName.vue";
import constant from "@/utils/constant";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const router = useRouter();
const defaultAvatar = constant.defaultAvatar || "https://free.picui.cn/free/2026/05/18/6a09f45278bc4.jpg";
const showToast = inject('showToast') as (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;

const checkAuthAndGoNew = () => {
  if (!userStore.isLoggedIn) {
    showToast('请先登录后再发帖', 'error');
    return;
  }
  router.push('/forum/new');
};

const handleUserCommand = (command: string) => {
  switch (command) {
    case "profile":
      showToast("个人中心功能开发中", 'info');
      break;
    case "settings":
      showToast("设置功能开发中", 'info');
      break;
    case "logout":
      userStore.logout();
      showToast("已退出登录", 'success');
      break;
  }
};

onMounted(() => {
  userStore.loadUserInfo();
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  font-family: var(--font-family) !important;
}

.navbar-container {
  width: 100%;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  border-bottom: none;
  border-radius: 0 0 20px 20px;
  transition: all 0.3s ease;
}

.navbar-container:hover {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

@media (min-width: 1200px) {
  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.navbar-brand a {
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.navbar-menu > li {
  display: flex;
  align-items: center;
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: white;
  font-size: 1em;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 80px;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #c0392b;
  border-radius: 1px;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.navbar-container:hover .nav-link {
  color: white;
  border-color: rgba(192, 57, 43, 0.3);
}

.nav-link:hover {
  color: #c0392b !important;
  background: rgba(192, 57, 43, 0.1);
  border-color: rgba(192, 57, 43, 0.4);
}

.nav-link:hover::after {
  width: 60%;
}

/* 当前选中项加外边框 */
.nav-link.router-link-exact-active {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c !important;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
}

.nav-link.router-link-exact-active::after {
  width: 60%;
}

.nav-arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
}

.dropdown-wrapper:hover .nav-arrow {
  transform: rotate(180deg);
}

.dropdown-wrapper {
  position: relative;
  padding-bottom: 10px;
  margin-bottom: -10px;
}

/* 隐形桥梁：填满导航项和下拉菜单之间的空隙 */
.dropdown-wrapper::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 20px;
  z-index: 9998;
  pointer-events: none;
}

.dropdown-wrapper:hover::before {
  pointer-events: auto;
}

.navbar-dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(-10px) scale(0.95);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  padding: 6px;
  min-width: 150px;
  z-index: 9999;
  border: 1px solid rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  transform-origin: top center;
}

.dropdown-wrapper:hover .navbar-dropdown-menu {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  pointer-events: auto;
}

.navbar-dropdown-menu a,
.navbar-dropdown-menu .dropdown-link {
  display: block;
  padding: 11px 18px;
  margin-bottom: 4px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.navbar-dropdown-menu a:hover,
.navbar-dropdown-menu .dropdown-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.25);
}

.navbar-dropdown-menu a.router-link-exact-active,
.navbar-dropdown-menu .dropdown-link.router-link-exact-active {
  border-color: rgba(231, 76, 60, 0.5);
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.navbar-dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 8px 0;
}

.navbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.navbar-actions a {
  text-decoration: none;
}

.user-menu {
  position: relative;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navbar-container:hover .user-avatar-wrapper {
  background: rgba(192, 57, 43, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.navbar-container:hover .user-name {
  color: white;
}

.dropdown-icon {
  color: white;
  font-size: 14px;
}

.login-link .el-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  border: none;
  color: white;
}

@media (max-width: 768px) {
  .navbar-menu {
    gap: 5px;
  }
  .navbar-brand a {
    font-size: 1.2em;
  }
  .nav-link {
    padding: 8px 12px;
    font-size: 0.9em;
  }
  .user-name {
    display: none;
  }
}
</style>