import type { Fa } from '@fa/ui';
import { BaseZeroApi } from '@fa/ui';
import { GATE_APP } from '@/configs';

export interface BrowserPushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface BrowserPushSubscriptionStatus {
  subscribed: boolean;
}

export interface BrowserPushVapidPublicKey {
  publicKey: string;
}

export interface BrowserPushTestSendPayload {
  title: string;
  body: string;
}

export interface BrowserPushTestSendResult {
  targetCount: number;
  acceptedCount: number;
  failedCount: number;
}

class BrowserPushApi extends BaseZeroApi {
  vapidPublicKey = (): Promise<Fa.Ret<BrowserPushVapidPublicKey>> => this.post('vapidPublicKey', {});

  subscriptionStatus = (endpoint: string): Promise<Fa.Ret<BrowserPushSubscriptionStatus>> => this.post('subscription/status', { endpoint });

  registerSubscription = (subscription: BrowserPushSubscriptionPayload): Promise<Fa.Ret<void>> => this.post('subscription/register', subscription);

  unregisterSubscription = (endpoint: string): Promise<Fa.Ret<void>> => this.post('subscription/unregister', { endpoint });

  sendTestPush = (payload: BrowserPushTestSendPayload): Promise<Fa.Ret<BrowserPushTestSendResult>> => this.post('test/send', payload);
}

export default new BrowserPushApi(GATE_APP.pushAdmin, 'webPush');
