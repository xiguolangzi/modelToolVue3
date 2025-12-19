<template>
  <el-dialog 
    v-model="importProductDialogRef" 
    title="导入Excel自定义1明细" 
    width="70%" 
    style="margin-top: 100px !important;"
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    draggable
    @close="handleDialogClose"
  >
    <div class="order-import">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <!-- 导入按钮 -->
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          accept=".xlsx,.xls"
          draggable
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :limit="1"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            导入明细
          </el-button>
        </el-upload>
        <span style="color: red; margin-left: 10px; font-size: 12px;">
          注意：只允许导入 .xlsx, .xls 文件，最多200条数据
        </span>
        <el-link 
          type="primary" 
          underline="never" 
          style="font-size: 12px; vertical-align: baseline; margin-left: 50px;" 
          @click="importTemplate"
        >
          下载模板
        </el-link>
      </div>

      <!-- 数据预览表格 -->
      <div v-if="previewData.length > 0" class="preview-section">
        <h3>数据预览（共 {{ previewData.length }} 条）</h3>
        <div style="margin: 10px 0;">
          <el-tag type="success" size="small">
            有效数据：{{ validDataCount }} 条
          </el-tag>
          <el-tag type="danger" size="small" style="margin-left: 10px;">
            异常数据：{{ invalidDataCount }} 条
          </el-tag>
        </div>
        
        <el-table
          :data="previewData"
          border
          style="width: 100%; margin: 20px 0;"
          max-height="400"
          :row-style="tableRowStyle"
          highlight-current-row
        >
          <el-table-column prop="rowIndex" label="行号" width="70" align="center"></el-table-column>
          <el-table-column
            v-for="column in tableColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :min-width="column.width"
            show-overflow-tooltip
          />
          <el-table-column prop="_isValid" label="状态" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row._isValid" type="success" size="small">正常</el-tag>
              <el-tag v-else type="danger" size="small">异常</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误原因" width="200" show-overflow-tooltip>
            <template #default="scope">
              <span v-if="scope.row.errorMessage" style="color: #f56c6c;">
                {{ scope.row.errorMessage }}
              </span>
              <span v-else style="color: #67c23a;">✓</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                v-if="!scope.row._isValid"
                link
                type="danger"
                size="small"
                @click="handleDelete(scope.$index)"
              >
                删除
              </el-button>
              <span v-else style="color: #999;">-</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="warning" @click="handleReset">重新导入</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmImport" 
            :loading="loading"
            :disabled="invalidDataCount > 0 || previewData.length === 0"
          >
            {{ loading ? '导入中...' : '确认导入' }}
          </el-button>
        </div>
      </div>

      <!-- 提交结果 -->
      <div v-if="submitResult" class="result-section">
        <el-alert
          :title="submitResult.title"
          :type="submitResult.type"
          :description="submitResult.message"
          show-icon
          closable
          @close="submitResult = null"
          style="margin-top: 20px;"
        />

        <!-- 失败数据展示 -->
        <div v-if="failedData.length > 0" class="failed-section">
          <h4 style="color: #f56c6c; margin-top: 15px; margin-bottom: 15px;">
            异常明细：{{ failedData.length }} 条
          </h4>
          <el-table
            :data="failedData"
            border
            style="width: 100%;"
            max-height="300"
          >
            <el-table-column prop="rowIndex" label="行号" width="80" align="center"></el-table-column>
            <el-table-column label="异常原因" width="200">
              <template #default="scope">
                <span style="color: #f56c6c;">{{ scope.row.errorMessage }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-for="column in tableColumns"
              :key="column.prop"
              :prop="column.prop"
              :label="column.label"
              :width="column.width"
              show-overflow-tooltip
            />
          </el-table>
          
          <div style="margin-top: 15px; text-align: center;">
            <el-button @click="handleExportFailed" type="primary" size="small">导出异常数据</el-button>
            <el-button @click="failedData = []" type="info" size="small">清除异常数据</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const { proxy } = getCurrentInstance()

const props = defineProps({
  detailList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['changeDetail'])

// 响应式数据
const importProductDialogRef = ref(null)
const uploadRef = ref()
const previewData = ref([])
const submitResult = ref(null)
const loading = ref(false)
const failedData = ref([])

// 计算属性
const validDataCount = computed(() => {
  return previewData.value.filter(item => item._isValid).length
})

const invalidDataCount = computed(() => {
  return previewData.value.filter(item => !item._isValid).length
})

// 表格列配置（根据您的Java实体类字段）
const tableColumns = [
  { prop: 'codigoPais', label: '欧盟国家', width: 120 },
  { prop: 'nifOperador', label: '欧盟税号', width: 130 },
  { prop: 'nombreOperador', label: '公司名称', width: 150 },
  { prop: 'claveOperacion', label: '销售/购买', width: 100 },
  { prop: 'baseImponible', label: '交易金额', width: 110 },
  { prop: 'ejercicioRectificacion', label: '修正的财政年度', width: 130 },
  { prop: 'periodoRectificacion', label: '修正的期间', width: 100 },
  { prop: 'baseImponibleRectificada', label: '修正后交易金额', width: 120 },
  { prop: 'baseImponibleAnterior', label: '先前申报金额', width: 120 },
  { prop: 'nifDestinatarioSustituto', label: '替代接收者税号', width: 130 },
  { prop: 'nombreDestinatarioSustituto', label: '替代接收者姓名', width: 150 }
]

// Excel列名到实体字段的映射
const columnMapping = {
  "欧盟国家": 'codigoPais',
  "欧盟税号": 'nifOperador',
  "公司名称": 'nombreOperador',
  "销售/购买": 'claveOperacion',
  "交易金额": 'baseImponible',
  "修正的财政年度": 'ejercicioRectificacion',
  "修正的期间": 'periodoRectificacion',
  "修正后的交易金额": 'baseImponibleRectificada',
  "先前申报的交易金额": 'baseImponibleAnterior',
  "替代最终接收者税号": 'nifDestinatarioSustituto',
  "替代最终接收者姓名": 'nombreDestinatarioSustituto'
}

// 行样式
const tableRowStyle = ({ row }) => {
  if (!row) return {}
  if (row.errorMessage) {
    return {
      background: '#fff2f2'
    }
  }
  return {}
}

/** 打开弹窗 */
function openImportProductDialog() {
  importProductDialogRef.value = true
  handleReset()
}

/** 下载模板 */
function importTemplate() {
  proxy.download("models/modelo349OperadorIntra/importCustomer1Template", {}, `349导入明细模板.xlsx`)
}

// 处理文件选择
const handleFileChange = async (file) => {
  if (!file) return
  
  const fileType = file.name.split('.').pop().toLowerCase()
  if (!['xlsx', 'xls'].includes(fileType)) {
    ElMessage.error('只能上传 .xlsx 或 .xls 格式的文件')
    return
  }

  try {
    const data = await readExcelFile(file.raw)
    previewData.value = data
    submitResult.value = null
    failedData.value = []
    
    const validCount = validDataCount.value
    const invalidCount = invalidDataCount.value
    
    if (invalidCount > 0) {
      ElMessage.warning(`数据验证完成，有效数据: ${validCount} 条，异常数据: ${invalidCount} 条`)
    } else if (validCount > 0) {
      ElMessage.success(`数据验证完成，共 ${validCount} 条有效数据`)
    }
  } catch (error) {
    ElMessage.error(`文件读取失败: ${error.message}`)
  }
}

// 读取Excel文件
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 获取表头
        const headers = []
        const range = XLSX.utils.decode_range(worksheet['!ref'])
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })]
          headers[C] = cell ? cell.v : ''
        }
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: headers })
        
        // 去除表头行
        const dataRows = jsonData.slice(1)
        
        // 数据映射和验证
        const mappedData = mapAndValidateData(dataRows)
        resolve(mappedData)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 数据映射和验证
