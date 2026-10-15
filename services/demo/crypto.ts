import type { CryptoEnvelope, CryptoPreparation, CryptoPublicKey } from '@fa/core/crypto';
import { BaseZeroApi, type Fa } from '@fa/ui';
import { GATE_APP } from '@/configs';

class CryptoSecurityApi extends BaseZeroApi {
  publicKey = (): Promise<Fa.Ret<CryptoPublicKey>> => this.get('public-key');
  prepare = (): Promise<Fa.Ret<CryptoPreparation>> => this.post('prepare', { purpose: 'CRYPTO_DEMO' });
}

class CryptoDemoApi extends BaseZeroApi {
  roundtrip = (envelope: CryptoEnvelope): Promise<Fa.Ret<{ text: string }>> => this.post('roundtrip', envelope);
}

export const cryptoSecurityApi = new CryptoSecurityApi(GATE_APP.cryptoSecurity, 'crypto');
export const cryptoDemoApi = new CryptoDemoApi(GATE_APP.demo, 'crypto');
