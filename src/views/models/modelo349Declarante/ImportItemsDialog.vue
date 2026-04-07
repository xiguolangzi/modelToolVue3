<template>
  <el-dialog 
    v-model="importProductDialogRef" 
    :title="dialogTitle" 
    width="85%" 
    style="margin-top: 50px !important;"
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    draggable
    @close="handleDialogClose"
    fullscreen
  >
    <div class="order-import-container">
      <!-- 第一步：文件上传 -->
      <div v-if="currentStep === 1" class="upload-step">
        <div class="step-header">
          <h2>第一步：上传Excel文件</h2>
        </div>
        
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            accept=".xlsx,.xls"
            drag
            action=""
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                <el-text type="warning">支持 .xlsx, .xls 格式，最大10000条数据, 导入表格必须包含标准模板中的重要字段列名</el-text>
              </div>
            </template>
          </el-upload>
        </div>
        
        <div class="step-actions">
          <el-button @click="importProductDialogRef = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="goToStep2"
            :disabled="!currentFile"
          >
            下一步：数据验证
          </el-button>

          <el-divider direction="vertical" />

          <el-link 
            type="primary" 
            :underline="false" 
            @click="importTemplate"
            class="template-link"
          >
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-link>
        </div>
      </div>

      <!-- 第二步：数据预览 -->
      <div v-if="currentStep === 2" class="preview-step">
        <div class="step-header">
          <h2>第二步：数据预览与验证</h2>
          <div class="step-stats">
            <el-tag type="success" size="large">
              总数据：{{ totalRows }} 条
            </el-tag>
            <el-tag type="success" size="large" style="margin-left: 10px;">
              有效：{{ validDataCount }} 条
            </el-tag>
            <el-tag v-if="invalidDataCount > 0" type="danger" size="large" style="margin-left: 10px;">
              异常：{{ invalidDataCount }} 条
            </el-tag>
            <el-button 
              type="warning" 
              size="small" 
              style="margin-left: 20px;"
              @click="currentStep = 1"
            >
              重新上传
            </el-button>
          </div>
        </div>

        <div class="preview-section">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="searchText"
                placeholder="搜索公司名称、税号..."
                clearable
                style="width: 300px;"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-select 
                v-model="filterStatus" 
                placeholder="筛选状态"
                style="width: 150px; margin-left: 10px;"
                @change="handleFilter"
                clearable
              >
                <el-option label="全部" value="" />
                <el-option label="正常数据" value="valid" />
                <el-option label="异常数据" value="invalid" />
              </el-select>
            </div>
            
            <div class="toolbar-right">
              <el-button 
                v-if="invalidDataCount > 0"
                type="danger" 
                @click="removeAllInvalid"
              >
                删除所有异常数据
              </el-button>
              <el-button 
                type="success" 
                @click="handleExportInvalid"
                :disabled="invalidDataCount === 0"
              >
                导出异常数据
              </el-button>
              <el-button 
                type="primary" 
                @click="handleConfirmImport"
                :disabled="invalidDataCount > 0 || previewData.length === 0"
              >
                确认导入
              </el-button>
            </div>
          </div>

          <div class="table-container">
            <el-table
              :data="paginatedData"
              border
              style="width: 100%;"
              :max-height="tableHeight"
              :row-style="tableRowStyle"
              highlight-current-row
              v-loading="tableLoading"
            >
              <el-table-column prop="rowIndex" label="行号" width="80" align="center" fixed="left">
                <template #default="scope">
                  <span :class="{'invalid-row': !scope.row._isValid}">
                    {{ scope.row.rowIndex }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column
                v-for="column in tableColumns"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :min-width="column.width"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <span :class="{'invalid-cell': !scope.row._isValid}">
                    {{ formatCellValue(scope.row[column.prop], column.prop) }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column prop="_isValid" label="状态" width="100" align="center" fixed="right">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row._isValid ? 'success' : 'danger'" 
                    size="small"
                    effect="dark"
                  >
                    {{ scope.row._isValid ? '正常' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column prop="errorMessage" label="错误原因" width="250" fixed="right">
                <template #default="scope">
                  <div v-if="scope.row.errorMessage" class="error-message">
                    <el-tooltip :content="scope.row.errorMessage" placement="top">
                      <span style="color: #f56c6c; cursor: help;">
                        {{ truncateError(scope.row.errorMessage) }}
                      </span>
                    </el-tooltip>
                  </div>
                  <el-icon v-else style="color: #67c23a;"><CircleCheck /></el-icon>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="!scope.row._isValid"
                    link
                    type="danger"
                    size="small"
                    @click="handleDelete(scope.row.rowIndex)"
                  >
                    删除
                  </el-button>
                  <span v-else style="color: #999; font-size: 12px;">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[20, 50, 100, 200, 500]"
              :total="filteredData.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <!-- 第三步：数据处理进度 -->
      <div v-if="currentStep === 3" class="processing-step">
        <div class="step-header">
          <h2>第三步：数据处理与验证</h2>
          <el-button 
            type="info" 
            size="small"
            @click="cancelProcessing"
            :disabled="!isProcessing"
          >
            取消处理
          </el-button>
        </div>

        <div class="progress-container">
          <div class="progress-overview">
            <div class="progress-card">
              <div class="progress-title">处理进度</div>
              <div class="progress-main">
                <el-progress 
                  type="circle" 
                  :percentage="progressPercentage" 
                  :width="120"
                  :stroke-width="10"
                  :color="progressColor"
                >
                  <template #default>
                    <div class="progress-text">
                      <div class="percentage">{{ progressPercentage }}%</div>
                      <div class="detail">已完成</div>
                    </div>
                  </template>
                </el-progress>
              </div>
              <div class="progress-info">
                <div class="info-item">
                  <span class="label">总数据：</span>
                  <span class="value">{{ totalRowsToProcess }}</span>
                </div>
                <div class="info-item">
                  <span class="label">已处理：</span>
                  <span class="value">{{ processedRows }}</span>
                </div>
                <div class="info-item">
                  <span class="label">有效数据：</span>
                  <span class="value">{{ processingStats.valid }}</span>
                </div>
              </div>
            </div>

            <div class="stats-card">
              <div class="stats-title">处理统计</div>
              <div class="stats-content">
                <div class="stat-item success">
                  <el-icon><CircleCheck /></el-icon>
                  <div class="stat-details">
                    <div class="stat-count">{{ processingStats.valid }}</div>
                    <div class="stat-label">有效</div>
                  </div>
                </div>
                <div class="stat-item error">
                  <el-icon><CircleClose /></el-icon>
                  <div class="stat-details">
                    <div class="stat-count">{{ processingStats.invalid }}</div>
                    <div class="stat-label">异常</div>
                  </div>
                </div>
                <div class="stat-item processing">
                  <el-icon><Loading /></el-icon>
                  <div class="stat-details">
                    <div class="stat-count">{{ processingStats.processing }}</div>
                    <div class="stat-label">处理中</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-progress">
            <h3>数据处理详情</h3>
            <div class="progress-list">
              <div 
                v-for="(chunk, index) in chunkProgress" 
                :key="index"
                class="chunk-item"
                :class="{
                  'chunk-success': chunk.status === 'success',
                  'chunk-error': chunk.status === 'error',
                  'chunk-processing': chunk.status === 'processing',
                  'chunk-pending': chunk.status === 'pending'
                }"
              >
                <div class="chunk-header">
                  <span class="chunk-number">批次 {{ index + 1 }}</span>
                  <span class="chunk-status">
                    <el-icon v-if="chunk.status === 'success'" color="#67C23A"><CircleCheck /></el-icon>
                    <el-icon v-if="chunk.status === 'error'" color="#F56C6C"><CircleClose /></el-icon>
                    <el-icon v-if="chunk.status === 'processing'" color="#409EFF"><Loading /></el-icon>
                    <el-icon v-if="chunk.status === 'pending'" color="#909399"><Clock /></el-icon>
                  </span>
                </div>
                <div class="chunk-info">
                  <span class="chunk-range">数据: {{ chunk.start }}-{{ chunk.end }}</span>
                  <span class="chunk-count">共 {{ chunk.count }} 条</span>
                </div>
                <div v-if="chunk.status === 'processing'" class="chunk-progress">
                  <el-progress 
                    :percentage="chunk.progress" 
                    :stroke-width="4"
                    :show-text="false"
                  />
                </div>
                <div v-if="chunk.errorMessage" class="chunk-error-msg">
                  {{ chunk.errorMessage }}
                </div>
              </div>
            </div>
          </div>

          <div class="log-container" v-if="processingLogs.length > 0">
            <h3>处理日志</h3>
            <div class="log-list">
              <div 
                v-for="(log, index) in processingLogs" 
                :key="index"
                class="log-item"
                :class="`log-${log.type}`"
              >
                <div class="log-time">{{ log.time }}</div>
                <div class="log-content">{{ log.message }}</div>
              </div>
            </div>
          </div>

          <div v-if="!isProcessing" class="processing-complete">
            <div v-if="processingStats.invalid === 0" class="complete-success">
              <el-result
                icon="success"
                title="数据处理完成"
                :sub-title="`成功处理 ${processingStats.valid} 条数据，无异常数据`"
              >
                <template #extra>
                  <el-button type="primary" @click="goToDataPreview">查看数据详情</el-button>
                  <el-button @click="currentStep = 1">重新上传</el-button>
                </template>
              </el-result>
            </div>
            <div v-else class="complete-with-error">
              <el-result
                icon="warning"
                title="数据处理完成"
                :sub-title="`有效数据: ${processingStats.valid} 条，异常数据: ${processingStats.invalid} 条`"
              >
                <template #extra>
                  <div class="result-actions">
                    <el-button type="primary" @click="goToDataPreview">查看数据详情</el-button>
                    <el-button type="success" @click="exportAllInvalidData">导出所有异常数据</el-button>
                    <el-button @click="currentStep = 1">重新上传</el-button>
                  </div>
                </template>
              </el-result>
              
              <div v-if="invalidDataDuringProcessing.length > 0" class="error-summary">
                <h4>异常数据摘要（前10条）</h4>
                <el-table
                  :data="invalidDataDuringProcessing.slice(0, 10)"
                  border
                  size="small"
                  style="width: 100%; margin-top: 10px;"
                  max-height="200"
                >
                  <el-table-column prop="rowIndex" label="行号" width="80" />
                  <el-table-column prop="errorMessage" label="异常原因" />
                  <el-table-column prop="nifOperador" label="税号" />
                  <el-table-column prop="nombreOperador" label="公司名称" />
                </el-table>
                <div v-if="invalidDataDuringProcessing.length > 10" style="text-align: center; margin-top: 10px;">
                  还有 {{ invalidDataDuringProcessing.length - 10 }} 条异常记录...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox, genFileId } from 'element-plus';
import { 
  UploadFilled, Download, Search, CircleCheck, CircleClose, 
  Loading, Clock
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { tableRowIdGenerator } from '@/utils/idGenerator'

const { proxy } = getCurrentInstance()

const props = defineProps({
  detailList: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['changeDetail'])

// 常量
const MAX_LIMIT = 10000
const CHUNK_SIZE = 500

// 响应式数据
const importProductDialogRef = ref(null)
const uploadRef = ref()
const currentFile = ref(null)
const fileList = ref([])
const currentStep = ref(1)
const filteredData = ref([])
const previewData = ref([])
const invalidDataDuringProcessing = ref([])
const currentPage = ref(1)
const pageSize = ref(100)
const searchText = ref('')
const filterStatus = ref('')
const tableLoading = ref(false)
const isProcessing = ref(false)
const totalRowsToProcess = ref(0)
const processedRows = ref(0)
const processingStats = ref({ valid: 0, invalid: 0, processing: 0 })
const chunkProgress = ref([])
const processingLogs = ref([])
const cancelProcessingToken = ref(null)

// 计算属性
const dialogTitle = computed(() => {
  const titles = {
    1: '导入Excel标准明细 - 上传文件',
    2: '导入Excel标准明细 - 数据预览',
    3: '导入Excel标准明细 - 数据处理'
  }
  return titles[currentStep.value]
})

const totalRows = computed(() => previewData.value.length)

const validDataCount = computed(() => {
  return previewData.value.filter(item => item._isValid).length
})

const invalidDataCount = computed(() => {
  return previewData.value.filter(item => !item._isValid).length
})

// 排序后的筛选数据（按行号升序）
const sortedFilteredData = computed(() => {
  return [...filteredData.value].sort((a, b) => a.rowIndex - b.rowIndex)
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedFilteredData.value.slice(start, end)
})

const progressPercentage = computed(() => {
  if (totalRowsToProcess.value === 0) return 0
  return Math.round((processedRows.value / totalRowsToProcess.value) * 100)
})

const progressColor = computed(() => {
  if (processingStats.value.invalid > 0 && processingStats.value.valid === 0) return '#f56c6c'
  if (processingStats.value.invalid > 0) return '#e6a23c'
  return '#409eff'
})

const tableHeight = computed(() => window.innerHeight - 400)

// 表格列配置
const tableColumns = [
  { prop: 'codigoPais', label: '欧盟税号-国家代码', width: 120 },
  { prop: 'nifOperador', label: '欧盟税号-编号', width: 130 },
  { prop: 'nombreOperador', label: '经营者姓名', width: 150 },
  { prop: 'claveOperacion', label: '操作代码', width: 100 },
  { prop: 'baseImponible', label: '交易金额', width: 110 },
  { prop: 'ejercicioRectificacion', label: '修正的财政年度', width: 130 },
  { prop: 'periodoRectificacion', label: '修正的期间', width: 100 },
  { prop: 'baseImponibleRectificada', label: '修正后交易金额', width: 120 },
  { prop: 'baseImponibleAnterior', label: '先前申报金额', width: 120 },
  { prop: 'nifDestinatarioSustituto', label: '替代接收者税号', width: 130 },
  { prop: 'nombreDestinatarioSustituto', label: '替代接收者姓名', width: 150 }
]

// Excel列名映射
const columnMapping = {
  "欧盟税号-国家代码": 'codigoPais',
  "欧盟税号-编号": 'nifOperador',
  "经营者姓名": 'nombreOperador',
  "操作代码": 'claveOperacion',
  "交易金额": 'baseImponible',
  "修正的财政年度": 'ejercicioRectificacion',
  "修正的期间": 'periodoRectificacion',
  "修正后的交易金额": 'baseImponibleRectificada',
  "先前申报的交易金额": 'baseImponibleAnterior',
  "替代最终接收者税号": 'nifDestinatarioSustituto',
  "替代最终接收者姓名": 'nombreDestinatarioSustituto'
}

// 允许的操作代码
const validClaveOperacion = ['E', 'M', 'H', 'T', 'A', 'S', 'I', 'R', 'D', 'C']

// 方法
function openImportProductDialog() {
  importProductDialogRef.value = true
  resetImport()
}

function importTemplate() {
  proxy.download("models/modelo349OperadorIntra/importTemplate", {}, `349导入明细模板.xlsx`)
}

const handleFileChange = async (file) => {
  if (!file) return
  const actualFile = file.raw || file
  const fileType = actualFile.name.split('.').pop().toLowerCase()
  
  if (!['xlsx', 'xls'].includes(fileType)) {
    ElMessage.error('只能上传 .xlsx 或 .xls 格式的文件')
    return
  }

  if (actualFile.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return
  }

  currentFile.value = actualFile
  fileList.value = [file]
  ElMessage.success('文件上传成功，准备进行数据解析...')
}

const handleExceed = (files) => {
  uploadRef.value?.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  handleFileChange({ uid: file.uid, name: file.name, size: file.size, raw: file, status: 'ready' })
}

const handleFileRemove = () => {
  currentFile.value = null
  fileList.value = []
}

const goToStep2 = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先上传文件')
    return
  }

  try {
    currentStep.value = 3
    await startDataProcessing()
  } catch (error) {
    ElMessage.error(`文件处理失败: ${error.message}`)
    currentStep.value = 1
  }
}

const startDataProcessing = async () => {
  isProcessing.value = true
  processedRows.value = 0
  processingStats.value = { valid: 0, invalid: 0, processing: 0 }
  chunkProgress.value = []
  processingLogs.value = []
  previewData.value = []
  invalidDataDuringProcessing.value = []
  cancelProcessingToken.value = null
  
  addProcessingLog('开始解析Excel文件...', 'info')
  
  try {
    const rawExcelData = await readExcelFile(currentFile.value)
    
    if (rawExcelData.length === 0) {
      addProcessingLog('Excel文件中没有数据或格式不正确', 'error')
      ElMessage.error('Excel文件中没有数据或格式不正确')
      isProcessing.value = false
      goToDataPreview()
      return
    }

    if (rawExcelData.length > MAX_LIMIT) {
      addProcessingLog(`数据量(${rawExcelData.length})超过10000条限制`, 'error')
      ElMessage.error(`数据量(${rawExcelData.length})超过10000条限制，请分批导入`)
      isProcessing.value = false
      goToDataPreview()
      return
    }

    totalRowsToProcess.value = rawExcelData.length
    addProcessingLog(`成功读取 ${rawExcelData.length} 条原始数据，开始数据处理...`, 'success')
    
    const totalChunks = Math.ceil(rawExcelData.length / CHUNK_SIZE)
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, rawExcelData.length)
      chunkProgress.value.push({
        start: start + 1,
        end: end,
        count: end - start,
        status: 'pending',
        progress: 0,
        errorMessage: null
      })
    }
    
    for (let i = 0; i < totalChunks; i++) {
      if (cancelProcessingToken.value === 'cancelled') {
        addProcessingLog('数据处理已被取消', 'warning')
        break
      }
      
      const chunkIndex = i
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, rawExcelData.length)
      const chunkData = rawExcelData.slice(start, end)
      
      chunkProgress.value[chunkIndex].status = 'processing'
      addProcessingLog(`开始处理第 ${chunkIndex + 1} 批数据 (${start + 1}-${end})`, 'info')
      
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(progressInterval)
        }
        chunkProgress.value[chunkIndex].progress = Math.min(progress, 100)
      }, 100)
      
      try {
        const result = await processDataChunk(chunkData, start)
        
        processingStats.value.valid += result.validCount
        processingStats.value.invalid += result.invalidCount
        processedRows.value = end
        
        if (result.invalidData?.length > 0) {
          invalidDataDuringProcessing.value.push(...result.invalidData)
        }
        
        clearInterval(progressInterval)
        chunkProgress.value[chunkIndex].status = 'success'
        chunkProgress.value[chunkIndex].progress = 100
        
        addProcessingLog(`第 ${chunkIndex + 1} 批处理完成，有效: ${result.validCount}，异常: ${result.invalidCount}`, 'success')
        await delay(300)
      } catch (error) {
        clearInterval(progressInterval)
        chunkProgress.value[chunkIndex].status = 'error'
        chunkProgress.value[chunkIndex].errorMessage = error.message
        processingStats.value.invalid += chunkData.length
        processedRows.value = end
        addProcessingLog(`第 ${chunkIndex + 1} 批处理失败: ${error.message}`, 'error')
      }
    }
    
    isProcessing.value = false

    // 按行号升序排序
    previewData.value.sort((a, b) => a.rowIndex - b.rowIndex)
    filteredData.value = [...previewData.value]
    
    addProcessingLog(`数据处理完成！有效数据：${processingStats.value.valid} 条，异常数据：${processingStats.value.invalid} 条`, 'success')
    goToDataPreview()
    
  } catch (error) {
    isProcessing.value = false
    addProcessingLog(`数据处理出错: ${error.message}`, 'error')
    ElMessage.error(`数据处理失败: ${error.message}`)
    goToDataPreview()
  }
}

