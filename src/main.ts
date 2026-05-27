import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "./style.css";
import App from "./App.vue";
import router from "./router";
import { fetchApiConfig } from "./utils/constant";

async function initApp() {
  // 先从 Gitee 获取最新 API 地址
  await fetchApiConfig();

  const app = createApp(App);

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(createPinia());
  app.use(router);
  app.use(ElementPlus);

  app.mount("#app");
}

initApp();
