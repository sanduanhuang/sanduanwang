import { notifyError } from "@/utils/notify";
import common from "@/utils/common";
import type { ApiWrapperOptions } from "@/types";

interface EmptyResponseError extends Error {
  isEmptyResponse: boolean;
}

export default async function apiWrapper<T>(
  requestFn: () => Promise<T>,
  errorMessage = "请求失败！",
  options: ApiWrapperOptions = {}
): Promise<T> {
  const { allowEmpty = false, silent = false } = options;

  try {
    const response = await requestFn();

    if (!allowEmpty && common.isEmpty(response)) {
      const emptyError = new Error("响应数据为空") as EmptyResponseError;
      emptyError.isEmptyResponse = true;
      throw emptyError;
    }

    return response;
  } catch (error) {
    if ((error as EmptyResponseError).isEmptyResponse) {
      throw error;
    }

    if (!silent) {
      const backendMsg = (error as Error).message;
      const displayMsg = backendMsg && backendMsg !== "请求失败" ? backendMsg : errorMessage;
      notifyError(displayMsg);
    }
    throw error;
  }
}

export async function apiWrapperAllowEmpty<T>(
  requestFn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  return apiWrapper(requestFn, errorMessage, { allowEmpty: true });
}