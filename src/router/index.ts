import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/home/index.vue"),
  },
  {
    path: "/forum",
    name: "Forum",
    component: () => import("@/views/forum/index.vue"),
  },
  {
    path: "/forum/new",
    name: "ForumNew",
    component: () => import("@/views/forum/new.vue"),
  },
  {
    path: "/forum/timeline",
    name: "ForumTimeline",
    component: () => import("@/views/forum/timeline.vue"),
  },
  {
    path: "/forum/:id",
    name: "ForumDetail",
    component: () => import("@/views/forum/detail.vue"),
  },
  {
    path: "/tools",
    name: "Tools",
    component: () => import("@/views/tool/index.vue"),
  },
  {
    path: "/websites",
    name: "Websites",
    component: () => import("@/views/website/index.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    component: () => import("@/views/upload/index.vue"),
  },
  {
    path: "/games",
    name: "Games",
    component: () => import("@/views/games/index.vue"),
  },
  {
    path: "/message",
    name: "Message",
    component: () => import("@/views/message.vue"),
  },
  {
    path: "/album",
    name: "Album",
    component: () => import("@/views/album/index.vue"),
  },

  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/admin/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;