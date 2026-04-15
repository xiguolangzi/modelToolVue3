<template>
  <div class="app-container">
    <el-card class="card-data"> 

      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>349申报数据详情</h2>
             <el-tag type="success">流水编号：{{ form.id }}</el-tag>
             <dict-tag :options="model349_status" :value="form.estado"/>
          </div>

          <div class="actions">

          </div>

          <el-button-group>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
            <el-button type="warning" @click="handleExport349" :loading="submitting">导出349模板</el-button>
            <el-button type="danger" @click="goBack" :loading="submitting">退出</el-button>
          </el-button-group>

        </div>
        
      </template>

      <el-form ref="modelo349DeclaranteRef" :model="form" :rules="rules" label-width="160px" >
        <!-- Ejercicio -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申报识别号:" prop="numeroIdentificativo">
              <el-input v-model.number="form.numeroIdentificativo" placeholder="请输入申报识别号，13位数字" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="财政年度:" prop="ejercicio">
              <el-input v-model="form.ejercicio" placeholder="请输入财政年度，YYYY格式" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="申报期间:" prop="periodo">
              <el-select v-model="form.periodo" placeholder="请选择申报期间" style="width: 100%">
                <el-option
                  v-for="dict in model349_periodo"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="申报频率变更指示器:">
              <el-input 
                v-model="form.indicadorCambioPeriodicidad" 
                placeholder="X-月度申报" 
                :maxlength="1" 
                show-word-limit 
              />
            </el-form-item>
          </el-col>
          
        </el-row>

        <!-- Declarante -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申报人NIF:" prop="nifDeclarante">
              <el-select 
                v-model="form.nifDeclarante" 
                placeholder="请选择申报人" 
                style="width: 100%" 
                @change="updateDeclarante"
                filterable
              >
                <el-option
                  v-for="item in declaranteList"
                  :key="item.value"
                  :label="item.nombreDeclarante"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="申报人姓名:" prop="nombreDeclarante">
              <el-input v-model="form.nombreDeclarante" placeholder="请输入申报人姓名或公司名称" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="法定代表人的NIF:" prop="nifRepresentanteLegal">
              <el-input v-model.trim="form.nifRepresentanteLegal" placeholder="请输入法定代表人的NIF税号" disabled/>
            </el-form-item>
          </el-col>
          
        </el-row>

        <!-- Persona y teléfono de contacto -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="联系电话:" prop="telefonoContacto">
              <el-input v-model.trim="form.telefonoContacto" placeholder="请输入联系电话" disabled/>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="联系人姓名:" prop="personaContacto">
              <el-input v-model="form.personaContacto" placeholder="请输入联系人姓名" disabled/>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Resumen de los datos incluidos en la declaración -->
        <el-row :gutter="20">
          
          <el-col :span="6">
            <el-form-item label="欧盟内经营者总数:">
              <el-input-number 
              v-model="form.totalOperadoresIntracomunitarios" 
              placeholder="系统自动计算"  
              :controls="false"
              :min="0" :max="99999999999" :precision="0"
              style="width: 100%;"
              disabled/>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="欧盟内交易总额:">
              <el-input-number 
              v-model="form.importeOperaciones" 
              placeholder="系统自动计算"  
              :controls="false"
              :min="0" :max="99999999999" :precision="2"
              style="width: 100%;"
              disabled>
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="修正的经营者总数:">
              <el-input-number 
              v-model="form.totalOperadoresRectificaciones" 
              placeholder="系统自动计算"  
              :controls="false"
              :min="0" :max="99999999999" :precision="0"
              style="width: 100%;"
              disabled/>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="修正金额总额:">
              <el-input-number 
              v-model="form.importeRectificaciones" 
              placeholder="系统自动计算"
              :controls="false"
              :min="0" :max="99999999999" :precision="2"
              style="width: 100%;"
              disabled  >
                <template #suffix>
                  <span>€</span>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          
        </el-row>

        <!-- Declaración complementaria o sustitutiva -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="申报类型:" prop="declaracionTipo">
              <el-select v-model="form.declaracionTipo" placeholder="请选择申报类型" style="width: 100%" clearable>
                <el-option
                  v-for="dict in model349_declaration_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="先前申报识别号:" prop="numeroDeclaracionAnterior">
              <el-input 
                v-model="form.numeroDeclaracionAnterior" 
                placeholder="如果补充或替代 请输入 13位前一申报识别号"
                :disabled="!isRectificacion"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态:" prop="estado">
              <el-select v-model="form.estado" placeholder="请选择状态" style="width: 100%">
                <el-option
                  v-for="dict in model349_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="备注:" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" :maxlength="200" :rows="1" show-word-limit/>
            </el-form-item>
          </el-col>
          
        </el-row>

        <!-- 经营者记录明细 -->
        <el-divider content-position="center">
          <span style="font-size: 16px; font-weight: bold;">349模型欧盟内经营者记录信息</span>
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
                    <el-button type="warning" link icon="Upload" >Excel导入标准模版</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item @click="importItemsByCustomer1" :loading="submitting">
                    <el-button type="primary" link icon="Upload">Excel导入自定义模版</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 经营者记录信息表格 -->
        <div class="operador-table-container">
          <el-table 
            :data="currentPageData"
            border
            @selection-change="handleOperadorSelectionChange"
            ref="operadorTableRef"
            :row-key="getRowKey"
            style="width: 100%"
            v-loading="tableLoading"
            :max-height="tableMaxHeight"
            :highlight-current-row="true"
            @row-dblclick="handleRowDblClick"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="序号" width="80" align="center" fixed="left">
              <template #default="{ $index }">
                <div class="row-index">
                  {{ calculateRowIndex($index) }}
                </div>
              </template>
            </el-table-column>

            <!-- 国家信息 -->
            <el-table-column label="国家代码" prop="codigoPais" width="100" align="center">
              <template #default="{ row, $index }">
                <el-input 
                  v-model.trim="row.codigoPais" 
                  placeholder="国家代码" 
                  @input="validateCountryCode(row)"
                  @focus="handleInputFocus($index, 'codigoPais')"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="欧盟税号" prop="nifOperador" width="180" align="center">
              <template #default="{ row, $index }">
                <el-input 
                  v-model.trim="row.nifOperador" 
                  placeholder="欧盟运营商税号" 
                  maxlength="15"
                  show-word-limit
                  @focus="handleInputFocus($index, 'nifOperador')"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="公司名称" prop="nombreOperador" min-width="250" align="left">
              <template #default="{ row, $index }">
                <el-input 
                  v-model="row.nombreOperador" 
                  placeholder="经营者姓名或公司名称" 
                  maxlength="40"
                  show-word-limit
                  @focus="handleInputFocus($index, 'nombreOperador')"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作代码" prop="claveOperacion" width="120" align="center">
              <template #default="{ row }">
                <el-select v-model="row.claveOperacion" placeholder="操作代码" style="width: 100%" size="small">
                  <el-option
                    v-for="dict in model349_operation_key"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="交易金额" prop="baseImponible" width="140" align="right" header-align="center">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.baseImponible" 
                  placeholder="应税基础或金额" 
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  @focus="handleInputFocus($index, 'baseImponible')"
                  :disabled="isRectificacion"
                  size="small"
                  @change="calculateTotals"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            
            <!-- 修正相关字段 -->
            <el-table-column label="修正年度" prop="ejercicioRectificacion" width="120" align="center">
              <template #default="{ row, $index }">
                <el-input 
                  v-model="row.ejercicioRectificacion" 
                  placeholder="财政年度YYYY"
                  @focus="handleInputFocus($index, 'ejercicioRectificacion')"
                  :disabled="!isRectificacion"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="修正期间" prop="periodoRectificacion" width="120" align="center">
              <template #default="{ row }">
                <el-select 
                  v-model="row.periodoRectificacion" 
                  placeholder="请选择期间" 
                  style="width: 100%"
                  :disabled="!isRectificacion"
                  size="small"
                >
                  <el-option
                    v-for="dict in model349_periodo"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="修正后金额" prop="baseImponibleRectificada" width="150" align="right">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.baseImponibleRectificada" 
                  placeholder="修正后金额"
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  @focus="handleInputFocus($index, 'baseImponibleRectificada')"
                  :disabled="!isRectificacion"
                  @change="calculateTotals"
                  size="small"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            
            <el-table-column label="先前金额" prop="baseImponibleAnterior" width="150" align="right">
              <template #default="{ row, $index }">
                <el-input-number 
                  v-model="row.baseImponibleAnterior" 
                  placeholder="先前申报金额"
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  @focus="handleInputFocus($index, 'baseImponibleAnterior')"
                  :disabled="!isRectificacion"
                  size="small"
                >
                  <template #suffix>
                    <span>€</span>
                  </template>
                </el-input-number>
              </template>
            </el-table-column>
            
            <el-table-column label="替代税号" prop="nifDestinatarioSustituto" width="150" align="center">
              <template #default="{ row, $index }">
                <el-input 
                  v-model.trim="row.nifDestinatarioSustituto" 
                  placeholder="操作类型为C时填写"
                  @focus="handleInputFocus($index, 'nifDestinatarioSustituto')"
                  :disabled="row.claveOperacion !== 'C'"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="替代公司名称" prop="nombreDestinatarioSustituto" width="200" align="left">
              <template #default="{ row, $index }">
                <el-input 
                  v-model="row.nombreDestinatarioSustituto" 
                  placeholder="操作类型为C时填写"
                  maxlength="40"
                  show-word-limit
                  @focus="handleInputFocus($index, 'nombreDestinatarioSustituto')"
                  :disabled="row.claveOperacion !== 'C'"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ $index }">
                <div class="row-actions">
                  <el-button 
                    type="primary" 
                    icon="Edit" 
                    @click.stop="handleEditOperador($index)"
                    size="small"
                    circle
                  />
                  <el-button 
                    type="danger" 
                    icon="Delete" 
                    @click.stop="handleRemoveOperador(calculateRowIndex($index) - 1)"
                    size="small"
                    circle
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 底部固定分页器 -->
        <div class="fixed-pagination" v-if="modelo349OperadorIntraList.length > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="totalOperadores"
            :layout="paginationLayout"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      
      </el-form>

    </el-card>

    <!-- 导入标准明细 -->
    <ImportItemsDialog ref="importItemsDialog" :detailList="modelo349OperadorIntraList" @changeDetail="handleChangeDetails" />

    <!-- 导入自定义明细1 -->
    <ImportItemsByCustomer1Dialog ref="importItemsByCustomer1Dialog" :detailList="modelo349OperadorIntraList" @changeDetail="handleChangeDetails" />

  </div>
