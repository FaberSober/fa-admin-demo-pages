import { GATE_APP } from '@/configs';
import { BaseZeroApi } from '@fa/ui';
import type { Fa } from '@fa/ui';
import type { PushTest } from '@/types';

class PushTestApi extends BaseZeroApi {
  page = (params: Fa.BasePageQuery<PushTest.DeviceQuery>): Promise<Fa.Ret<Fa.Page<PushTest.Device>>> =>
    this.post('page', params);

  sendTest = (params: PushTest.SendRequest): Promise<Fa.Ret<PushTest.Run>> =>
    this.post('test/send', params);

  testStatus = (testId: string): Promise<Fa.Ret<PushTest.Run>> =>
    this.post('test/status', { testId });
}

export default new PushTestApi(GATE_APP.pushAdmin, 'pushDevice');
