<template>
  <div class="app-container">
    <el-card class="card-data"> 

      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>Intrastat申报数据详情</h2>
             <el-tag type="success">流水编号：{{ form.headId }}</el-tag>
             <dict-tag :options="intrastat_situacion" :value="form.situacion"/>
          </div>

          <div class="actions">

          </div>

          <el-button-group>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
            <el-button type="warning" @click="handleExportText" :loading="submitting">导出Intrastat申报明细模板.csv</el-button>
            <el-button type="danger" @click="goBack" :loading="submitting">退出</el-button>
          </el-button-group>

        </div>
        
      </template>

      <el-form ref="intrastatDeclaranteRef" :model="form" :rules="rules" label-width="160px" >
        <!-- Ejercicio -->
         <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申报法定税号:" prop="declarantNif">
              <el-select 
                v-model="form.declarantNif" 
                placeholder="申报法定税号" 
                style="width: 100%" 
                @change="updateDeclarante"
                filterable
              >
                <el-option
                  v-for="item in declaranteList"
                  :key="item.value"
                  :label="item.userNombre"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="申报法定名称:" prop="declarantName">
              <el-input v-model.number="form.declarantName" placeholder="请输入申报法定名称" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理法定税号:" prop="tercerDeclaranteNif">
              <el-input v-model.number="form.tercerDeclaranteNif" placeholder="请输入代理法定税号" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="代理法定名称:" prop="tercerDeclaranteName">
              <el-input v-model.number="form.tercerDeclaranteName" placeholder="请输入代理法定名称" disabled/>
            </el-form-item>
          </el-col>
         </el-row>

         <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="贸易流向:" prop="flujo">
                <el-select v-model="form.flujo" placeholder="请选择贸易流向" style="width: 100%">
                  <el-option
                    v-for="dict in intrastat_flujo"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申报类型:" prop="tipoDeclaracion">
                <el-select v-model="form.tipoDeclaracion" placeholder="请选择申报类型" style="width: 100%">
                  <el-option
                    v-for="dict in intrastat_tipo_declaracion"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="海关代码:" prop="oficina">
                <el-input v-model.trim="form.oficina" placeholder="请输入海关代码" :maxlength="30" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="货币种类:" prop="moneda">
                <el-select v-model="form.moneda" placeholder="请选择货币种类" style="width: 100%">
                  <el-option
                    v-for="dict in intrastat_moneda"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
         </el-row>

         <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="申报年份:" prop="periodoAno">
                <el-input v-model.trim="form.periodoAno" placeholder="请输入申报年份" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申报月份:" prop="periodoMes">
                <el-select v-model="form.periodoMes" placeholder="请选择申报月份" style="width: 100%">
                  <el-option
                    v-for="dict in intrastat_periodo_mes"
                    :key="dict.value"
                    :label="dict.label"
                    :value="Number(dict.value)"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申报序号:" prop="numDeclaracion">
                <el-input v-model.trim="form.numDeclaracion" placeholder="请输入申报序号" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="申报状态:" prop="situacion">
                <el-select v-model="form.situacion" placeholder="请选择申报状态" style="width: 100%">
                  <el-option
                    v-for="dict in intrastat_situacion"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
         </el-row>

         <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="定位码:" prop="localizacion">
                <el-input v-model.trim="form.localizacion" placeholder="定位码" :maxlength="30" show-word-limit/>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item label="备注:" prop="remark">
                <el-input v-model="form.remark" placeholder="备注" :maxlength="100" show-word-limit />
              </el-form-item>
            </el-col>
         </el-row>
        

        <!-- 经营者记录明细 -->
        <el-divider content-position="left">
          <span style="font-size: 16px; font-weight: bold;" >Intrastat申报明细</span>
        </el-divider>
        
        <div class="operador-toolbar">
          <div class="toolbar-left">
            <el-button type="primary" icon="Plus" @click="handleAddOperador">添加记录信息</el-button>
            <el-button type="danger" icon="Delete" @click="handleDeleteOperador" :disabled="selectedOperadores.length === 0">
              删除选中
            </el-button>
            <el-tag type="info" style="margin-left: 10px;">
              已添加 {{ totalOperadores }} 条记录
            </el-tag>
          </div>

          <div class="toolbar-right">
            
            <!-- 导入下拉菜单 -->
            <el-dropdown trigger="click" class="export-dropdown" >
              <el-button type="primary" plain icon="Upload">
                导入明细<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu >
                  <el-dropdown-item @click="importItems" :loading="submitting">
                    <el-button type="warning" link icon="Upload" >Excel导入申报明细</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 申报明细表格 -->
        <div class="operador-table-container">
          <el-table 
            :data="currentPageData"
            border
            @selection-change="handleOperadorSelectionChange"
            :row-key="getRowKey"
            style="width: 100%"
            v-loading="tableLoading"
            :max-height="tableMaxHeight"
            :highlight-current-row="true"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="明细序号" prop="numPartida" :width="80">
              <template #default="{ row }">
                <!-- 当前数值展示4位，如果不足4位，则前面补0 -->
                <div class="country-code">
                  {{ row.numPartida?.toString().padStart(4, '0') || null }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="交易国代码" prop="paisMiembro" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <AddressCountrySelect v-model="row.paisMiembro" :teleported="true" />
              </template>
            </el-table-column>
            <el-table-column label="省份代码" prop="provincia" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <AddressProvinceSelect v-model="row.provincia" :teleported="true" />
              </template>
            </el-table-column>
            <el-table-column label="交货条件" prop="condicionEntrega" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.condicionEntrega" 
                  placeholder="交货条件" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_condicion_entrega"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="交易性质" prop="naturalezaTransaccion" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.naturalezaTransaccion" 
                  placeholder="交易性质" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_naturaleza_transaccion"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="运输方式" prop="modoTransporte" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.modoTransporte" 
                  placeholder="运输方式" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_modo_transporte"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="港口机场" prop="puerto" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.puerto" 
                  placeholder="港口机场" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_puerto"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="商品编码" prop="mercancia" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row, $index }">
                <el-input 
                  v-model.trim="row.mercancia" 
                  placeholder="商品编码" 
                  @focus="handleInputFocus($index, 'mercancia')"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="原产国代码" prop="paisOrigen" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <AddressCountrySelect v-model="row.paisOrigen" :teleported="true" />
              </template>
            </el-table-column>
            <el-table-column label="统计制度" prop="regimen" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.regimen" 
                  placeholder="统计制度" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_regimen"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="货物净重" prop="masaNeta" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.masaNeta" 
                  placeholder="货物净重" 
                  :controls="false"
                  :min="0" :max="9999999999" :precision="3"
                  :value-on-clear="0"
                  style="width: 100%;"
                  size="small"
                  @focus="handleInputFocus($index, 'masaNeta')"
                >
                  <template #suffix>
                    <span>KG</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="补充单位数量" prop="unidadSuplementaria" :width="120" show-overflow-tooltip align="left">
               <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.unidadSuplementaria" 
                  placeholder="补充单位数量" 
                  :controls="false"
                  :min="0" :max="9999999999" :precision="3"
                  :value-on-clear="0"
                  style="width: 100%;"
                  size="small"
                  @focus="handleInputFocus($index, 'unidadSuplementaria')"
                />
              </template>
            </el-table-column>
            <el-table-column label="发票金额" prop="importeFactura" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.importeFactura" 
                  placeholder="补充单位数量" 
                  :controls="false"
                  :min="0" :max="9999999999" :precision="2"
                  :value-on-clear="0"
                  style="width: 100%;"
                  size="small"
                  @focus="handleInputFocus($index, 'importeFactura')"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="统计价值" prop="valorEstadistico" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.valorEstadistico" 
                  placeholder="统计价值" 
                  :controls="false"
                  :min="0" :max="9999999999" :precision="2"
                  :value-on-clear="0"
                  style="width: 100%;"
                  size="small"
                  @focus="handleInputFocus($index, 'valorEstadistico')"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="交易方税号" prop="nifIvaContraparte" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row, $index }">
                <el-input 
                  v-model.trim="row.nifIvaContraparte" 
                  placeholder="交易方税号" 
                  @focus="handleInputFocus($index, 'nifIvaContraparte')"
                  size="small"
                />
              </template>
            </el-table-column>
            <!-- 国家信息 -->
            <el-table-column label="明细状态" prop="situacion" :width="120" show-overflow-tooltip align="left">
              <template #default="{ row }">
                <el-select 
                  v-model="row.situacion" 
                  placeholder="明细状态" 
                  style="width: 100%"
                  size="small"
                >
                  <el-option
                    v-for="dict in intrastat_detail_situacion"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            

            <el-table-column label="操作" align="left" fixed="right">
              <template #default="{ $index }">
                <el-button 
                    type="danger" 
                    icon="Delete" 
                    @click.stop="handleRemoveOperador(calculateRowIndex($index) - 1)"
                    size="small"
                    circle
                  />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 底部固定分页器 -->
        <div class="fixed-pagination" v-if="intrastatDetailList.length > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100, 200, 500]"
            :total="totalOperadores"
            :layout="paginationLayout"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      
      </el-form>

    </el-card>

    <!-- 导入标准明细 -->
    <ImportItemsDialog ref="importItemsDialog" :detailList="intrastatDetailList" @changeDetail="handleChangeDetails" />


  </div>