</template>

<script setup name="EditDeclarante">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive, toRefs } from 'vue'
import { getModelo349Declarante, addModelo349Declarante, updateModelo349Declarante, exportModelo349 } from "@/api/models/modelo349Declarante"
import { selectDeclarantes } from "@/api/models/configDeclarante"
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from "vue-router"
import ImportItemsDialog from './ImportItemsDialog.vue'
import ImportItemsByCustomer1Dialog  from './ImportItemsByCustomer1Dialog.vue';
import { tableRowIdGenerator } from '@/utils/idGenerator';  // 生成序号

const router = useRouter()
const route = useRoute()

const { proxy } = getCurrentInstance()
const { model349_operation_key, model349_declaration_type, model349_periodo, model349_status } = proxy.useDict('model349_operation_key', 'model349_declaration_type', 'model349_periodo', 'model349_status')

// 经营者列表
const modelo349OperadorIntraList = ref([]); // 列表数据
const selectedOperadores = ref([]);         // 选中数据
const declaranteList = ref([]);             // 申报人列表
const submitting = ref(false);              // 表单提交中
const tableLoading = ref(false);            // 表格加载中

// 导入组件
const importItemsDialog = ref(null);            // 导入弹出框1
const importItemsByCustomer1Dialog = ref(null); // 导入弹出框2

