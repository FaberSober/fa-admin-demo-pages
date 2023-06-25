import { GATE_APP } from '@/configs';
import { BaseTreeApi } from '@fa/ui';
import { Demo } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
const serviceModule = 'tree';

class Api extends BaseTreeApi<Demo.Tree, string> {}

export default new Api(GATE_APP.demo, serviceModule);