const processDataChunk = (chunkData, startIndex) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let validCount = 0
      let invalidCount = 0
      const invalidData = []
      const processedChunk = []
      
      chunkData.forEach((item, index) => {
        const excelRowIndex = startIndex + index + 2
        const processedItem = validateAndMapData(item, excelRowIndex)
        processedChunk.push(processedItem)
        
        if (processedItem._isValid) {
          validCount++
        } else {
          invalidCount++
          invalidData.push(processedItem)
        }
      })
      
      previewData.value.push(...processedChunk)
      
      resolve({ validCount, invalidCount, invalidData })
    }, 500 + Math.random() * 1000)
  })
}

const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        const headers = []
        const range = XLSX.utils.decode_range(worksheet['!ref'])
        const maxCols = 20
        const endCol = Math.min(range.e.c, maxCols - 1)

        for (let C = range.s.c; C <= endCol; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })]
          headers[C] = cell ? String(cell.v).trim() : ''
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: headers })
        const dataRows = jsonData.slice(1).filter(row => {
          return Object.values(row).some(value => 
            value !== undefined && value !== null && value.toString().trim() !== ''
          )
        })
        
        resolve(dataRows)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const validateAndMapData = (item, rowIndex) => {
  const mappedItem = {}
  const errors = []
  
  Object.entries(columnMapping).forEach(([excelHeader, fieldName]) => {
    const excelValue = item[excelHeader]
    
    if (excelValue !== undefined && excelValue !== null && excelValue !== '') {
      let value = excelValue
      
      if (typeof value === 'string') {
        value = value.toString().trim()
      }
      
      switch (fieldName) {
        case 'codigoPais':
          if (value.length !== 2) {
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
          mappedItem[fieldName] = value.length > 40 ? value.substring(0, 40) : value
          break
          
        case 'claveOperacion':
          if (!validClaveOperacion.includes(value)) {
            errors.push(`未知的操作代码: ${value}`)
          }
          mappedItem[fieldName] = value
          break
          
        case 'baseImponible':
        case 'baseImponibleRectificada':
        case 'baseImponibleAnterior':
          const cleanValue = String(value).trim().replace(/,/g, '')
          const numValue = Number(cleanValue)
          
          if (isNaN(numValue)) {
            errors.push(`${excelHeader} 必须是有效的数字`)
            mappedItem[fieldName] = null
          } else {
            const decimalMatch = cleanValue.match(/\.(\d+)$/)
            if (decimalMatch && decimalMatch[1].length > 2) {
              errors.push(`${excelHeader} 最多只能有2位小数`)
            }
            mappedItem[fieldName] = parseFloat(numValue.toFixed(2))
          }
          break
          
        default:
          mappedItem[fieldName] = value
      }
    } else {
      const requiredFields = ['codigoPais', 'nifOperador', 'nombreOperador', 'claveOperacion', 'baseImponible']
      if (requiredFields.includes(fieldName)) {
        errors.push(`${excelHeader} 不能为空`)
      }
      mappedItem[fieldName] = null
    }
  })
  
  // 业务规则验证
  const claveOperacion = mappedItem.claveOperacion
  
  if (claveOperacion === 'C') {
    if (!mappedItem.nifDestinatarioSustituto) {
      errors.push('操作代码为C时必须填写替代最终接收者税号')
    }
    if (!mappedItem.nombreDestinatarioSustituto) {
      errors.push('操作代码为C时必须填写替代最终接收者姓名')
    }
  }
  
  const hasSomeRectification = mappedItem.ejercicioRectificacion || mappedItem.periodoRectificacion || 
                              mappedItem.baseImponibleRectificada !== null || 
                              mappedItem.baseImponibleAnterior !== null
  
  if (hasSomeRectification) {
    if (!mappedItem.ejercicioRectificacion || !mappedItem.periodoRectificacion || 
        mappedItem.baseImponibleRectificada === null || mappedItem.baseImponibleAnterior === null) {
      errors.push('修正信息必须完整填写')
    }
  }
  
  mappedItem.rowIndex = rowIndex
  mappedItem.errorMessage = errors.length > 0 ? errors.join('；') : null
  mappedItem._isValid = errors.length === 0
  mappedItem.id = tableRowIdGenerator.generateId('import')
  
  return mappedItem
}

const cancelProcessing = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消数据处理吗？已处理的数据将会保留。',
      '确认取消',
      { confirmButtonText: '确定取消', cancelButtonText: '继续处理', type: 'warning' }
    )
    cancelProcessingToken.value = 'cancelled'
    isProcessing.value = false
    addProcessingLog('用户取消了数据处理操作', 'warning')
  } catch (error) {}
}

