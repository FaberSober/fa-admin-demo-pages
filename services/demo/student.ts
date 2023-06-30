import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { Dm } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.Student, string> {}

export default new Api(GATE_APP.demo, 'student');
