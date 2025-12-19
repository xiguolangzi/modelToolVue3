import request from '@/utils/request'

// 查询申报人档案列表
export function listConfigDeclarante(query) {
  return request({
    url: '/models/configDeclarante/list',
    method: 'get',
    params: query
  })
}

// 查询申报人档案详细
export function getConfigDeclarante(declaracionId) {
  return request({
    url: '/models/configDeclarante/' + declaracionId,
    method: 'get'
  })
}

// 新增申报人档案
export function addConfigDeclarante(data) {
  return request({
    url: '/models/configDeclarante',
    method: 'post',
    data: data
  })
}

// 修改申报人档案
export function updateConfigDeclarante(data) {
  return request({
    url: '/models/configDeclarante',
    method: 'put',
    data: data
  })
}

// 删除申报人档案
export function delConfigDeclarante(declaracionId) {
  return request({
    url: '/models/configDeclarante/' + declaracionId,
    method: 'delete'
  })
}

// 申报人下拉菜单
export function selectDeclarantes() {
  return request({
    url: '/models/configDeclarante/selectDeclarantes',
    method: 'get'
  })
}
