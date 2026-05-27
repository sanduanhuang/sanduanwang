import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { checkAdmin } from "@/api/user";

export interface UserInfo {
  account: string;
  password: string;
  uniqueId: string;
  avatar?: string;
}

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfo | null>(null);
  const adminChecked = ref(false);

  const isLoggedIn = computed(() => userInfo.value !== null);

  const isAdmin = computed(() => {
    if (!userInfo.value) return false;
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.admin === true || parsed.admin === 1;
      } catch {
        return false;
      }
    }
    return false;
  });

  const loadUserInfo = () => {
    try {
      const saved = localStorage.getItem("userInfo");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.loggedIn) {
          userInfo.value = {
            account: parsed.account,
            password: parsed.password,
            uniqueId: parsed.uniqueId,
            avatar: parsed.avatar,
          };
        }
      }
    } catch (e) {
      console.error("加载用户信息失败", e);
      userInfo.value = null;
    }
  };

  const refreshAdminStatus = async () => {
    if (!userInfo.value) return false;
    try {
      const result = await checkAdmin({
        account: userInfo.value.account,
        password: userInfo.value.password,
      });
      const admin = result.isAdmin === true || result.isAdmin === 1;
      const saved = localStorage.getItem("userInfo");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.admin = admin;
        localStorage.setItem("userInfo", JSON.stringify(parsed));
      }
      adminChecked.value = true;
      return admin;
    } catch {
      adminChecked.value = true;
      return false;
    }
  };

  const login = (info: UserInfo) => {
    userInfo.value = info;
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        ...info,
        loggedIn: true,
      })
    );
  };

  const logout = () => {
    userInfo.value = null;
    localStorage.removeItem("userInfo");
  };

  const updateAvatar = (avatar: string) => {
    if (userInfo.value) {
      userInfo.value.avatar = avatar;
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...userInfo.value,
          loggedIn: true,
        })
      );
    }
  };

  return {
    userInfo,
    isLoggedIn,
    isAdmin,
    adminChecked,
    loadUserInfo,
    refreshAdminStatus,
    login,
    logout,
    updateAvatar,
  };
});