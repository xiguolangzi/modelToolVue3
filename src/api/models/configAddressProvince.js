import request from '@/utils/request'

// 查询省份配置列表
export function listConfigAddressProvince(query) {
  return request({
    url: '/models/configAddressProvince/list',
    method: 'get',
    params: query
  })
}

export function selectAll(query) {
  return request({
    url: '/models/configAddressProvince/selectAll',
    method: 'get',
    params: query
  })
}

// 查询省份配置详细
export function getConfigAddressProvince(provinceId) {
  return request({
    url: '/models/configAddressProvince/' + provinceId,
    method: 'get'
  })
}

// 新增省份配置
export function addConfigAddressProvince(data) {
  return request({
    url: '/models/configAddressProvince',
    method: 'post',
    data: data
  })
}

// 修改省份配置
export function updateConfigAddressProvince(data) {
  return request({
    url: '/models/configAddressProvince',
    method: 'put',
    data: data
  })
}

// 删除省份配置
export function delConfigAddressProvince(provinceId) {
  return request({
    url: '/models/configAddressProvince/' + provinceId,
    method: 'delete'
  })
}
