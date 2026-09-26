import { GATE_APP } from '@/configs';
import { BaseZeroApi } from '@fa/ui';
import type { Fa } from '@fa/ui';
import type { PushTest } from '@/types';

class PushTestApi extends BaseZeroApi {
  // 测试发送、状态和近期记录接口直接返回 DTO，不使用 Ret.data 包装。
  private postRaw = <T>(path: string, body: object): Promise<T> =>
    this.post<T>(path, body) as unknown as Promise<T>;

  page = (params: Fa.BasePageQuery<PushTest.DeviceQuery>): Promise<Fa.Ret<Fa.Page<PushTest.Device>>> =>
    this.post('page', params);

  sendTest = (params: PushTest.SendRequest): Promise<PushTest.Run> =>
    this.postRaw('test/send', params);

  testStatus = (testId: string): Promise<PushTest.Run> =>
    this.postRaw('test/status', { testId });

  recentTests = (): Promise<PushTest.Run[]> =>
    this.postRaw('test/recent', {});
}

export default new PushTestApi(GATE_APP.pushAdmin, 'pushDevice');
