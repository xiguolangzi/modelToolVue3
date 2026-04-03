import { createI18n } from "vue-i18n";
import messages from './modules/index.js';


// 为了保持现有代码兼容性，也提供同步版本
export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: messages,
})

export default i18n