import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';

export interface ProxyConfig {
  originalUrl: string;
  httpMethod: string;
  customAuthHeaders?: Record<string, string> | null;
}

/**
 * Forwards a request to the original API endpoint
 */
export async function forwardRequest(req: Request, config: ProxyConfig): Promise<AxiosResponse> {
  const { originalUrl, httpMethod, customAuthHeaders } = config;

  const url = new URL(originalUrl);
  Object.keys(req.query).forEach((key) => {
    url.searchParams.append(key, req.query[key] as string);
  });

  const headers: Record<string, string> = {
    ...(req.headers as any),
    host: url.host,
    'x-forwarded-for': req.ip || req.socket.remoteAddress || '',
    'x-forwarded-proto': req.protocol,
  };

  delete headers['content-length'];
  delete headers['connection'];
  delete headers['host'];

  if (customAuthHeaders) Object.assign(headers, customAuthHeaders);

  delete headers['accept-encoding'];

  const axiosConfig: AxiosRequestConfig = {
    method: httpMethod,
    url: url.toString(),
    headers,
    data: req.body,
    validateStatus: () => true, // Don't throw on any status code
    timeout: 30_000,
    decompress: true,
  };

  try {
    return await axios(axiosConfig);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        JSON.stringify({
          status: error.response?.status || 502,
          message: error.message,
          data: error.response?.data || { error: 'Proxy request failed' },
        }),
      );
    }
    throw new Error(
      JSON.stringify({
        status: 502,
        message: 'Unknown error occurred',
        data: { error: 'Proxy request failed' },
      }),
    );
  }
}
