// stores/language.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  // 支持的语言配置（完整配置）
  const supportedLanguages = [
    { code: 'zh-CN', shortCode: 'zh', label: '中文', javaCode: 'zh_CN' },
    { code: 'en-US', shortCode: 'en', label: 'English', javaCode: 'en_US' },
    { code: 'es-ES', shortCode: 'es', label: 'Español', javaCode: 'es_ES' }
  ]

  // 语言代码转换工具
  const normalizeLanguageCode = (code) => {
    if (!code) return 'zh-CN'

    // 简写转完整格式
    const shortToFullMap = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'es': 'es-ES',
      'zh_CN': 'zh-CN',
      'en_US': 'en-US',
      'es_ES': 'es-ES'
    }

    return shortToFullMap[code] || code
  }

  // 完整格式转简写（用于兼容旧代码）
  const toShortCode = (fullCode) => {
    const lang = supportedLanguages.find(item => item.code === fullCode)
    return lang ? lang.shortCode : 'zh'
  }

  // 初始化语言（从浏览器语言检测）
  function initLanguage() {
    // 1. 获取本地存储语言
    const storyData = localStorage.getItem('app-language')
    const localStoryLanguage = storyData ? JSON.parse(storyData).language : null

    if (localStoryLanguage) {
      return normalizeLanguageCode(localStoryLanguage)
    }

    // 2. 获取浏览器默认语言并匹配支持的语言
    const browserLang = navigator.language
    const matchedLang = supportedLanguages.find(lang =>
      browserLang.startsWith(lang.shortCode) ||
      browserLang.startsWith(lang.code)
    )

    // 3. 返回结果
    return matchedLang ? matchedLang.code : 'zh-CN'
  }

  // 当前语言（完整格式）
  const language = ref(initLanguage())

  // 计算属性：当前语言的简写格式（用于兼容旧代码）
  const shortLanguage = computed(() => toShortCode(language.value))

  // 计算属性：当前语言的完整配置
  const currentLanguageConfig = computed(() => {
    return supportedLanguages.find(lang => lang.code === language.value) || supportedLanguages[0]
  })

  // 设置语言（支持简写和完整格式）
  function setLanguage(lang) {
    const normalizedLang = normalizeLanguageCode(lang)
    const targetLang = supportedLanguages.find(item => item.code === normalizedLang)

    if (targetLang) {
      language.value = targetLang.code
      return true
    }
    return false
  }

  // 获取语言配置
  function getLanguageConfig(langCode = null) {
    const code = langCode ? normalizeLanguageCode(langCode) : language.value
    return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0]
  }

  // 获取支持的语言列表（用于下拉菜单等）
  const languageOptions = computed(() => {
    return supportedLanguages.map(lang => ({
      value: lang.code,
      label: lang.label,
      shortCode: lang.shortCode,
      javaCode: lang.javaCode
    }))
  })

  return {
    // 状态
    language,
    // 计算属性
    shortLanguage,
    currentLanguageConfig,
    languageOptions,
    // 方法
    setLanguage,
    getLanguageConfig
  }
}, {
  persist: {
    key: 'app-language',
    storage: localStorage,
    // 自定义序列化，只存储简写格式以保持兼容性
    serializer: {
      serialize: (state) => {
        const shortCode = toShortCode(state.language)
        return JSON.stringify({ language: shortCode })
      },
      deserialize: (str) => {
        try {
          const data = JSON.parse(str)
          return { language: normalizeLanguageCode(data.language) }
        } catch {
          return { language: 'zh-CN' }
        }
      }
    }
  }
})

// 工具函数（在store外部也可使用）
function normalizeLanguageCode(code) {
  const shortToFullMap = {
    'zh': 'zh-CN',
    'en': 'en-US',
    'es': 'es-ES',
    'zh_CN': 'zh-CN',
    'en_US': 'en-US',
    'es_ES': 'es-ES'
  }
  return shortToFullMap[code] || code || 'zh-CN'
}

function toShortCode(fullCode) {
  const map = {
    'zh-CN': 'zh',
    'en-US': 'en',
    'es-ES': 'es'
  }
  return map[fullCode] || 'zh'
}

export { normalizeLanguageCode, toShortCode }