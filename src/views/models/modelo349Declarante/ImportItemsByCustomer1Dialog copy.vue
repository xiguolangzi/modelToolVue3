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

        <!-- 数据预览表格 -->
        <div class="preview-section">
          <!-- 表格工具栏 -->
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

          <!-- 数据表格 -->
          <div class="table-container">
            <el-table
              :data="currentPageData"
              border
              style="width: 100%;"
              :max-height="tableHeight"
              :row-style="tableRowStyle"
              highlight-current-row
              v-loading="tableLoading"
              :default-sort="{ prop: '_isValid', order: 'descending' }"
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
              
              <el-table-column prop="_isValid" label="状态" width="100" align="center" fixed="right" sortable>
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

          <!-- 分页器 -->
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

        <!-- 进度展示 -->
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

          <!-- 详细进度 -->
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

          <!-- 实时日志 -->
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

          <!-- 处理完成后的操作 -->
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox, genFileId  } from 'element-plus';
import { 
  UploadFilled, Download, Search, CircleCheck, CircleClose, 
  Loading, Clock, Document 
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

// 常量数据
const MAX_LIMIT = 10000;  // 最大导入数量
const CHUNK_SIZE = 500;   // 每批次处理的数据量


// 响应式数据
const importProductDialogRef = ref(null)
const uploadRef = ref()
const currentFile = ref(null)
const fileList = ref([])

// 步骤控制
const currentStep = ref(1)
const dialogTitle = computed(() => {
  const titles = {
    1: '导入Excel自定义1明细 - 上传文件',
    2: '导入Excel自定义1明细 - 数据预览',
    3: '导入Excel自定义1明细 - 数据处理'
  }
  return titles[currentStep.value]
})

// 数据相关
const rawData = ref([])          // 原始数据
const filteredData = ref([])     // 筛选后的数据
const previewData = ref([])      // 处理后的预览数据
const invalidDataDuringProcessing = ref([]) // 处理过程中的异常数据

// 分页相关
const currentPage = ref(1)
const pageSize = ref(100)
const totalRows = computed(() => previewData.value.length)

// 搜索和筛选
const searchText = ref('')
const filterStatus = ref('')

// 数据处理进度相关
const isProcessing = ref(false);    // 是否正在处理数据
const totalRowsToProcess = ref(0);  // 总行数
const processedRows = ref(0);       // 已处理行数
const processingStats = ref({
  valid: 0,
  invalid: 0,
  processing: 0
});                                 // 数据处理统计
const chunkProgress = ref([]);      // 数据处理进度
const processingLogs = ref([]);     // 处理日志
const cancelProcessingToken = ref(null);  // 用于取消数据处理

// 计算属性
// 进度百分比
const progressPercentage = computed(() => {
  if (totalRowsToProcess.value === 0) return 0
  return Math.round((processedRows.value / totalRowsToProcess.value) * 100)
})
// 进度颜色
const progressColor = computed(() => {
  if (processingStats.value.invalid > 0 && processingStats.value.valid === 0) return '#f56c6c'
  if (processingStats.value.invalid > 0) return '#e6a23c'
  return '#409eff'
})
// 验证通过数据数量
const validDataCount = computed(() => {
  return previewData.value.filter(item => item._isValid).length
})
// 验证失败数据数量
const invalidDataCount = computed(() => {
  return previewData.value.filter(item => !item._isValid).length
})

// 分页计算
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 表格高度（动态计算）
const tableHeight = computed(() => {
  return window.innerHeight - 400
})

// 表格列配置
const tableColumns = [
  { prop: 'codigoPais', label: '欧盟国家', width: 120 },
  { prop: 'nifOperador', label: '欧盟税号', width: 130 },
  { prop: 'nombreOperador', label: '公司名称', width: 180 },
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
  if (!row._isValid) {
    return {
      background: 'linear-gradient(45deg, #fff2f2 25%, #ffeaea 25%, #ffeaea 50%, #fff2f2 50%, #fff2f2 75%, #ffeaea 75%, #ffeaea)',
      backgroundSize: '20px 20px'
    }
  }
  return {}
}

// 表格加载状态
const tableLoading = ref(false)

/** 打开弹窗 */
function openImportProductDialog() {
  importProductDialogRef.value = true
  resetImport()
}

/** 下载模板 */
function importTemplate() {
  proxy.download("models/modelo349OperadorIntra/importCustomer1Template", {}, `349导入明细模板.xlsx`)
}

// 处理文件选择
const handleFileChange = async (file) => {
  if (!file) return

  // 确保能正确获取到文件对象
  const actualFile = file.raw || file;
  
  const fileType = actualFile.name.split('.').pop().toLowerCase()
  if (!['xlsx', 'xls'].includes(fileType)) {
    ElMessage.error('只能上传 .xlsx 或 .xls 格式的文件')
    return
  }

  if (actualFile.size > 10 * 1024 * 1024) { // 限制10MB
    ElMessage.error('文件大小不能超过10MB')
    return
  }

  currentFile.value = actualFile
  fileList.value = [file]
  
  ElMessage.success('文件上传成功，准备进行数据解析...')
}

const handleExceed = (files, uploadFiles) => {
  // 清除当前文件
  uploadRef.value.clearFiles();
  
  // 手动触发文件选择
  const file = files[0];
  file.uid = genFileId();
  
  // 模拟 on-change 事件
  const uploadFile = {
    uid: file.uid,
    name: file.name,
    size: file.size,
    raw: file,
    status: 'ready'
  };
  
  handleFileChange(uploadFile);
};

// 处理文件移除
const handleFileRemove = () => {
  currentFile.value = null
  fileList.value = []
}

// 跳转到数据处理
const goToStep2 = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先上传文件')
    return
  }

  try {
    currentStep.value = 3 // 跳转到数据处理进度页面
    await startDataProcessing()
    
  } catch (error) {
    ElMessage.error(`文件处理失败: ${error.message}`)
    currentStep.value = 1
  }
}

