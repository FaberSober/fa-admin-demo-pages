namespace PushTest {
  export interface DeviceQuery {
    userId?: string;
    platform?: string;
    appId?: string;
    environment?: string;
    enabled?: boolean;
  }

  export interface Device {
    id: number;
    userId: string;
    username?: string;
    name?: string;
    provider: string;
    clientIdMasked?: string;
    platform: string;
    appId: string;
    environment: string;
    enabled: boolean;
    lastSeenTime?: string;
    invalidTime?: string;
    selectable: boolean;
  }

  export interface SendRequest {
    deviceIds: number[];
    title: string;
    content: string;
    forceNotification?: boolean;
    link?: string;
    extra?: Record<string, unknown>;
  }

  export interface DeviceResult {
    deviceId: number;
    status: string;
    providerStatus?: string;
    providerTaskId?: string;
    message?: string;
    updatedAt?: number;
  }

  export interface Run {
    testId: string;
    createdAt: number;
    devices: DeviceResult[];
  }

  export interface MessageForm {
    title: string;
    content: string;
    forceNotification?: boolean;
    link?: string;
    extraJson?: string;
  }
}

export default PushTest;
