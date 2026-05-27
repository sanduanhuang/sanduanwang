import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import constant from "./constant";

export interface HttpClient {
  post<T = unknown>(url: string, params?: object, json?: boolean): Promise<T>;
  get<T = unknown>(url: string, params?: object): Promise<T>;
  put<T = unknown>(url: string, params?: object): Promise<T>;
  delete<T = unknown>(url: string, params?: object): Promise<T>;
  patch<T = unknown>(url: string, params?: object): Promise<T>;
  uploadQiniu<T = unknown>(url: string, param: FormData): Promise<T>;
  postBlob<T = unknown>(url: string, params?: object): Promise<T>;
}

const http: AxiosInstance = axios.create({
  baseURL: constant.baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.error("未授权，请重新登录");
      } else if (status === 403) {
        console.error("没有权限");
      } else if (status === 404) {
        console.error("请求资源不存在");
      } else if (status >= 500) {
        console.error("服务器错误");
      }
    } else if (error.request) {
      console.error("网络错误，请检查网络连接");
    }
    return Promise.reject(error);
  }
);

const getAuthConfig = (): { headers: Record<string, string> } => {
  return {
    headers: {},
  };
};

const client: HttpClient = {
  post<T = unknown>(url: string, params: object = {}, json = true): Promise<T> {
    const config: AxiosRequestConfig = {
      ...getAuthConfig(),
    };
    if (json) {
      config.headers!["Content-Type"] = "application/json";
    } else {
      config.headers!["Content-Type"] = "multipart/form-data";
    }
    return http.post(url, params, config);
  },

  get<T = unknown>(url: string, params: object = {}): Promise<T> {
    return http.get(url, { params, ...getAuthConfig() });
  },

  put<T = unknown>(url: string, params: object = {}): Promise<T> {
    return http.put(url, params, getAuthConfig());
  },

  delete<T = unknown>(url: string, params: object = {}): Promise<T> {
    return http.delete(url, { data: params, ...getAuthConfig() });
  },

  patch<T = unknown>(url: string, params: object = {}): Promise<T> {
    return http.patch(url, params, getAuthConfig());
  },

  uploadQiniu<T = unknown>(url: string, param: FormData): Promise<T> {
    return http.post(url, param, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  postBlob<T = unknown>(url: string, params: object = {}): Promise<T> {
    return http.post(url, params, {
      ...getAuthConfig(),
      responseType: 'blob',
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default client;