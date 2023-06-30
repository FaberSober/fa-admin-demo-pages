import { GATE_APP } from '@/configs';
import { BaseTreeApi } from '@fa/ui';
import { Dm } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
const serviceModule = 'tree';

class Api extends BaseTreeApi<Dm.Tree, number> {}

export default new Api(GATE_APP.demo, serviceModule);
