/** 1 状态： 启用禁用 */
export const StatusEnum = {
  // 正常
  ENABLE: 0,
  // 禁用
  DISABLE: 1
}

// 防抖时间
export const DebounceTime = 300

// 关键字长度
export const KeywordLength = 2


export const MaxLengthEnum = {
  // 编号长度
  noLength: 30,
  // 名称长度
  nameLength: 100,
  // 地址长度
  addressLength: 200,
  // 电话长度
  phoneLength: 20,
  // 邮箱长度
  emailLength: 100,
  // 备注长度
  remark: 200,
  // 密码长度
  passwordLength: 50,
  // 查询最大条数
  maxQuerySize: 200
}
