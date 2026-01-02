/**
 * YYC³餐饮行业智能化平台 - HTTP状态码
 * @description 统一的HTTP状态码定义
 * @author YYC³
 * @version 1.0.0
 */

export const HTTPStatus = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  UNUSED: 306,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511
} as const

export type HTTPStatusCode = typeof HTTPStatus[keyof typeof HTTPStatus]

/**
 * 状态码分类
 */
export const HTTPStatusClass = {
  INFORMATIONAL: '1xx',
  SUCCESS: '2xx',
  REDIRECTION: '3xx',
  CLIENT_ERROR: '4xx',
  SERVER_ERROR: '5xx'
} as const

/**
 * 状态码描述
 */
export const HTTPStatusMessages: Record<HTTPStatusCode, string> = {
  [HTTPStatus.CONTINUE]: 'Continue',
  [HTTPStatus.SWITCHING_PROTOCOLS]: 'Switching Protocols',
  [HTTPStatus.PROCESSING]: 'Processing',
  [HTTPStatus.EARLY_HINTS]: 'Early Hints',

  [HTTPStatus.OK]: 'OK',
  [HTTPStatus.CREATED]: 'Created',
  [HTTPStatus.ACCEPTED]: 'Accepted',
  [HTTPStatus.NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
  [HTTPStatus.NO_CONTENT]: 'No Content',
  [HTTPStatus.RESET_CONTENT]: 'Reset Content',
  [HTTPStatus.PARTIAL_CONTENT]: 'Partial Content',
  [HTTPStatus.MULTI_STATUS]: 'Multi-Status',
  [HTTPStatus.ALREADY_REPORTED]: 'Already Reported',
  [HTTPStatus.IM_USED]: 'IM Used',

  [HTTPStatus.MULTIPLE_CHOICES]: 'Multiple Choices',
  [HTTPStatus.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HTTPStatus.FOUND]: 'Found',
  [HTTPStatus.SEE_OTHER]: 'See Other',
  [HTTPStatus.NOT_MODIFIED]: 'Not Modified',
  [HTTPStatus.USE_PROXY]: 'Use Proxy',
  [HTTPStatus.UNUSED]: 'Unused',
  [HTTPStatus.TEMPORARY_REDIRECT]: 'Temporary Redirect',
  [HTTPStatus.PERMANENT_REDIRECT]: 'Permanent Redirect',

  [HTTPStatus.BAD_REQUEST]: 'Bad Request',
  [HTTPStatus.UNAUTHORIZED]: 'Unauthorized',
  [HTTPStatus.PAYMENT_REQUIRED]: 'Payment Required',
  [HTTPStatus.FORBIDDEN]: 'Forbidden',
  [HTTPStatus.NOT_FOUND]: 'Not Found',
  [HTTPStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HTTPStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
  [HTTPStatus.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
  [HTTPStatus.REQUEST_TIMEOUT]: 'Request Timeout',
  [HTTPStatus.CONFLICT]: 'Conflict',
  [HTTPStatus.GONE]: 'Gone',
  [HTTPStatus.LENGTH_REQUIRED]: 'Length Required',
  [HTTPStatus.PRECONDITION_FAILED]: 'Precondition Failed',
  [HTTPStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
  [HTTPStatus.URI_TOO_LONG]: 'URI Too Long',
  [HTTPStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HTTPStatus.RANGE_NOT_SATISFIABLE]: 'Range Not Satisfiable',
  [HTTPStatus.EXPECTATION_FAILED]: 'Expectation Failed',
  [HTTPStatus.IM_A_TEAPOT]: "I'm a teapot",
  [HTTPStatus.MISDIRECTED_REQUEST]: 'Misdirected Request',
  [HTTPStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HTTPStatus.LOCKED]: 'Locked',
  [HTTPStatus.FAILED_DEPENDENCY]: 'Failed Dependency',
  [HTTPStatus.TOO_EARLY]: 'Too Early',
  [HTTPStatus.UPGRADE_REQUIRED]: 'Upgrade Required',
  [HTTPStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
  [HTTPStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTPStatus.REQUEST_HEADER_FIELDS_TOO_LARGE]: 'Request Header Fields Too Large',
  [HTTPStatus.UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',

  [HTTPStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTPStatus.NOT_IMPLEMENTED]: 'Not Implemented',
  [HTTPStatus.BAD_GATEWAY]: 'Bad Gateway',
  [HTTPStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HTTPStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  [HTTPStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
  [HTTPStatus.VARIANT_ALSO_NEGOTIATES]: 'Variant Also Negotiates',
  [HTTPStatus.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
  [HTTPStatus.LOOP_DETECTED]: 'Loop Detected',
  [HTTPStatus.NOT_EXTENDED]: 'Not Extended',
  [HTTPStatus.NETWORK_AUTHENTICATION_REQUIRED]: 'Network Authentication Required'
}

/**
 * 工具函数
 */
export const HTTPStatusUtils = {
  /**
   * 获取状态码分类
   */
  getClass(statusCode: HTTPStatusCode): string {
    const firstDigit = Math.floor(statusCode / 100)
    return `${firstDigit}xx`
  },

  /**
   * 是否为成功状态码
   */
  isSuccess(statusCode: HTTPStatusCode): boolean {
    return statusCode >= 200 && statusCode < 300
  },

  /**
   * 是否为客户端错误
   */
  isClientError(statusCode: HTTPStatusCode): boolean {
    return statusCode >= 400 && statusCode < 500
  },

  /**
   * 是否为服务器错误
   */
  isServerError(statusCode: HTTPStatusCode): boolean {
    return statusCode >= 500
  },

  /**
   * 是否为错误状态码
   */
  isError(statusCode: HTTPStatusCode): boolean {
    return statusCode >= 400
  },

  /**
   * 是否为重定向状态码
   */
  isRedirect(statusCode: HTTPStatusCode): boolean {
    return statusCode >= 300 && statusCode < 400
  },

  /**
   * 获取状态码描述
   */
  getMessage(statusCode: HTTPStatusCode): string {
    return HTTPStatusMessages[statusCode] || 'Unknown Status'
  },

  /**
   * 常用状态码快捷方式
   */
  common: {
    OK: HTTPStatus.OK,
    CREATED: HTTPStatus.CREATED,
    NO_CONTENT: HTTPStatus.NO_CONTENT,
    BAD_REQUEST: HTTPStatus.BAD_REQUEST,
    UNAUTHORIZED: HTTPStatus.UNAUTHORIZED,
    FORBIDDEN: HTTPStatus.FORBIDDEN,
    NOT_FOUND: HTTPStatus.NOT_FOUND,
    CONFLICT: HTTPStatus.CONFLICT,
    UNPROCESSABLE_ENTITY: HTTPStatus.UNPROCESSABLE_ENTITY,
    TOO_MANY_REQUESTS: HTTPStatus.TOO_MANY_REQUESTS,
    INTERNAL_SERVER_ERROR: HTTPStatus.INTERNAL_SERVER_ERROR,
    BAD_GATEWAY: HTTPStatus.BAD_GATEWAY,
    SERVICE_UNAVAILABLE: HTTPStatus.SERVICE_UNAVAILABLE
  } as const
}