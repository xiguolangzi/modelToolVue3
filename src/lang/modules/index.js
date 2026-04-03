// src/lang/modules/index.js

import common from './common.js';
import system from './system.js';
import user from './user.js';

// 合并所有模块
function mergeModules(modules) {
  const languages = ['zh-CN', 'en-US', 'es-ES']
  const result = {}

  languages.forEach(lang => {
    result[lang] = {}
    modules.forEach(module => {
      if (module[lang]) {
        // 深度合并模块
        Object.keys(module[lang]).forEach(key => {
          result[lang][key] = {
            ...result[lang][key],
            ...module[lang][key]
          }
        })
      }
    })
  })

  return result
}

const allModules = [system, common, user]
const messages = mergeModules(allModules)

export default messages