const mapAndValidateData = (data) => {
  // 限制一次最多处理200条数据
  if (data.length > 200) {
    ElMessage.error('最多允许导入200条数据')
    return []
  }

  return data.map((item, index) => {
    const mappedItem = {}
    const errors = []
    
    // 遍历映射关系
    Object.entries(columnMapping).forEach(([excelHeader, fieldName]) => {
      const excelValue = item[excelHeader]
      
      // 处理数据
      if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
        let value = excelValue
        
        // 去除字符串两端空格
        if (typeof value === 'string') {
          value = value.toString().trim()
        }
        
        // 根据字段类型处理
        switch (fieldName) {
          case 'codigoPais':
            if (value.length != 2) {
              errors.push(`国家代码长度必须2个字符`)
            }
            mappedItem[fieldName] = value.toUpperCase()
            break
            
          case 'nifOperador':
            if (value.length > 15) {
              errors.push(`税号长度不能超过15个字符`)
            }
            mappedItem[fieldName] = value
            break
            
          case 'nombreOperador':
            if (value.length > 40) {
              errors.push(`经营者姓名长度不能超过40个字符`)
            }
            mappedItem[fieldName] = value
            break
            
          case 'claveOperacion':
            if (value== '销售') {
              mappedItem[fieldName] = 'E'
            } else if (value== '采购') {
              mappedItem[fieldName] = 'I'
            } else {
              errors.push(`未知的操作代码`)
              mappedItem[fieldName] = value
            }
            break
            
          case 'baseImponible':
          case 'baseImponibleRectificada':
          case 'baseImponibleAnterior':
            // 处理金额字段，要求最多2位小数
            const stringValue = value.toString().trim()
            const cleanValue = stringValue.replace(/,/g, '') // 移除千分位逗号
            
            // 验证数字格式（可选的负号，整数部分，可选的小数部分最多2位）
            const amountRegex = /^-?\d+(\.\d{1,2})?$/
            
            if (!amountRegex.test(cleanValue)) {
              // 尝试转换为数字，如果是数字但格式不对，提示小数位数问题
              const numValue = Number(cleanValue)
              if (!isNaN(numValue)) {
                // 如果是数字但格式不符合，说明小数位数过多
                const parts = cleanValue.split('.')
                if (parts.length > 1 && parts[1].length > 2) {
                  errors.push(`${excelHeader} 最多只能有2位小数，当前有${parts[1].length}位`)
                } else {
                  errors.push(`${excelHeader} 格式错误`)
                }
              } else {
                errors.push(`${excelHeader} 必须是有效的数字`)
              }
              mappedItem[fieldName] = null
            } else {
              // 格式正确，转换为数字并保留2位小数
              mappedItem[fieldName] = parseFloat(Number(cleanValue).toFixed(2))
            }
            break
            
          case 'ejercicioRectificacion':
          case 'periodoRectificacion':
            // 修正信息转为字符串
            mappedItem[fieldName] = value.toString()
            break
            
          default:
            mappedItem[fieldName] = value
        }
      } else {
        // 必填字段验证
        const requiredFields = ['codigoPais', 'nifOperador', 'nombreOperador', 'claveOperacion', 'baseImponible']
        if (requiredFields.includes(fieldName)) {
          errors.push(`${excelHeader} 不能为空`)
        }
        mappedItem[fieldName] = null
      }
    })
    
    // 业务规则验证
    const claveOperacion = mappedItem.claveOperacion
    
    // 规则1：操作代码为C时，必须填写替代接收者信息
    if (claveOperacion === 'C') {
      if (!mappedItem.nifDestinatarioSustituto) {
        errors.push('操作代码为C时必须填写替代最终接收者税号')
      }
      if (!mappedItem.nombreDestinatarioSustituto) {
        errors.push('操作代码为C时必须填写替代最终接收者姓名')
      }
    }
    
    // 规则2：如果填写了修正年度，必须填写所有修正信息
    if (mappedItem.ejercicioRectificacion) {
      if (!mappedItem.periodoRectificacion) {
        errors.push('填写修正的财政年度时必须填写修正的期间')
      }
      if (mappedItem.baseImponibleRectificada === null || mappedItem.baseImponibleRectificada === undefined) {
        errors.push('填写修正的财政年度时必须填写修正后的交易金额')
      }
      if (mappedItem.baseImponibleAnterior === null || mappedItem.baseImponibleAnterior === undefined) {
        errors.push('填写修正的财政年度时必须填写先前申报的交易金额')
      }
    }
    
    // 规则3：修正信息应该一起填写或都不填写
    const hasSomeRectification = mappedItem.ejercicioRectificacion || mappedItem.periodoRectificacion || 
                                mappedItem.baseImponibleRectificada !== null || 
                                mappedItem.baseImponibleAnterior !== null
    
    if (hasSomeRectification) {
      if (!mappedItem.ejercicioRectificacion || !mappedItem.periodoRectificacion || 
          mappedItem.baseImponibleRectificada === null || mappedItem.baseImponibleAnterior === null) {
        errors.push('修正信息必须完整填写：财政年度、期间、修正后金额、先前申报金额')
      }
    }
    
    // 设置行号（Excel中的实际行号，从2开始）
    mappedItem.rowIndex = index + 2
    
    // 设置验证状态
    if (errors.length > 0) {
      mappedItem.errorMessage = errors.join('；')
      mappedItem._isValid = false
    } else {
      mappedItem.errorMessage = null
      mappedItem._isValid = true
    }
    
    return mappedItem
  })
}