</template>

<script setup name="EditIntrastat">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive, toRefs } from 'vue'
import {  exportIntrastatDetailText } from "@/api/models/intrastatHead";
import {  getIntrastatHead,  addIntrastatHead, updateIntrastatHead } from "@/api/models/intrastatHead";

import AddressCountrySelect from "@/components/Common/AddressCountrySelect.vue";
import AddressProvinceSelect from "@/components/Common/AddressProvinceSelect.vue"


import { listUser } from "@/api/system/user.js";
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from "vue-router"
import ImportItemsDialog from '@/views/models/intrastatHead/ImportItemsDialog.vue'

import { tableRowIdGenerator } from '@/utils/idGenerator';  // 生成序号

const router = useRouter()
const route = useRoute()

const { proxy } = getCurrentInstance()
const { intrastat_flujo, intrastat_tipo_declaracion, intrastat_detail_naturaleza_transaccion, intrastat_moneda, intrastat_detail_regimen, intrastat_detail_situacion, intrastat_periodo_mes, intrastat_situacion, intrastat_detail_condicion_entrega, intrastat_detail_puerto, intrastat_detail_modo_transporte } = proxy.useDict('intrastat_flujo', 'intrastat_tipo_declaracion', 'intrastat_detail_naturaleza_transaccion', 'intrastat_moneda', 'intrastat_detail_regimen', 'intrastat_detail_situacion', 'intrastat_periodo_mes', 'intrastat_situacion', 'intrastat_detail_condicion_entrega', 'intrastat_detail_puerto', 'intrastat_detail_modo_transporte')


