/**
 * YYC³餐饮行业智能化平台 - 通用服务库入口文件
 * @module common
 * @author YYC
 * @version 1.0.0
 * @created 2024-10-15
 */

export { CommunicationService } from './services/CommunicationService';
export { EventBusService, getEventBus } from './services/EventBusService';
export { Logger, LogLevel } from './services/LoggerService';

export type {
  CommunicationServiceConfig,
  ServiceRequestConfig,
  ServiceResponse
} from './services/CommunicationService';

export type {
  EventBusConfig,
  EventBusMessage,
  EventHandler
} from './services/EventBusService';

export type {
  LoggerConfig,
  LogEntry
} from './services/LoggerService';