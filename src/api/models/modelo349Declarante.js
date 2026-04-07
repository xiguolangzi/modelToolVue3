import request from '@/utils/request'
import { time } from 'echarts'

// 查询349模型申报人主列表
export function listModelo349Declarante(query) {
  return request({
    url: '/models/modelo349Declarante/list',
    method: 'get',
    params: query
  })
}

// 查询349模型申报人主详细
export function getModelo349Declarante(id) {
  return request({
    url: '/models/modelo349Declarante/' + id,
    method: 'get'
  })
}

// 新增349模型申报人主
export function addModelo349Declarante(data) {
  return request({
    url: '/models/modelo349Declarante',
    method: 'post',
    data: data,
    timeout: 20000 // 20s超时
  })
}

// 修改349模型申报人主
export function updateModelo349Declarante(data) {
  return request({
    url: '/models/modelo349Declarante',
    method: 'put',
    data: data,
    timeout: 20000 // 20s超时
  })
}

// 删除349模型申报人主
export function delModelo349Declarante(id) {
  return request({
    url: '/models/modelo349Declarante/' + id,
    method: 'delete'
  })
}

// 导出349文件
export function exportModelo349(id) {
  return request({
    url: `/models/modelo349Declarante/export/${id}`,
    method: 'get',
    responseType: 'blob',
    timeout: 20000 // 20s超时
  })
}
