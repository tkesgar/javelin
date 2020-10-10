import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export enum ApiStatus {
  Success = "success",
  Fail = "fail",
  Error = "error",
}

export interface ApiResponseBody<T = unknown> {
  status: ApiStatus;
  data?: T;
}

export interface ApiSuccessBody<T = unknown> extends ApiResponseBody<T> {
  status: ApiStatus.Success;
}

export interface ApiErrorBody<T = unknown> extends ApiResponseBody<T> {
  status: ApiStatus.Fail | ApiStatus.Error;
  message: string;
  code: string;
}

interface ApiErrorConstructorOpts<T = unknown> {
  message: string;
  status: ApiStatus.Fail | ApiStatus.Error;
  code: string;
  statusCode: number;
  data?: T;
}

export class ApiError<T = unknown> extends Error {
  readonly status: ApiStatus.Fail | ApiStatus.Error;
  readonly code: string;
  readonly statusCode: number;
  readonly data: T;

  constructor(opts: ApiErrorConstructorOpts<T>) {
    const { message, status, code, statusCode, data = null } = opts;

    super(message);

    this.code = code;
    this.status = status;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function handleApiResponse<T = null, U = null>(
  response: AxiosResponse<ApiResponseBody>
): T {
  const { status } = response.data;

  switch (status) {
    case ApiStatus.Success: {
      const { data } = response.data as ApiSuccessBody<T>;
      return data;
    }
    case "fail":
    case "error": {
      const { message, code, data } = response.data as ApiErrorBody<U>;
      throw new ApiError<U>({
        message,
        status,
        code,
        statusCode: response.status,
        data,
      });
    }
    default:
      throw new Error(`Unknown API status: ${response.status}`);
  }
}

export const apiHost = process.env.NEXT_PUBLIC_API_BASE_URL;

export const client = axios.create({
  baseURL: apiHost,
});

export default async function api<T = null, U = null>(
  url: string,
  config: Partial<AxiosRequestConfig> = {}
): Promise<T> {
  const response = await client.request<ApiResponseBody>({
    url,
    responseType: "json",
    validateStatus: null,
    xsrfCookieName: "csrf-token",
    xsrfHeaderName: "X-CSRF-Token",
    withCredentials: true,
    ...config,
  });

  if (response.status === 204) {
    return null;
  }

  return handleApiResponse<T, U>(response);
}
