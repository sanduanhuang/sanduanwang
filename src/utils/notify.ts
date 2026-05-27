import { ElNotification } from "element-plus";

export function notifySuccess(message: string) {
  ElNotification({
    title: "成功",
    message: message,
    type: "success",
    duration: 3000,
  });
}

export function notifyError(message: string) {
  ElNotification({
    title: "错误",
    message: message,
    type: "error",
    duration: 5000,
  });
}

export function notifyWarning(message: string) {
  ElNotification({
    title: "警告",
    message: message,
    type: "warning",
    duration: 4000,
  });
}

export function notifyInfo(message: string) {
  ElNotification({
    title: "提示",
    message: message,
    type: "info",
    duration: 3000,
  });
}