// 经营者列表
const intrastatDetailList = ref([]);        // 列表数据
const selectedOperadores = ref([]);         // 选中数据
const declaranteList = ref([]);             // 申报人列表
const submitting = ref(false);              // 表单提交中
const tableLoading = ref(false);            // 表格加载中

// 导入组件
const importItemsDialog = ref(null);            // 导入弹出框1


const intrastatDeclaranteRef = ref(null); // 表单


// 分页相关
const currentPage = ref(1); // 当前页
const pageSize = ref(20);   // 每页条数

// 计算属性
const totalOperadores = computed(() => intrastatDetailList.value.length);      // 总条目数
const totalPages = computed(() => Math.ceil(totalOperadores.value / pageSize.value)); // 总页数


// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return intrastatDetailList.value.slice(start, end)
})

// 表格最大高度（动态计算）
const tableMaxHeight = computed(() => {
  const screenHeight = window.innerHeight
  return screenHeight - 500 // 根据实际布局调整
})

// 分页器布局（响应式）
const paginationLayout = computed(() => {
  const width = window.innerWidth
  if (width < 768) {
    return 'prev, pager, next'
  } else if (width < 1200) {
    return 'total, sizes, prev, pager, next'
  } else {
    return 'total, sizes, prev, pager, next, jumper'
  }
})



