import type { ApiResponse, PROBLEM_CODE } from "apisauce";
import type { AxiosRequestConfig } from "axios";

import type { MetaResponse } from "./api-types";

export type { ApiResponse } from "apisauce";

export interface ApiError<U> {
  message: string | undefined;
  value?: PROBLEM_CODE;
  code?: number;
  data?: U;
}

export const defaultResultConverter = <T>(data: MetaResponse<T>): T => data.data;

export const createApiCall =
  <Params, Result, ConvertedResult = Result, ErrorResult = Result>(
    apiCall: <T, E>(url: string, params?: Params, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<T, E>>,
    url: string,
    convertResult: (data: MetaResponse<Result>) => ConvertedResult
  ): ((params?: Params, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<ConvertedResult, ErrorResult>>) =>
  async (params, axiosConfig) => {
    const res = await apiCall<MetaResponse<Result>, ErrorResult>(url, params, axiosConfig);
    const convertedRes = res.ok
      ? {
          ...res,
          data: res.data ? convertResult(res.data) : undefined,
        }
      : res;
    return convertedRes;
  };
export type HandleErrorFn = <E, F = E>(
  response: ApiResponse<E, F>,
  options?: HandleApiOptions<E, F>
) => HandleApiResult<E, F>;
export type HandleErrorFnOptions<T, U = T> = HandleApiOptions<T, U>;
export const createApiCallWithHandleError =
  <Params, Result, PathParams = undefined, ConvertedResult = Result, ErrorResult = Result>(
    apiCall: <T, E>(url: string, params?: Params, axiosConfig?: AxiosRequestConfig) => Promise<ApiResponse<T, E>>,
    url: string | ((pathParams: PathParams | undefined) => string),
    convertResult: (data: MetaResponse<Result>) => ConvertedResult,
    handleErrorFn: <E, F>(response: ApiResponse<E, F>, options?: HandleApiOptions<E, F>) => HandleApiResult<E, F>
  ): ((
    params?: Params,
    showToast?: boolean,
    config?: {
      pathParams?: PathParams;
      axiosConfig?: AxiosRequestConfig;
      options?: HandleApiOptions<ConvertedResult, ErrorResult>;
    }
  ) => Promise<HandleApiResult<ConvertedResult, ErrorResult>>) =>
  async (params, showToast, config) => {
    const { pathParams, axiosConfig, options } = config || {};
    const res = await apiCall<MetaResponse<Result>, ErrorResult>(
      typeof url === "string" ? url : url(pathParams),
      params,
      axiosConfig
    );
    const convertedRes = res.ok
      ? {
          ...res,
          data: res.data ? convertResult(res.data) : undefined,
        }
      : res;
    return handleErrorFn(convertedRes, { showToast, ...options });
  };

export interface ApiResponseErrorData {
  error: {
    message: string;
    code: string;
  };
}

export interface HandleApiResult<T, U> {
  result: T | undefined;
  error: ApiError<U> | undefined;
}

export interface HandleApiOptions<T, U> {
  toastHelper?: {
    error: (message: string) => void;
  };
  showToast?: boolean;
  unauthorizedCB?: (response: ApiResponse<T, U>) => void;
  forbiddenCB?: (response: ApiResponse<T, U>) => void;
}

export const handleApiError = <T, U>(
  response: ApiResponse<T, U>,
  options?: HandleApiOptions<T, U>
): HandleApiResult<T, U> => {
  const { toastHelper, showToast, unauthorizedCB, forbiddenCB } = options || {};
  let error: ApiError<U> | undefined;
  let result;
  const { ok, data, status, problem } = response;
  if (ok) {
    if (status === 200 || status === 201) {
      result = data;
    } else {
      error = {
        message: `Response ok with status not 200 or 201. (${status})`,
      };
    }
  } else {
    const { error: errorData } = (data || {}) as ApiResponseErrorData;
    const { message } = errorData || {};

    if (status === 401) {
      unauthorizedCB?.(response);
    } else if (status === 403) {
      forbiddenCB?.(response);
    } else if (showToast) toastHelper?.error(message || "");

    error = {
      message,
      value: problem,
      code: status,
      data,
    };
  }
  return { result, error };
};
