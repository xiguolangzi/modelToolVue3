import request from '@/utils/request'

// 查询intrastat申报明细列表
export function listIntrastatDetail(query) {
  return request({
    url: '/models/intrastatDetail/list',
    method: 'get',
    params: query
  })
}

// 查询intrastat申报明细详细
export function getIntrastatDetail(detailId) {
  return request({
    url: '/models/intrastatDetail/' + detailId,
    method: 'get'
  })
}

// 新增intrastat申报明细
export function addIntrastatDetail(data) {
  return request({
    url: '/models/intrastatDetail',
    method: 'post',
    data: data
  })
}

// 修改intrastat申报明细
export function updateIntrastatDetail(data) {
  return request({
    url: '/models/intrastatDetail',
    method: 'put',
    data: data
  })
}

// 删除intrastat申报明细
export function delIntrastatDetail(detailId) {
  return request({
    url: '/models/intrastatDetail/' + detailId,
    method: 'delete'
  })
}
