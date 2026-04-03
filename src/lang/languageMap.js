// src/lang/languageMap.js
/**
 * 语言环境配置映射
 */
export function getLocaleConfig(locale) {
  const localeMap = {
    'en': 'en-US',    // 英语 -> 美国
    'es': 'es-ES',    // 西语 -> 西班牙
    'zh': 'zh-CN',    // 中文 -> 中国
    'en-US': 'en-US',
    'es-ES': 'es-ES',
    'zh-CN': 'zh-CN'
  };

  return localeMap[locale] || 'es-ES'; // 默认使用西班牙格式
}

/**
 * 语言环境配置币种映射
 */
export function getCurrencyConfig(locale) {
  const currencyMap = {
    'en': { locale: 'en-US', symbol: '$', currency: 'USD' },
    'es': { locale: 'es-ES', symbol: '€', currency: 'EUR' },
    'zh': { locale: 'zh-CN', symbol: '¥', currency: 'CNY' },
    'en-US': { locale: 'en-US', symbol: '$', currency: 'USD' },
    'es-ES': { locale: 'es-ES', symbol: '€', currency: 'EUR' },
    'zh-CN': { locale: 'zh-CN', symbol: '¥', currency: 'CNY' }
  }
  return currencyMap[locale] || { locale: 'es-ES', symbol: '€', currency: 'EUR' }
}

/**
 * 获取支持的语言列表
 */
export const SUPPORTED_LANGUAGES = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Español' }
]