/** 导出按钮操作 */
async function handleExportText() {
  if (!form.value.headId) {
    ElMessage.error('请先保存数据！')
    return
  }
  
  try {
    const response = await exportIntrastatDetailText(form.value.headId)
    const blob = new Blob([response], { type: 'text/plain;charset=ISO-8859-1' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Intrastat_${form.value.declarantNif}_${form.value.periodoAno}_${form.value.periodoMes}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  }
}



// 导入明细组件
function importItems(){
  importItemsDialog.value.openImportItemsDialog()
}


// 导入更新明细
function handleChangeDetails(details) { 
  // 为导入的每条数据生成唯一ID
  
  intrastatDetailList.value = [...intrastatDetailList.value, ...details]
  
  
  // 如果有大量数据导入，自动跳转到第一页
  if (details.length > pageSize.value) {
    currentPage.value = 1
    ElMessage.info(`已导入${details.length}条记录，自动跳转到第1页`)
  } else {
    // 跳转到包含新记录的页面
    const pageWithNewRecords = Math.ceil(intrastatDetailList.value.length / pageSize.value)
    currentPage.value = pageWithNewRecords
  }
}

// 获取行唯一标识
function getRowKey(row) {
  return row.detailId
}

// 生成行ID
function generateRowId() {
  return tableRowIdGenerator.generateId()
}

// 计算行索引
function calculateRowIndex(tableIndex) {
  return (currentPage.value - 1) * pageSize.value + tableIndex + 1
}


// 添加经营者 - 自动添加到最后并跳转到最后一页
function handleAddOperador() {
  const newOperador = {
    detailId: generateRowId(), // 生成唯一ID
    headId: null,
    userId: null,
    numPartida: null,
    situacion: "CO",
    miembroName: null,

    paisMiembro: null,
    provincia: null,
    condicionEntrega: null,
    naturalezaTransaccion: '11',
    modoTransporte: null,
    puerto: null,
    mercancia: null,
    paisOrigen: null,
    regimen: "1",
    masaNeta: 0.000,
    unidadSuplementaria: 0.000,
    importeFactura: 0.00,
    valorEstadistico: 0.00,
    nifIvaContraparte: null, 
    
  }
  
  // 添加新记录
  intrastatDetailList.value.push(newOperador)
  
  // 计算最后一页
  const lastPage = totalPages.value
  if (currentPage.value !== lastPage) {
    currentPage.value = lastPage
  }
  
  // 等待DOM更新后，滚动到表格底部并聚焦第一个输入框
  nextTick(() => {
    // 滚动到表格容器底部
    const tableContainer = document.querySelector('.operador-table-container')
    if (tableContainer) {
      tableContainer.scrollTop = tableContainer.scrollHeight
    }
    
    // 自动聚焦到新行的第一个输入框
    setTimeout(() => {
      const firstInput = document.querySelector(`.el-table__row:last-child .el-input__inner`)
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  })
  
  ElMessage.success('已添加新记录，请填写详细信息')
}


// 单独删除一行（基于全局索引）
function handleRemoveOperador(globalIndex) {
  const row = intrastatDetailList.value[globalIndex]
  if (!row) {
    return
  }
  
  ElMessageBox.confirm(`确定删除序号：${globalIndex + 1}，交易对方税号：${row.nifIvaContraparte} 的记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从原始数据中删除
    intrastatDetailList.value.splice(globalIndex, 1)
    
    // 更新选中记录
    selectedOperadores.value = selectedOperadores.value.filter(
      selected => !intrastatDetailList.value.some(item => item.detailId === selected.detailId)
    )
    
    
    // 如果删除后当前页没有数据且不是第一页，跳转到上一页
    if (currentPageData.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 删除选中的明细记录
function handleDeleteOperador() {
  if (selectedOperadores.value.length === 0) {
    ElMessage.warning('请先选择要删除的经营者记录')
    return
  }
  
  const selectedIds = selectedOperadores.value.map(item => item.detailId)
  
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedOperadores.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    // 根据ID删除，避免依赖索引
    intrastatDetailList.value = intrastatDetailList.value.filter(
      item => !selectedIds.includes(item.detailId)
    )
    
    // 清空选中
    selectedOperadores.value = []
    
    
    // 如果删除后当前页没有数据且不是第一页，跳转到上一页
    if (currentPageData.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    
    ElMessage.success(`成功删除 ${selectedIds.length} 条记录`)
  }).catch(() => {})
}

// 经营者选择变化
function handleOperadorSelectionChange(selection) {
  console.log("已勾选：", selection)
  selectedOperadores.value = selection
}

// 处理输入框聚焦
function handleInputFocus(tableIndex, fieldName) {
  const globalIndex = calculateRowIndex(tableIndex) - 1
  console.log(`聚焦到第${globalIndex + 1}行的${fieldName}字段`)
}

// 处理行双击
function handleRowDblClick(row, column, event) {
  console.log('双击行:', row)
  // 可以在这里实现快速编辑功能
}

// 验证国家代码
function validateCountryCode(row) {
  if (row.codigoPais && row.codigoPais.length > 2) {
    row.codigoPais = row.codigoPais.substring(0, 2)
    ElMessage.warning('国家代码最多2位')
  }
}

// 分页大小变化
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  localStorage.setItem('intrastat_page_size', size.toString())
}

// 页码变化
function handlePageChange(page) {
  currentPage.value = page
  // 滚动到表格顶部
  const tableContainer = document.querySelector('.operador-table-container')
  if (tableContainer) {
    tableContainer.scrollTop = 0
  }
  
}


// 表单数据
const data = reactive({
  form: {},
  rules: {
    declarantNif: [
      { required: true, message: "申报法定税号不能为空", trigger: "blur" }
    ],
    declarantName: [
      { required: true, message: "申报法定名称不能为空", trigger: "blur" }
    ],
    flujo: [
      { required: true, message: "贸易流向不能为空", trigger: "blur" }
    ],
    tipoDeclaracion: [
      { required: true, message: "申报类型不能为空", trigger: "blur" }
    ],
    periodoAno: [
      { required: true, message: "申报年份不能为空", trigger: "blur" }
    ],
    periodoMes: [
      { required: true, message: "申报月份不能为空", trigger: "blur" }
    ],
    numDeclaracion: [
      { required: true, message: "申报序号不能为空", trigger: "blur" }
    ],
  }
})

const { form, rules } = toRefs(data)

// 通过传递的ID获取数据
const getInfoById = async () => {
  try {
    const { headId } = route.query
    if (headId) {
      const res = await getIntrastatHead(headId)
      if (res.code === 200) {
        Object.assign(form.value, res.data)
        if( res.data && res.data.intrastatDetailList ){
          // ✅ 确保每条数据都有 ID
          intrastatDetailList.value = res.data.intrastatDetailList.map(item => ({
            ...item,
            detailId: item.detailId || generateRowId()
          }))
        }
      }
    } else {
      reset();
    }

  } catch (error) {
    console.log('初始获取intrastat数据失败！' , error)
  }
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
function reset() {
  form.value = {
    headId: null, 
    userId: null,
    declarantNif: null,
    declarantName: null,
    tercerDeclaranteNif: null,
    tercerDeclaranteName: null,
    flujo: null,
    tipoDeclaracion: 'N', // 申报类型默认为 N 带明细的正常申报
    oficina: null,
    periodoMes: currentMonth, 
    periodoAno: currentYear,
    numDeclaracion: 1,    // 申报序号默认 1
    situacion: null,
    moneda: 'Euros',
    localizacion: null,
  }
  intrastatDetailList.value = []
  currentPage.value = 1
  if (intrastatDeclaranteRef.value) {
    intrastatDeclaranteRef.value.resetFields()
  }
}

// 加载申报人列表
async function loadDeclarantes() {
  try {
    const params = {
      page: 1,
      pageSize: 300,
      userType: '02'
    }
    const res = await listUser(params)
    if (res.code === 200) {
      declaranteList.value = res.rows
      console.log('declaranteList:', declaranteList.value)
    }
  } catch (error) {
    console.error('加载申报人列表失败:', error)
  }
}


// 申报人变更处理
function updateDeclarante(data) {
  if (data) {
    form.value.declarantNif = data.userNif
    form.value.declarantName = data.userNombre
    form.value.userId = data.userId
  } else {
    form.value.declarantNif = null
    form.value.declarantName = null
    form.value.userId = null
  }
}

// 定义验证规则配置
const DETAIL_VALIDATION_RULES = [
  {
    field: 'paisMiembro',
    message: '国家代码不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'condicionEntrega',
    message: '交货条件不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'naturalezaTransaccion',
    message: '交易性质不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'modoTransporte',
    message: '运输方式不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'mercancia',
    message: '商品编码不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'regimen',
    message: '统计制度不能为空',
    validator: (val) => val && val.trim()
  },
  {
    field: 'nifIvaContraparte',
    message: '交易方税号不能为空',
    validator: (val) => val && val.trim()
  }
]

// 运输方式特殊验证
const validateTransportMode = (row) => {
  if (row.modoTransporte && row.modoTransporte !== '3' && !row.puerto) {
    return {
      isValid: false,
      message: '非 3-公路 的运输类型，港口机场不能为空'
    }
  }
  return { isValid: true }
}

// 验证明细列表
const validateDetailList = (detailList) => {
  // 1. 检查是否为空
  if (detailList.length === 0) {
    return { isValid: false, message: '请至少添加一条申报明细' }
  }

  // 2. 逐条验证
  for (let i = 0; i < detailList.length; i++) {
    const row = detailList[i]
    
    // 基础字段验证
    for (const rule of DETAIL_VALIDATION_RULES) {
      if (!rule.validator(row[rule.field])) {
        return { 
          isValid: false, 
          message: `第${i + 1}行：${rule.message}` 
        }
      }
    }
    
    // 运输方式特殊验证
    const transportResult = validateTransportMode(row)
    if (!transportResult.isValid) {
      return { 
        isValid: false, 
        message: `第${i + 1}行：${transportResult.message}` 
      }
    }
  }
  
  return { isValid: true }
}

// 提交表单
const handleSubmit = async () => {
  // 1. 验证主表单（放在 try 外面）
  if (!intrastatDeclaranteRef.value) {
    ElMessage.error('表单未初始化')
    return
  }
  
  try {
    await intrastatDeclaranteRef.value.validate()
  } catch (error) {
    // 主表单验证失败
    ElMessage.warning('请完善申报人信息')
    return
  }
  
  // 2. 验证明细列表（放在 try 外面）
  const validationResult = validateDetailList(intrastatDetailList.value)
  if (!validationResult.isValid) {
    ElMessage.error(validationResult.message)
    return
  }
  
  // 3. 准备提交数据
  submitting.value = true
  form.value.intrastatDetailList = intrastatDetailList.value
  
  try {
    // 4. 执行提交
    const isEdit = !!form.value.headId
    const requestApi = isEdit ? updateIntrastatHead : addIntrastatHead
    const res = await requestApi(form.value)
    
    // 5. 处理响应
    if (res.code === 200) {
      ElMessage.success(isEdit ? '修改成功' : '新增成功')
      
      // 更新表单数据
      if (res.data) {
        Object.assign(form.value, res.data)
        intrastatDetailList.value = res.data.intrastatDetailList || []
      }
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  // 当前要关闭的 tabs
  const view = {
    path: route.path,
    name: route.name,
    meta: route.meta,
  };
  // 关闭当前 tab
  proxy.$tab.closePage(view)
  router.push({
    path: "/IntrastatManage/intrastatHead",
  });
};

// 初始化分页设置
function initPagination() {
  const savedPageSize = localStorage.getItem('intrastat_page_size')
  if (savedPageSize) {
    pageSize.value = parseInt(savedPageSize)
  }
}

// 窗口大小变化处理
function handleResize() {
  // 可以在这里处理响应式布局
}

// 生命周期钩子
onMounted(() => {
  initPagination();
  window.addEventListener('resize', handleResize);
  getInfoById();
  loadDeclarantes();
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 可选：清空ID生成器的记录
  tableRowIdGenerator.clear();
})
</script>

<style lang="scss" scoped>
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0px;
  margin: 0px;

  .card-data{
    width: 100%;
    height: 100%;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .card-operation-log{
    width: 100%;
    flex-shrink: 0;
    overflow-y: auto;
  }
}

/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    h2 {
      margin: 0;
    }
  }
  .actions {
    display: flex;
    gap: 10px;
  }
}

/* 工具栏样式 */
.operador-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 20px;
  flex-wrap: wrap;
  gap: 10px;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    
    .quick-jump {
      display: flex;
      align-items: center;
      margin-right: 10px;
    }
    
    .custom-pagination {
      margin-right: 10px;
    }
  }
}

/* 表格容器 */
.operador-table-container {
  flex: 1;
  overflow: auto;
  margin: 0 20px 10px 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  
  .el-table {
    width: 100%;
    
    .row-index {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    
    .row-actions {
      display: flex;
      justify-content: center;
      gap: 5px;
      
      .el-button {
        padding: 5px;
      }
    }
    
    :deep(.el-table__row) {
      &.current-row {
        background-color: #f0f9ff;
      }
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

/* 固定分页器 */
.fixed-pagination {
  .pagination-info {
    font-size: 14px;
    color: #606266;
  }
  
  .el-pagination {
    margin: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .operador-toolbar {
    flex-direction: column;
    align-items: stretch;
    
    .toolbar-left, .toolbar-right {
      width: 100%;
      justify-content: center;
    }
  }
  
  .fixed-pagination {
    flex-direction: column;
    gap: 10px;
    
    .el-pagination {
      width: 100%;
      justify-content: center;
    }
  }
  
  .operador-table-container {
    margin: 0 10px 10px 10px;
    
    .el-table {
      :deep(th),
      :deep(td) {
        padding: 8px 5px;
      }
    }
  }
}

/* 小屏幕隐藏部分列 */
@media (max-width: 1200px) {
  .el-table__body-wrapper {
    overflow-x: auto;
  }
  
  .el-table {
    min-width: 1200px;
  }
}

/* 滚动条美化 */
.operador-table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.operador-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.operador-table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.operador-table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 输入框样式优化 */
:deep(.el-input-number) {
  .el-input__wrapper {
    padding-right: 5px;
  }
}

:deep(.el-select) {
  width: 100%;
}

/* 表格斑马纹 */
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}
</style>