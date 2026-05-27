/**
 * Cloudflare Pages Functions - API 反向代理
 *
 * 将所有 /api/* 请求转发到上游服务器（如 cpolar 内网穿透地址）。
 * 上游地址通过环境变量 API_UPSTREAM 配置，可在 Cloudflare Dashboard 中随时修改，无需重新部署。
 *
 * 使用方式：
 *   1. 在 Cloudflare Pages 项目设置中添加环境变量 API_UPSTREAM
 *   2. 值为后端服务器地址，例如：https://27d0fbef.r8.cpolar.top
 *   3. 前端请求 /api/user/login 会自动代理到 https://xxx.cpolar.top/api/user/login
 */

export async function onRequest(context: {
  request: Request;
  env: { API_UPSTREAM?: string };
  params: { path?: string };
}): Promise<Response> {
  const { request, env } = context;

  const upstream = env.API_UPSTREAM;
  if (!upstream) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "服务器配置错误：未设置 API_UPSTREAM 环境变量",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const url = new URL(request.url);
  const targetUrl = `${upstream}${url.pathname}${url.search}`;

  // 构建代理请求头 - 移除可能导致问题的头部
  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
    });

    // 构建响应头
    const responseHeaders = new Headers(response.headers);
    // 移除会导致 CORS 问题的头部
    responseHeaders.delete("access-control-allow-origin");
    // 允许前端跨域访问（虽然同域不需要，但保留以防万一）
    responseHeaders.set("access-control-allow-origin", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `代理请求失败：无法连接到上游服务器`,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
