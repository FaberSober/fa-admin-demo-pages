import type { PreparedCryptoRequest } from '@fa/core/crypto';
import { BaseZeroApi, prepareCryptoRequest, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';

class CryptoDemoApi extends BaseZeroApi {
  prepare = (text: string): Promise<PreparedCryptoRequest> =>
    prepareCryptoRequest(this.getUrl('roundtrip'), { text, age: 18 }, ['text']);

  roundtrip = (prepared: PreparedCryptoRequest): Promise<Fa.Ret<{ text: string; age: number }>> =>
    this.post('roundtrip', prepared.body, { headers: prepared.headers });
}

export const cryptoDemoApi = new CryptoDemoApi(GATE_APP.demo, 'crypto');
