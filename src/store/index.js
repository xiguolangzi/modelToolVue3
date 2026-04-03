// 独立封装 pinia
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate';

// 创建 pinia 实例
const pinia = createPinia()
// 注册 持久化插件
pinia.use(persist)

// 导出 pinia
export default pinia