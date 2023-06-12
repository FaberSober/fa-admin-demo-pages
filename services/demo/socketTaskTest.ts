import { GATE_APP } from '@/configs';
import { BaseZeroApi } from '@fa/ui';
import { Fa } from '@fa/ui';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class AuthTestApi extends BaseZeroApi {
  /** 开启任务 */
  start = (): Promise<Fa.Ret<Fa.SocketTaskVo>> => this.get('start');
}

export default new AuthTestApi(GATE_APP.demo, 'socketTaskTest');
