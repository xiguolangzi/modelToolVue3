import request from '@/utils/request'

// 查询欧盟国家代码配置列表
export function listConfigPaisesUe(query) {
  return request({
    url: '/models/configPaisesUe/list',
    method: 'get',
    params: query
  })
}

// 查询欧盟国家代码配置详细
export function getConfigPaisesUe(codigoPais) {
  return request({
    url: '/models/configPaisesUe/' + codigoPais,
    method: 'get'
  })
}

// 新增欧盟国家代码配置
export function addConfigPaisesUe(data) {
  return request({
    url: '/models/configPaisesUe',
    method: 'post',
    data: data
  })
}

// 修改欧盟国家代码配置
export function updateConfigPaisesUe(data) {
  return request({
    url: '/models/configPaisesUe',
    method: 'put',
    data: data
  })
}

// 删除欧盟国家代码配置
export function delConfigPaisesUe(codigoPais) {
  return request({
    url: '/models/configPaisesUe/' + codigoPais,
    method: 'delete'
  })
}


