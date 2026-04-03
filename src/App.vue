<template>
  <!-- element-plus 国际化组件处理 -->
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';

// 国际化处理
import { useLanguageStore } from '@/store/modules/language';
import { elementLocales } from '@/lang/element-plus-i18n';
import { useI18n } from 'vue-i18n';
import { getLocaleConfig } from '@/lang/languageMap';
import { computed } from 'vue';

// 国际化
const languageStore = useLanguageStore()
const {locale} = useI18n()
// 计算有效的语言代码
const effectiveLang = computed(() => {
  const storeLang = languageStore.language
  return getLocaleConfig(storeLang)
})

// 计算 Element Plus 的 locale
const elementLocale = computed(() => {
  return elementLocales[effectiveLang.value] || elementLocales['zh']
})




onMounted(() => {
  locale.value = effectiveLang.value
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
