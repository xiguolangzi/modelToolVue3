import request from '@/utils/request'

// 查询大区配置列表
export function listConfigAddressCommunity(query) {
  return request({
    url: '/models/configAddressCommunity/list',
    method: 'get',
    params: query
  })
}

// 查询大区配置详细
export function getConfigAddressCommunity(communityId) {
  return request({
    url: '/models/configAddressCommunity/' + communityId,
    method: 'get'
  })
}

// 新增大区配置
export function addConfigAddressCommunity(data) {
  return request({
    url: '/models/configAddressCommunity',
    method: 'post',
    data: data
  })
}

// 修改大区配置
export function updateConfigAddressCommunity(data) {
  return request({
    url: '/models/configAddressCommunity',
    method: 'put',
    data: data
  })
}

// 删除大区配置
export function delConfigAddressCommunity(communityId) {
  return request({
    url: '/models/configAddressCommunity/' + communityId,
    method: 'delete'
  })
}