const goToDataPreview = () => {
  currentStep.value = 2
}

const handleDelete = (rowIndex) => {
  const index = previewData.value.findIndex(item => item.rowIndex === rowIndex)
  if (index !== -1) {
    previewData.value.splice(index, 1)
    handleSearch()
    ElMessage.success('删除成功')
  }
}

const removeAllInvalid = async () => {
  if (invalidDataCount.value === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定删除所有 ${invalidDataCount.value} 条异常数据吗？`,
      '确认删除',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    
    previewData.value = previewData.value.filter(item => item._isValid)
    filteredData.value = [...previewData.value]
    currentPage.value = 1
    ElMessage.success(`已删除 ${invalidDataCount.value} 条异常数据`)
  } catch (error) {}
}

const handleConfirmImport = async () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  
  if (invalidDataCount.value > 0) {
    ElMessage.warning(`存在 ${invalidDataCount.value} 条异常数据，请处理后再导入`)
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定导入 ${validDataCount.value} 条数据吗？`,
      '确认导入',
      { confirmButtonText: '确认导入', cancelButtonText: '取消', type: 'warning' }
    )
    await handleFinalImport()
  } catch (error) {}
}

const handleFinalImport = async () => {
  try {
    const validData = previewData.value.filter(item => item._isValid)
    
    if (validData.length === 0) {
      ElMessage.warning('没有有效数据可导入')
      return
    }
    
    emit('changeDetail', validData)
    ElMessage.success(`成功导入 ${validData.length} 条数据`)
    importProductDialogRef.value = false
  } catch (error) {
    ElMessage.error(`导入数据时出错: ${error.message}`)
  }
}

