import request from '@/utils/request'

// 查询349经营者记录明细列表
export function listModelo349OperadorIntra(query) {
  return request({
    url: '/models/modelo349OperadorIntra/list',
    method: 'get',
    params: query
  })
}

// 查询349经营者记录明细详细
export function getModelo349OperadorIntra(id) {
  return request({
    url: '/models/modelo349OperadorIntra/' + id,
    method: 'get'
  })
}

// 新增349经营者记录明细
export function addModelo349OperadorIntra(data) {
  return request({
    url: '/models/modelo349OperadorIntra',
    method: 'post',
    data: data
  })
}

// 修改349经营者记录明细
export function updateModelo349OperadorIntra(data) {
  return request({
    url: '/models/modelo349OperadorIntra',
    method: 'put',
    data: data
  })
}

// 删除349经营者记录明细
export function delModelo349OperadorIntra(id) {
  return request({
    url: '/models/modelo349OperadorIntra/' + id,
    method: 'delete'
  })
}