// 开始数据处理
const startDataProcessing = async () => {
  isProcessing.value = true
  processedRows.value = 0
  processingStats.value = {
    valid: 0,
    invalid: 0,
    processing: 0
  }
  chunkProgress.value = []
  processingLogs.value = []
  previewData.value = []
  invalidDataDuringProcessing.value = []
  
  addProcessingLog('开始解析Excel文件...', 'info')
  
  try {
    // 读取Excel数据
    const rawExcelData = await readExcelFile(currentFile.value)
    
    if (rawExcelData.length === 0) {
      addProcessingLog('Excel文件中没有数据或格式不正确', 'error')
      ElMessage.error('Excel文件中没有数据或格式不正确')
      isProcessing.value = false
      return
    }

    if (rawExcelData.length > MAX_LIMIT) {
      addProcessingLog(`数据量(${rawExcelData.length})超过10000条限制`, 'error')
      ElMessage.error(`数据量(${rawExcelData.length})超过10000条限制，请分批导入`)
      isProcessing.value = false
      return
    }

    totalRowsToProcess.value = rawExcelData.length
    addProcessingLog(`成功读取 ${rawExcelData.length} 条原始数据，开始数据处理...`, 'success')
    
    // 数据处理配置
    const totalChunks = Math.ceil(rawExcelData.length / CHUNK_SIZE)
    
    // 初始化批次进度
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
    
    // 分批处理数据
    for (let i = 0; i < totalChunks; i++) {
      if (cancelProcessingToken.value === 'cancelled') {
        addProcessingLog('数据处理已被取消', 'warning')
        break
      }
      
      const chunkIndex = i
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, rawExcelData.length)
      const chunkData = rawExcelData.slice(start, end)
      
      // 更新当前批次状态
      chunkProgress.value[chunkIndex].status = 'processing'
      
      addProcessingLog(`开始处理第 ${chunkIndex + 1} 批数据 (${start + 1}-${end})`, 'info')
      
      // 模拟处理进度
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
        // 处理当前批次数据
        const result = await processDataChunk(chunkData, start, chunkIndex)
        
        // 更新统计
        processingStats.value.valid += result.validCount
        processingStats.value.invalid += result.invalidCount
        processedRows.value = end
        
        // 收集异常数据
        if (result.invalidData && result.invalidData.length > 0) {
          invalidDataDuringProcessing.value.push(...result.invalidData)
        }
        
        // 更新批次状态
        clearInterval(progressInterval)
        chunkProgress.value[chunkIndex].status = 'success'
        chunkProgress.value[chunkIndex].progress = 100
        
        addProcessingLog(`第 ${chunkIndex + 1} 批处理完成，有效: ${result.validCount}，异常: ${result.invalidCount}`, 'success')
        
        // 小延迟，让用户看到进度
        await delay(300)
        
      } catch (error) {
        clearInterval(progressInterval)
        chunkProgress.value[chunkIndex].status = 'error'
        chunkProgress.value[chunkIndex].errorMessage = error.message
        processingStats.value.invalid += chunkData.length
        processedRows.value = end
        
        addProcessingLog(`第 ${chunkIndex + 1} 批处理失败: ${error.message}`, 'error')
        
        // 继续处理下一批
        continue
      }
    }
    
    // 所有数据处理完成
    isProcessing.value = false
    
    // 设置筛选数据
    filteredData.value = [...previewData.value]
    
    addProcessingLog(`数据处理完成！有效数据：${processingStats.value.valid} 条，异常数据：${processingStats.value.invalid} 条`, 'success')
    
  } catch (error) {
    isProcessing.value = false
    addProcessingLog(`数据处理出错: ${error.message}`, 'error')
    ElMessage.error(`数据处理失败: ${error.message}`)
    currentStep.value = 1
  }
}

