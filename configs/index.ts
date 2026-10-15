import type { Fa } from "@fa/ui";

export default {
  /** -------------------------------- 网关配置 -------------------------------- */
  GATE_APP: {
    /** Demo服务 */
    demo: '/api/base/demo',
    cryptoSecurity: '/api/base/security',
    /** 推送设备管理服务 */
    pushAdmin: '/api/base/admin',
  }
} as Fa.ConfigApp