const exportAllInvalidData = () => {
  const invalidData = previewData.value.filter(item => !item._isValid)
  exportInvalidData(invalidData, '所有异常数据')
}

const handleExportInvalid = () => {
  const invalidData = previewData.value.filter(item => !item._isValid)
  exportInvalidData(invalidData, '异常数据')
}

const exportInvalidData = (data, type = '异常数据') => {
  if (data.length === 0) {
    ElMessage.warning(`没有${type}可导出`)
    return
  }
  
  try {
    const exportData = data.map(item => {
      const exportItem = {}
      Object.entries(columnMapping).forEach(([excelHeader, fieldName]) => {
        exportItem[excelHeader] = item[fieldName] ?? ''
      })
      exportItem['异常原因'] = item.errorMessage || '未知原因'
      exportItem['Excel行号'] = item.rowIndex
      return exportItem
    })
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, type)
    
    const fileName = `349_${type}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
    ElMessage.success(`导出成功，共 ${data.length} 条${type}`)
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

const handleSearch = () => {
  tableLoading.value = true
  
  let results = [...previewData.value]
  
  if (searchText.value.trim()) {
    const searchLower = searchText.value.toLowerCase()
    results = results.filter(item => 
      (item.nombreOperador?.toLowerCase().includes(searchLower)) ||
      (item.nifOperador?.toLowerCase().includes(searchLower))
    )
  }
  
  if (filterStatus.value === 'valid') {
    results = results.filter(item => item._isValid)
  } else if (filterStatus.value === 'invalid') {
    results = results.filter(item => !item._isValid)
  }
  
  filteredData.value = results
  currentPage.value = 1
  setTimeout(() => { tableLoading.value = false }, 300)
}

const handleFilter = () => handleSearch()

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return ''
  
  if (['baseImponible', 'baseImponibleRectificada', 'baseImponibleAnterior'].includes(column)) {
    return parseFloat(value).toFixed(2)
  }
  
  return String(value)
}

const truncateError = (error) => {
  return error.length > 50 ? error.substring(0, 50) + '...' : error
}

const addProcessingLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  processingLogs.value.unshift({ time, message, type })
  if (processingLogs.value.length > 100) {
    processingLogs.value = processingLogs.value.slice(0, 100)
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const handleDialogClose = () => {
  resetImport()
  importProductDialogRef.value = false
}

const tableRowStyle = ({ row }) => {
  if (!row._isValid) {
    return {
      background: 'linear-gradient(45deg, #fff2f2 25%, #ffeaea 25%, #ffeaea 50%, #fff2f2 50%, #fff2f2 75%, #ffeaea 75%, #ffeaea)',
      backgroundSize: '20px 20px'
    }
  }
  return {}
}

const resetImport = () => {
  currentStep.value = 1
  currentFile.value = null
  fileList.value = []
  previewData.value = []
  filteredData.value = []
  searchText.value = ''
  filterStatus.value = ''
  currentPage.value = 1
  pageSize.value = 100
  
  isProcessing.value = false
  totalRowsToProcess.value = 0
  processedRows.value = 0
  processingStats.value = { valid: 0, invalid: 0, processing: 0 }
  chunkProgress.value = []
  processingLogs.value = []
  invalidDataDuringProcessing.value = []
  cancelProcessingToken.value = null
  
  uploadRef.value?.clearFiles()
}

defineExpose({ openImportProductDialog })
</script>

<style scoped lang="scss">
.order-import-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  .step-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;
    
    h2 {
      margin: 0 0 10px 0;
      color: #303133;
      font-weight: 500;
    }
    
    .step-stats {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
  }
}

.upload-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .upload-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 40px;
    
    :deep(.el-upload) {
      width: 100%;
      max-width: 600px;
      
      .el-upload-dragger {
        width: 100%;
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        
        .el-icon--upload {
          font-size: 48px;
          margin-bottom: 20px;
          color: #409eff;
        }
      }
    }
  }
  
  .step-actions {
    margin-top: 30px;
    text-align: center;
  }
}

.preview-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  
  .table-container {
    flex: 1;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    
    :deep(.el-table) {
      height: 100%;
      
      .invalid-row {
        font-weight: bold;
        color: #f56c6c;
      }
      
      .invalid-cell {
        color: #f56c6c;
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}

.processing-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  .progress-container {
    flex: 1;
    padding: 20px;
  }
  
  .progress-overview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .progress-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .progress-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .progress-main {
      display: flex;
      justify-content: center;
      margin: 20px 0;
      
      .progress-text {
        text-align: center;
        
        .percentage {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
        }
      }
    }
    
    .progress-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      text-align: center;
      
      .info-item {
        .label { color: #909399; font-size: 12px; }
        .value { display: block; font-size: 18px; font-weight: bold; }
      }
    }
  }
  
  .stats-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .stats-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .stats-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      
      .stat-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-radius: 6px;
        
        &.success { background: #f0f9ff; border: 1px solid #e0f0ff; .el-icon { color: #67c23a; } }
        &.error { background: #fef0f0; border: 1px solid #fde2e2; .el-icon { color: #f56c6c; } }
        &.processing { background: #fdf6ec; border: 1px solid #fbe8d4; .el-icon { color: #e6a23c; } }
        
        .el-icon { font-size: 24px; margin-right: 10px; }
        
        .stat-details {
          .stat-count { font-size: 18px; font-weight: bold; }
          .stat-label { font-size: 12px; color: #909399; }
        }
      }
    }
  }
  
  .detail-progress {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h3 { margin: 0 0 15px 0; }
    
    .progress-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      
      .chunk-item {
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ebeef5;
        
        &.chunk-success { background: #f0f9ff; border-color: #e0f0ff; }
        &.chunk-error { background: #fef0f0; border-color: #fde2e2; }
        &.chunk-processing { background: #fdf6ec; border-color: #fbe8d4; }
        &.chunk-pending { background: #f5f7fa; border-color: #ebeef5; }
        
        .chunk-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        
        .chunk-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .chunk-error-msg {
          font-size: 12px;
          color: #f56c6c;
          margin-top: 5px;
        }
      }
    }
  }
  
  .log-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h3 { margin: 0 0 15px 0; }
    
    .log-list {
      max-height: 300px;
      overflow-y: auto;
      
      .log-item {
        display: flex;
        padding: 8px 10px;
        border-bottom: 1px solid #f0f0f0;
        
        &.log-info { background: #f4f4f5; }
        &.log-success { background: #f0f9ff; }
        &.log-error { background: #fef0f0; }
        &.log-warning { background: #fdf6ec; }
        
        .log-time {
          min-width: 80px;
          color: #909399;
          font-size: 12px;
        }
        
        .log-content {
          flex: 1;
          font-size: 13px;
        }
      }
    }
  }
  
  .processing-complete {
    margin-top: 30px;
    
    .complete-success, .complete-with-error {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    .complete-with-error {
      .result-actions {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
      }
      
      .error-summary {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
        
        h4 { margin: 0 0 15px 0; color: #f56c6c; }
      }
    }
  }
}

:deep(.el-table__row:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>