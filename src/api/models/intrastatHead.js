import request from '@/utils/request'

// 查询欧盟内部货物贸易的统计申报列表
export function listIntrastatHead(query) {
  return request({
    url: '/models/intrastatHead/list',
    method: 'get',
    params: query
  })
}

// 查询欧盟内部货物贸易的统计申报详细
export function getIntrastatHead(headId) {
  return request({
    url: '/models/intrastatHead/' + headId,
    method: 'get'
  })
}

// 新增欧盟内部货物贸易的统计申报
export function addIntrastatHead(data) {
  return request({
    url: '/models/intrastatHead',
    method: 'post',
    data: data
  })
}

// 修改欧盟内部货物贸易的统计申报
export function updateIntrastatHead(data) {
  return request({
    url: '/models/intrastatHead',
    method: 'put',
    data: data
  })
}

// 删除欧盟内部货物贸易的统计申报
export function delIntrastatHead(headId) {
  return request({
    url: '/models/intrastatHead/' + headId,
    method: 'delete'
  })
}


// 导出明细text模版数据
export function exportIntrastatDetailText(id) {
  return request({
    url: '/models/intrastatHead/exportIntrastatDetailText/' + id,
    method: 'get',
    responseType: 'blob',
    timeout: 20000 // 20s超时
  })
}