const modelo349DeclaranteRef = ref(null); // 表单
const operadorTableRef = ref(null);       // 运营商列表

// 分页相关
const currentPage = ref(1); // 当前页
const pageSize = ref(20);   // 每页条数

// 计算属性
const totalOperadores = computed(() => modelo349OperadorIntraList.value.length);      // 总条目数
const totalPages = computed(() => Math.ceil(totalOperadores.value / pageSize.value)); // 总页数


// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return modelo349OperadorIntraList.value.slice(start, end)
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

// 是否更正
const isRectificacion = computed(() => {
  return ['S', 'C'].includes(form.value.declaracionTipo)
})

/** 导出按钮操作 */
async function handleExport349() {
  if (!form.value.id) {
    ElMessage.error('请先保存数据！')
    return
  }
  
  try {
    const response = await exportModelo349(form.value.id)
    const blob = new Blob([response], { type: 'text/plain;charset=ISO-8859-1' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `349_${form.value.nifDeclarante}_${form.value.ejercicio}_${form.value.periodo}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  }
}



// 导入明细组件
function importItems(){
  importItemsDialog.value.openImportProductDialog()
}

function importItemsByCustomer1(){
  importItemsByCustomer1Dialog.value.openImportProductDialog()
}

// 导入更新明细
function handleChangeDetails(details) { 
  // 为导入的每条数据生成唯一ID
  const detailsWithIds = details.map(item => ({
    ...item,
    id: tableRowIdGenerator.generateId()
  }))
  
  modelo349OperadorIntraList.value = [...modelo349OperadorIntraList.value, ...detailsWithIds]
  
  calculateTotals()
  
  // 如果有大量数据导入，自动跳转到第一页
  if (details.length > pageSize.value) {
    currentPage.value = 1
    ElMessage.info(`已导入${details.length}条记录，自动跳转到第1页`)
  } else {
    // 跳转到包含新记录的页面
    const pageWithNewRecords = Math.ceil(modelo349OperadorIntraList.value.length / pageSize.value)
    currentPage.value = pageWithNewRecords
  }
}

// 获取行唯一标识
function getRowKey(row) {
  return row.id || generateRowId()
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
    id: generateRowId(), // 生成唯一ID
    tipoRegistro: "2",
    modeloDeclaracion: "349",
    ejercicio: "",
    nifDeclarante: "",
    codigoPais: "",
    nifOperador: "",
    nombreOperador: "",
    claveOperacion: "",
    baseImponible: 0.00,
    nifDestinatarioSustituto: "",
    nombreDestinatarioSustituto: "",
    ejercicioRectificacion: "",
    periodoRectificacion: "",
    baseImponibleRectificada: 0.00,
    baseImponibleAnterior: 0.00
  }
  
  // 添加新记录
  modelo349OperadorIntraList.value.push(newOperador)
  
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

// 编辑经营者记录
function handleEditOperador(tableIndex) {
  const globalIndex = calculateRowIndex(tableIndex) - 1
  const row = modelo349OperadorIntraList.value[globalIndex]
  
  if (row) {
    // 这里可以弹出编辑对话框，或者直接在当前行编辑
    ElMessage.info(`编辑第 ${globalIndex + 1} 条记录`)
  }
}

// 单独删除一行（基于全局索引）
function handleRemoveOperador(globalIndex) {
  const row = modelo349OperadorIntraList.value[globalIndex]
  if (!row) {
    return
  }
  
  ElMessageBox.confirm(`确定删除序号：${globalIndex + 1}，税号：${row.nifOperador} 的记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从原始数据中删除
    modelo349OperadorIntraList.value.splice(globalIndex, 1)
    
    // 更新选中记录
    selectedOperadores.value = selectedOperadores.value.filter(
      selected => !modelo349OperadorIntraList.value.some(item => item.id === selected.id)
    )
    
    // 重新计算总计
    calculateTotals()
    
    // 如果删除后当前页没有数据且不是第一页，跳转到上一页
    if (currentPageData.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 删除选中的经营者记录
function handleDeleteOperador() {
  if (selectedOperadores.value.length === 0) {
    ElMessage.warning('请先选择要删除的经营者记录')
    return
  }
  
  const selectedIds = selectedOperadores.value.map(item => item.id)
  const selectedNames = selectedOperadores.value.map(item => 
    item.nifOperador || item.nombreOperador || `ID: ${item.id}`
  ).join(', ')
  
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedOperadores.value.length} 条记录吗？\n包含: ${selectedNames}`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    // 根据ID删除，避免依赖索引
    modelo349OperadorIntraList.value = modelo349OperadorIntraList.value.filter(
      item => !selectedIds.includes(item.id)
    )
    
    // 清空选中
    selectedOperadores.value = []
    
    // 重新计算总计
    calculateTotals()
    
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
  localStorage.setItem('model349_page_size', size.toString())
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
    tipoRegistro: [
      { required: true, message: "记录类型，固定为1不能为空", trigger: "blur" }
    ],
    modeloDeclaracion: [
      { required: true, message: "申报模型，固定为349不能为空", trigger: "blur" }
    ],
    ejercicio: [
      { required: true, message: "财政年度，YYYY格式不能为空", trigger: "blur" }
    ],
    nifDeclarante: [
      { required: true, message: "申报人NIF税号不能为空", trigger: "blur" }
    ],
    nombreDeclarante: [
      { required: true, message: "申报人姓名或公司名称不能为空", trigger: "blur" }
    ],
    periodo: [
      { required: true, message: "申报期间不能为空", trigger: "change" }
    ],
  }
})

const { form, rules } = toRefs(data)

// 通过传递的ID获取数据
const getInfoById = async () => {
  try {
    const { id } = route.query
    if (id) {
      const res = await getModelo349Declarante(id)
      if (res.code === 200) {
        Object.assign(form.value, res.data)
        if( res.data ){
          modelo349OperadorIntraList.value = res.data.modelo349OperadorIntraList || []
        }
      }
    } else {
      reset();
    }

  } catch (error) {
    console.log('初始获取model349数据失败！' , error)
  }
}

const currentYear = new Date().getFullYear();
function reset() {
  form.value = {
    id: null, 
    tipoRegistro: '1',
    modeloDeclaracion: '349',
    ejercicio: currentYear,
    nifDeclarante: null,
    nombreDeclarante: null,
    telefonoContacto: null,
    personaContacto: null,
    numeroIdentificativo: null,
    declaracionTipo: null,
    numeroDeclaracionAnterior: null,
    periodo: null,
    totalOperadoresIntracomunitarios: 0,
    importeOperaciones: 0.00,
    totalOperadoresRectificaciones: 0,
    importeRectificaciones: 0.00,
    indicadorCambioPeriodicidad: null,
    nifRepresentanteLegal: null,
    estado: 'P',
    fechaCreacion: null,
    fechaActualizacion: null
  }
  modelo349OperadorIntraList.value = []
  currentPage.value = 1
  if (modelo349DeclaranteRef.value) {
    modelo349DeclaranteRef.value.resetFields()
  }
}

// 加载申报人列表
async function loadDeclarantes() {
  try {
    const res = await selectDeclarantes()
    if (res.code === 200) {
      declaranteList.value = res.data
    }
  } catch (error) {
    console.error('加载申报人列表失败:', error)
  }
}
loadDeclarantes()

// 申报人变更处理
function updateDeclarante(data) {
  if (data) {
    form.value.nombreDeclarante = data.nombreDeclarante
    form.value.nifDeclarante = data.nifDeclarante
    form.value.telefonoContacto = data.telefonoContacto
    form.value.personaContacto = data.personaContacto
    form.value.nifRepresentanteLegal = data.nifRepresentanteLegal
  } else {
    form.value.nombreDeclarante = null
    form.value.nifDeclarante = null
    form.value.telefonoContacto = null
    form.value.personaContacto = null
    form.value.nifRepresentanteLegal = null
  }
}

// 计算总计
function calculateTotals() {
  const count = modelo349OperadorIntraList.value.length // 整数数量
  const sumAmount = (field) => {
    const total = modelo349OperadorIntraList.value.reduce((sum, item) => {
      return sum + (parseFloat(item[field]) || 0)
    }, 0)
    return parseFloat(total.toFixed(2)) // 金额保留两位小数
  }

  if (isRectificacion.value) {
    // 更正数据
    form.value.totalOperadoresRectificaciones = count // 整数
    form.value.importeRectificaciones = sumAmount('baseImponibleRectificada') // 两位小数
    form.value.totalOperadoresIntracomunitarios = 0 // 整数清零
    form.value.importeOperaciones = 0 // 金额清零
  } else {
    // 正常数据
    form.value.totalOperadoresIntracomunitarios = count // 整数
    form.value.importeOperaciones = sumAmount('baseImponible') // 两位小数
    form.value.totalOperadoresRectificaciones = 0 // 整数清零
    form.value.importeRectificaciones = 0 // 金额清零
  }
}

// 提交表单
async function handleSubmit() {
  if (!modelo349DeclaranteRef.value) return
  
  try {
    await modelo349DeclaranteRef.value.validate()
    
    // 验证经营者记录
    if (modelo349OperadorIntraList.value.length === 0) {
      ElMessage.warning('请至少添加一条经营者记录')
      return
    } else {
      // 验证所有记录
      for (const row of modelo349OperadorIntraList.value) {
        if(isRectificacion.value){
          if(row.baseImponibleRectificada == null || row.baseImponibleRectificada == undefined || row.baseImponibleRectificada < 0){
            ElMessage.warning('记录明细中"修正后金额"不能小于0')
            return
          }
        } else {
          if(row.baseImponible == null || row.baseImponible == undefined || row.baseImponible < 0){
            ElMessage.warning('记录明细中存在"交易金额"小于0的明细')
            return
          }
        }
      }
    }
    
    // 设置经营者记录
    form.value.modelo349OperadorIntraList = modelo349OperadorIntraList.value
    
    submitting.value = true
    
    let res
    if (form.value.id) {
      res = await updateModelo349Declarante(form.value)
    } else {
      res = await addModelo349Declarante(form.value)
    }
    
    if (res.code === 200) {
      ElMessage.success(form.value.id ? '修改成功' : '新增成功')
      Object.assign(form.value, res.data)
      modelo349OperadorIntraList.value = res.data.modelo349OperadorIntraList || []
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
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
    path: "/Model349/modelo349Declarante",
  });
};

// 初始化分页设置
function initPagination() {
  const savedPageSize = localStorage.getItem('model349_page_size')
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
  initPagination()
  window.addEventListener('resize', handleResize)
  getInfoById()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 可选：清空ID生成器的记录
  tableRowIdGenerator.clear()
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