// 处理数据批次
const processDataChunk = async (chunkData, startIndex, chunkIndex) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let validCount = 0
      let invalidCount = 0
      const invalidData = []
      const processedChunk = []
      
      chunkData.forEach((item, index) => {
        const excelRowIndex = startIndex + index + 2 // +2 因为Excel从第2行开始（第1行是表头）
        const processedItem = validateAndMapData(item, excelRowIndex)
        processedChunk.push(processedItem)
        
        if (processedItem._isValid) {
          validCount++
        } else {
          invalidCount++
          invalidData.push(processedItem)
        }
      })
      
      // 添加到预览数据
      previewData.value.push(...processedChunk)
      
      resolve({
        validCount,
        invalidCount,
        invalidData
      })
    }, 500 + Math.random() * 1000) // 模拟处理延迟
  })
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

        // 限制最大列数
        const maxCols = 20
        const endCol = Math.min(range.e.c, maxCols - 1)

        for (let C = range.s.c; C <= endCol; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })]
          headers[C] = cell ? String(cell.v).trim() : ''
        }

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: headers })
        
        // 去除表头行
        const dataRows = jsonData.slice(1).filter(row => {
          // 过滤空行
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

// 数据验证和映射
const validateAndMapData = (item, rowIndex) => {
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
          if (value.length > 40) {
            value = value.trim().substring(0, 40)
          }
          mappedItem[fieldName] = value
          break
          
        case 'claveOperacion':
          if (value === '销售') {
            mappedItem[fieldName] = 'E'
          } else if (value === '采购') {
            mappedItem[fieldName] = 'I'
          } else if (value === '移仓') {
            mappedItem[fieldName] = 'R'
          } else {
            errors.push(`未知的操作代码`)
            mappedItem[fieldName] = value
          }
          break
          
        case 'baseImponible':
        case 'baseImponibleRectificada':
        case 'baseImponibleAnterior':
          const stringValue = value.toString().trim()
          const cleanValue = stringValue.replace(/,/g, '')
          
          const amountRegex = /^-?\d+(\.\d{1,2})?$/
          
          if (!amountRegex.test(cleanValue)) {
            const numValue = Number(cleanValue)
            if (!isNaN(numValue)) {
              const parts = cleanValue.split('.')
              if (parts.length > 1 && parts[1].length > 2) {
                errors.push(`${excelHeader} 最多只能有2位小数`)
              } else {
                errors.push(`${excelHeader} 格式错误`)
              }
            } else {
              errors.push(`${excelHeader} 必须是有效的数字`)
            }
            mappedItem[fieldName] = null
          } else {
            mappedItem[fieldName] = parseFloat(Number(cleanValue).toFixed(2))
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
  
  if (mappedItem.ejercicioRectificacion) {
    if (!mappedItem.periodoRectificacion) {
      errors.push('填写修正的财政年度时必须填写修正的期间')
    }
    if (mappedItem.baseImponibleRectificada === null) {
      errors.push('填写修正的财政年度时必须填写修正后的交易金额')
    }
    if (mappedItem.baseImponibleAnterior === null) {
      errors.push('填写修正的财政年度时必须填写先前申报的交易金额')
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
  
  // 设置行号（Excel中的实际行号）
  mappedItem.rowIndex = rowIndex
  
  // 设置验证状态
  if (errors.length > 0) {
    mappedItem.errorMessage = errors.join('；')
    mappedItem._isValid = false
  } else {
    mappedItem.errorMessage = null
    mappedItem._isValid = true
  }
  
  // 生成唯一ID
  mappedItem.id = tableRowIdGenerator.generateId('import')
  
  return mappedItem
}

// 取消处理
const cancelProcessing = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消数据处理吗？已处理的数据将会保留。',
      '确认取消',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '继续处理',
        type: 'warning'
      }
    )
    
    cancelProcessingToken.value = 'cancelled'
    isProcessing.value = false
    addProcessingLog('用户取消了数据处理操作', 'warning')
    
  } catch (error) {
    // 用户取消
  }
}

// 跳转到数据预览
const goToDataPreview = () => {
  currentStep.value = 2
}

// 删除单条数据
const handleDelete = (rowIndex) => {
  const index = previewData.value.findIndex(item => item.rowIndex === rowIndex)
  if (index !== -1) {
    previewData.value.splice(index, 1)
    handleSearch() // 重新筛选
    ElMessage.success('删除成功')
  }
}

// 删除所有异常数据
const removeAllInvalid = async () => {
  if (invalidDataCount.value === 0) {
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定删除所有 ${invalidDataCount.value} 条异常数据吗？`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    previewData.value = previewData.value.filter(item => item._isValid)
    filteredData.value = [...previewData.value]
    ElMessage.success(`已删除 ${invalidDataCount.value} 条异常数据`)
  } catch (error) {
    // 用户取消
  }
}

// 确认导入
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
      {
        confirmButtonText: '确认导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 执行导入
    await handleFinalImport()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`导入确认失败: ${error.message}`)
    }
  }
}

// 最终导入数据
const handleFinalImport = async () => {
  try {
    const validData = previewData.value.filter(item => item._isValid)
    
    if (validData.length === 0) {
      ElMessage.warning('没有有效数据可导入')
      return
    }
    
    // 使用 emit 通知父组件数据变化
    emit('changeDetail', validData)
    
    ElMessage.success(`成功导入 ${validData.length} 条数据`)
    
    // 关闭弹窗
    importProductDialogRef.value = false
    
  } catch (error) {
    ElMessage.error(`导入数据时出错: ${error.message}`)
  }
}

// 导出所有异常数据
const exportAllInvalidData = () => {
  const invalidData = previewData.value.filter(item => !item._isValid)
  exportInvalidData(invalidData, '所有异常数据')
}

// 导出异常数据
const handleExportInvalid = () => {
  const invalidData = previewData.value.filter(item => !item._isValid)
  exportInvalidData(invalidData, '异常数据')
}

// 导出异常数据通用方法
const exportInvalidData = (data, type = '异常数据') => {
  if (data.length === 0) {
    ElMessage.warning(`没有${type}可导出`)
    return
  }
  
  try {
    // 准备导出数据
    const exportData = data.map(item => {
      const exportItem = {}
      // 将字段名映射回Excel列名
      Object.entries(columnMapping).forEach(([excelHeader, fieldName]) => {
        exportItem[excelHeader] = item[fieldName] || ''
      })
      exportItem['异常原因'] = item.errorMessage || '未知原因'
      exportItem['Excel行号'] = item.rowIndex
      return exportItem
    })
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, type)
    
    // 导出文件
    const fileName = `349_${type}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    ElMessage.success(`导出成功，共 ${data.length} 条${type}`)
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

// 搜索处理
const handleSearch = () => {
  tableLoading.value = true
  
  let results = [...previewData.value]
  
  // 搜索过滤
  if (searchText.value.trim()) {
    const searchLower = searchText.value.toLowerCase()
    results = results.filter(item => 
      (item.nombreOperador && item.nombreOperador.toLowerCase().includes(searchLower)) ||
      (item.nifOperador && item.nifOperador.toLowerCase().includes(searchLower))
    )
  }
  
  // 状态过滤
  if (filterStatus.value) {
    if (filterStatus.value === 'valid') {
      results = results.filter(item => item._isValid)
    } else if (filterStatus.value === 'invalid') {
      results = results.filter(item => !item._isValid)
    }
  }
  
  filteredData.value = results
  currentPage.value = 1
  
  setTimeout(() => {
    tableLoading.value = false
  }, 300)
}

// 筛选处理
const handleFilter = () => {
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 页码变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 格式化单元格值
const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return ''
  
  if (['baseImponible', 'baseImponibleRectificada', 'baseImponibleAnterior'].includes(column)) {
    return parseFloat(value).toFixed(2)
  }
  
  if (column === 'claveOperacion') {
    const map = { E: '销售', I: '采购', R: '移仓', C: '替代' }
    return map[value] || value
  }
  
  return String(value)
}

// 截断错误信息
const truncateError = (error) => {
  if (error.length > 50) {
    return error.substring(0, 50) + '...'
  }
  return error
}

// 添加处理日志
const addProcessingLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  processingLogs.value.unshift({
    time,
    message,
    type
  })
  
  // 限制日志数量
  if (processingLogs.value.length > 100) {
    processingLogs.value = processingLogs.value.slice(0, 100)
  }
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 弹窗关闭处理
const handleDialogClose = () => {
  resetImport()
  importProductDialogRef.value = false
}

// 重置导入状态
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
  
  // 重置处理状态
  isProcessing.value = false
  totalRowsToProcess.value = 0
  processedRows.value = 0
  processingStats.value = {
    valid: 0,
    invalid: 0,
    processing: 0
  }
  chunkProgress.value = []
  processingLogs.value = []
  invalidDataDuringProcessing.value = []
  cancelProcessingToken.value = null
  
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 暴露方法给父组件
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
    
    .step-info {
      color: #909399;
      font-size: 14px;
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
        
        .el-upload__text {
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        .el-upload__tip {
          margin-top: 10px;
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
  
  
  .step-actions {
    margin-top: 30px;
    text-align: center;
    
    .el-button {
      min-width: 150px;
      margin: 0 10px;
    }
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
      
      .error-message {
        cursor: help;
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
      color: #303133;
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
        
        .detail {
          font-size: 12px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
    
    .progress-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      text-align: center;
      
      .info-item {
        .label {
          color: #909399;
          font-size: 12px;
        }
        
        .value {
          display: block;
          font-size: 18px;
          font-weight: bold;
          color: #303133;
        }
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
      color: #303133;
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
        
        &.success {
          background: #f0f9ff;
          border: 1px solid #e0f0ff;
          
          .el-icon {
            color: #67c23a;
          }
        }
        
        &.error {
          background: #fef0f0;
          border: 1px solid #fde2e2;
          
          .el-icon {
            color: #f56c6c;
          }
        }
        
        &.processing {
          background: #fdf6ec;
          border: 1px solid #fbe8d4;
          
          .el-icon {
            color: #e6a23c;
          }
        }
        
        &.total {
          background: #f5f7fa;
          border: 1px solid #ebeef5;
          
          .el-icon {
            color: #909399;
          }
        }
        
        .el-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        
        .stat-details {
          .stat-count {
            font-size: 18px;
            font-weight: bold;
            color: #303133;
          }
          
          .stat-label {
            font-size: 12px;
            color: #909399;
          }
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
    
    h3 {
      margin: 0 0 15px 0;
      color: #303133;
      font-weight: 500;
    }
    
    .progress-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      
      .chunk-item {
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ebeef5;
        
        &.chunk-success {
          background: #f0f9ff;
          border-color: #e0f0ff;
        }
        
        &.chunk-error {
          background: #fef0f0;
          border-color: #fde2e2;
        }
        
        &.chunk-processing {
          background: #fdf6ec;
          border-color: #fbe8d4;
        }
        
        &.chunk-pending {
          background: #f5f7fa;
          border-color: #ebeef5;
        }
        
        .chunk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
          
          .chunk-number {
            font-weight: 500;
            color: #303133;
          }
          
          .chunk-status {
            .el-icon {
              &.success { color: #67c23a; }
              &.error { color: #f56c6c; }
              &.processing { color: #e6a23c; }
              &.pending { color: #909399; }
            }
          }
        }
        
        .chunk-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #606266;
          margin-bottom: 5px;
        }
        
        .chunk-error-msg {
          font-size: 12px;
          color: #f56c6c;
          margin-top: 5px;
          word-break: break-word;
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
    
    h3 {
      margin: 0 0 15px 0;
      color: #303133;
      font-weight: 500;
    }
    
    .log-list {
      max-height: 300px;
      overflow-y: auto;
      
      .log-item {
        display: flex;
        padding: 8px 10px;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        &.log-info {
          background: #f4f4f5;
        }
        
        &.log-success {
          background: #f0f9ff;
        }
        
        &.log-error {
          background: #fef0f0;
        }
        
        &.log-warning {
          background: #fdf6ec;
        }
        
        .log-time {
          min-width: 80px;
          color: #909399;
          font-size: 12px;
          margin-right: 10px;
        }
        
        .log-content {
          flex: 1;
          color: #303133;
          font-size: 13px;
        }
      }
    }
  }
  
  .processing-complete {
    margin-top: 30px;
    
    .complete-success {
      background: white;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    .complete-with-error {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      
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
        
        h4 {
          margin: 0 0 15px 0;
          color: #f56c6c;
          font-weight: 500;
        }
      }
    }
  }
}

.step-actions {
  margin-top: 20px;
  text-align: center;
  
  .el-button {
    min-width: 120px;
    margin: 0 10px;
  }
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-progress-circle) {
  transition: all 0.3s ease;
}

:deep(.el-tag) {
  transition: all 0.3s ease;
}
</style>