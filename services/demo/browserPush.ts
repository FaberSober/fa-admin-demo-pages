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

class BrowserPushApi extends BaseZeroApi {
  vapidPublicKey = (): Promise<Fa.Ret<BrowserPushVapidPublicKey>> => this.post('vapidPublicKey', {});

  subscriptionStatus = (endpoint: string): Promise<Fa.Ret<BrowserPushSubscriptionStatus>> => this.post('subscription/status', { endpoint });

  registerSubscription = (subscription: BrowserPushSubscriptionPayload): Promise<Fa.Ret<void>> => this.post('subscription/register', subscription);

  unregisterSubscription = (endpoint: string): Promise<Fa.Ret<void>> => this.post('subscription/unregister', { endpoint });
}

export default new BrowserPushApi(GATE_APP.pushAdmin, 'webPush');
