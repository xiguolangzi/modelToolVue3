import request from '@/utils/request'

// 查询国家配置列表
export function listConfigAddressCountry(query) {
  return request({
    url: '/models/configAddressCountry/list',
    method: 'get',
    params: query
  })
}

// 查询国家配置详细
export function getConfigAddressCountry(countryId) {
  return request({
    url: '/models/configAddressCountry/' + countryId,
    method: 'get'
  })
}

// 新增国家配置
export function addConfigAddressCountry(data) {
  return request({
    url: '/models/configAddressCountry',
    method: 'post',
    data: data
  })
}

// 修改国家配置
export function updateConfigAddressCountry(data) {
  return request({
    url: '/models/configAddressCountry',
    method: 'put',
    data: data
  })
}

// 删除国家配置
export function delConfigAddressCountry(countryId) {
  return request({
    url: '/models/configAddressCountry/' + countryId,
    method: 'delete'
  })
}
