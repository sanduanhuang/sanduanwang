<template>
  <footer class="footer" @mouseenter="showFullFooter = true" @mouseleave="showFullFooter = false">
    <!-- 始终显示的底部信息 -->
    <div class="footer-main">
      <p class="copyright">&copy; {{ new Date().getFullYear() }} <SiteName />. 保留所有权利。</p>
    </div>
    
    <!-- 悬停时展开的详细内容 -->
    <div class="footer-expand" :class="{ show: showFullFooter }">
      <div class="footer-content">
        <div class="footer-section">
          <h3><SiteName /></h3>
          <p>记录生活，分享精彩</p>
        </div>
        <div class="footer-section">
          <h4>快速链接</h4>
          <div class="quick-links">
            <a href="/">首页</a>
            <a href="/about">关于</a>
            <a href="/contact">联系</a>
          </div>
        </div>
        <div class="footer-section">
          <h4>联系方式</h4>
          <p v-if="bossEmail">Email: {{ bossEmail }}</p>
          <p v-if="qqNumber">QQ: {{ qqNumber }}</p>
          <p v-if="wechatId">微信: {{ wechatId }}</p>
          <p v-else>微信: 暂未提供</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SiteName from './SiteName.vue';
import constant from '@/utils/constant';

const bossEmail = constant.bossEmail || "";
const qqNumber = constant.qqNumber || "";
const wechatId = constant.wechatId || "";

const showFullFooter = ref(false);
</script>

<style scoped>
.footer {
  display: none;
}

/* 始终显示的底部信息 */
.footer-main {
  padding: 6px 20px;
  text-align: center;
}

.footer-main .copyright {
  margin: 0;
  font-size: 14px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 悬停时展开的内容 */
.footer-expand {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.footer-expand.show {
  max-height: 150px;
}

.footer-content {
  display: flex;
  justify-content: space-around;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-section {
  flex: 1;
  text-align: center;
  padding: 0 15px;
}

.footer-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.footer-section h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.footer-section p {
  margin: 4px 0;
  color: #ffffff;
  font-size: 14px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.quick-links a {
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.quick-links a:hover {
  color: #fff;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-section {
    padding: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
  }
  
  .footer-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}
</style>