// 删除单条数据
const handleDelete = (index) => {
  previewData.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// 重新导入
const handleReset = () => {
  previewData.value = []
  submitResult.value = null
  failedData.value = []
  loading.value = false
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 确认导入
const handleConfirmImport = async () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  
  // 检查是否有无效数据
  if (invalidDataCount.value > 0) {
    ElMessage.warning(`存在 ${invalidDataCount.value} 条异常数据，请处理后再导入`)
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定导入 ${validDataCount.value} 条数据吗？`,
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    
    // 准备导入数据
    const validData = previewData.value.filter(item => item._isValid)
    
    // 调用 addDetails 函数将数据传递给父组件
    // 注意：这里假设 addDetails 只是本地数据处理
    const result = addDetails(validData)
    
    // 设置提交结果
    submitResult.value = {
      title: '导入完成',
      type: 'success',
      message: `成功导入 ${validData.length} 条数据`
    }
    
    // 清空预览数据
    previewData.value = []
    
    // 延迟关闭弹窗（让用户看到成功提示）
    setTimeout(() => {
      importProductDialogRef.value = false
    }, 1500)
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`导入失败: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}

// 批量添加订单明细 - 本地数据处理版本
function addDetails(details) {
  // 检查明细数据是否有欧盟税号
  const validDetails = details.filter(detail => detail.nifOperador)
  
  if (validDetails.length === 0) {
    throw new Error('导入的数据中没有有效的欧盟税号')
  }
  
  // 处理数据格式（如果需要）
  const processedDetails = validDetails.map(detail => {
    return {
      ...detail,
      // 确保金额字段是BigDecimal类型（如果后端需要）
      baseImponible: detail.baseImponible || 0,
      baseImponibleRectificada: detail.baseImponibleRectificada || 0,
      baseImponibleAnterior: detail.baseImponibleAnterior || 0,
      // 移除内部使用的字段
      _isValid: undefined,
      rowIndex: undefined,
      errorMessage: undefined
    }
  })
  
  // 使用 emit 通知父组件数据变化
  emit('changeDetail', processedDetails)
  
  return {
    code: 200,
    data: {
      totalCount: validDetails.length,
      successCount: validDetails.length,
      failedCount: 0,
      failedList: []
    },
    msg: '导入成功'
  }
}

// 弹窗关闭处理
const handleDialogClose = () => {
  handleReset()
  importProductDialogRef.value = false
}

// 导出失败数据
const handleExportFailed = () => {
  if (failedData.value.length === 0) {
    ElMessage.warning('没有异常数据可导出')
    return
  }
  
  try {
    // 准备导出数据
    const exportData = failedData.value.map(item => {
      const exportItem = {}
      // 将字段名映射回Excel列名
      Object.entries(columnMapping).forEach(([excelHeader, fieldName]) => {
        exportItem[excelHeader] = item[fieldName] || ''
      })
      exportItem['导入失败原因'] = item.errorMessage || '未知原因'
      return exportItem
    })
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, '导入失败数据')
    
    // 导出文件
    const fileName = `349导入失败数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

// 暴露方法给父组件
defineExpose({ openImportProductDialog })
</script>

<style scoped lang="scss">
.order-import {
  padding: 20px;
}

.preview-section {
  margin-top: 20px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
    font-weight: 500;
  }
}

.action-buttons {
  margin-top: 25px;
  text-align: center;
  
  .el-button {
    margin: 0 10px;
    min-width: 120px;
  }
}

.result-section {
  margin-top: 20px;
}

.failed-section {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fafafa;
  
  h4 {
    margin-top: 0;
    font-weight: 500;
  }
}

:deep(.el-upload) {
  display: inline-block;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table .cell) {
  padding: 5px 8px;
}

:deep(.el-tag) {
  height: 24px;
  line-height: 22px;
}
</style>