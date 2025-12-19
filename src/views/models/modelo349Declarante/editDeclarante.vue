<template>
  <div class="app-container">
    <el-card class="card-data"> 

      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>349申报数据详情</h2>
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
              disabled/>
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
              disabled  />
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
          <div>
            <el-button type="primary" icon="Plus" @click="handleAddOperador">添加记录信息</el-button>
            <el-button type="danger" icon="Delete" @click="handleDeleteOperador" :disabled="selectedOperadores.length === 0">
              删除选中
            </el-button>
            <el-tag type="info" style="margin-left: 10px;">
              已添加 {{ modelo349OperadorIntraList.length }} 条记录
            </el-tag>
          </div>

          <div>
            <el-button type="warning" @click="importItems" >Excel导入明细</el-button>
          </div>
        </div>

        <!-- 经营者记录信息表格 -->
        <div class="operador-table-container">
          <el-table 
            :data="modelo349OperadorIntraList" 
            border
            @selection-change="handleOperadorSelectionChange"
            @row-click="handleRowClick"
            ref="operadorTableRef"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="序号" width="60" align="center" fixed="left">
              <template #default="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>

            <!-- 国家信息 -->
            <el-table-column label="国家代码" prop="codigoPais" width="80" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model.trim="row.codigoPais" 
                  placeholder="国家代码" 
                  @input="validateCountryCode(row)"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="欧盟税号" prop="nifOperador" width="200" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model.trim="row.nifOperador" 
                  placeholder="欧盟运营商税号" 
                  maxlength="15"
                  show-word-limit
                />
              </template>
            </el-table-column>
            
            <el-table-column label="公司名称" prop="nombreOperador" min-width="430" align="left">
              <template #default="{ row }">
                <el-input 
                  v-model="row.nombreOperador" 
                  placeholder="经营者姓名或公司名称" 
                  maxlength="40"
                  show-word-limit
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作代码" prop="claveOperacion" width="120" align="center">
              <template #default="{ row }">
                <el-select v-model="row.claveOperacion" placeholder="操作代码" style="width: 100%">
                  <el-option
                    v-for="dict in model349_operation_key"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="交易金额" prop="baseImponible" width="150" align="right" header-align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.baseImponible" 
                  placeholder="应税基础或金额" 
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  v-focusSelect
                  @change="calculateTotals"
                  :disabled="isRectificacion"
                />
              </template>
            </el-table-column>
            
            <!-- 修正相关字段 -->
            <el-table-column label="修正年度" prop="ejercicioRectificacion" width="120" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model="row.ejercicioRectificacion" 
                  placeholder="财政年度YYYY"
                  :disabled="!isRectificacion"
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
            
            <el-table-column label="修正后金额" prop="baseImponibleRectificada" width="150" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.baseImponibleRectificada" 
                  placeholder="修正后金额"
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  v-focusSelect
                  :disabled="!isRectificacion"
                  @change="calculateTotals"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="先前金额" prop="baseImponibleAnterior" width="150" align="center">
              <template #default="{ row }">
                <el-input-number 
                  v-model="row.baseImponibleAnterior" 
                  placeholder="先前申报金额"
                  :controls="false"
                  :min="0" :max="99999999999" :precision="2"
                  style="width: 100%;"
                  v-focusSelect
                  :disabled="!isRectificacion"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="替代税号" prop="nifDestinatarioSustituto" width="150" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model.trim="row.nifDestinatarioSustituto" 
                  placeholder="操作类型为C时填写"
                  :disabled="row.claveOperacion !== 'C'"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="替代公司名称" prop="nombreDestinatarioSustituto" width="200" align="center">
              <template #default="{ row }">
                <el-input 
                  v-model="row.nombreDestinatarioSustituto" 
                  placeholder="操作类型为C时填写"
                  maxlength="40"
                  show-word-limit
                  :disabled="row.claveOperacion !== 'C'"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button 
                  type="danger" 
                  icon="Delete" 
                  @click.stop="handleRemoveOperador($index)"
                  size="small"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      
      </el-form>

    </el-card>

    <ImportItemsDialog ref="importItemsDialog" :detailList="modelo349OperadorIntraList" @changeDetail="handleChangeDetails" />

  </div>
</template>

<script setup name="EditDeclarante">

  import { ref, computed } from 'vue'
import { getModelo349Declarante, addModelo349Declarante, updateModelo349Declarante, exportModelo349 } from "@/api/models/modelo349Declarante"
import { selectDeclarantes } from "@/api/models/configDeclarante"
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter, useRoute } from "vue-router";
import ImportItemsDialog from './ImportItemsDialog.vue';
import { el } from 'element-plus/es/locales.mjs';

const router = useRouter();
const route = useRoute();


const { proxy } = getCurrentInstance()
const { model349_operation_key, model349_declaration_type, model349_periodo, model349_status } = proxy.useDict('model349_operation_key', 'model349_declaration_type', 'model349_periodo', 'model349_status')


// 经营者列表
const modelo349OperadorIntraList = ref([])
const selectedOperadores = ref([])
const declaranteList = ref([])
const submitting = ref(false)
const modelo349DeclaranteRef = ref(null)
const operadorTableRef = ref(null)
const importItemsDialog = ref(null)


// 是否更正
const isRectificacion = computed(() => {
  return ['S', 'C'].includes(form.value.declaracionTipo)
})

/** 导出按钮操作 */
async function  handleExport349() {
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
    link.download = `349_${form.value.numeroIdentificativo}.txt`
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

// 导入更新明细
function handleChangeDetails(details) { 
  Object.assign(modelo349OperadorIntraList.value, details)
  // 从新计算汇总
  calculateTotals();
}

// 通过传递的ID获取数据
const getInfoById = async () => {
  try {
    const { id } = route.query
    if (id) {
      const res = await getModelo349Declarante(id)
      if (res.code === 200) {
        Object.assign(form.value, res.data)
        if( res.data ){
          modelo349OperadorIntraList.value = res.data.modelo349OperadorIntraList
        }
      }
    } else {
      reset();
    }

  } catch (error) {
    console.log('初始获取model349数据失败！' , error)
  }
}

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
    numeroIdentificativo: [
      { required: true, message: "申报识别号，13位数字不能为空", trigger: "blur" }
    ],
    periodo: [
      { required: true, message: "申报期间不能为空", trigger: "change" }
    ],
  }
})

const { form, rules } = toRefs(data)

function reset() {
  form.value = {
    id: null,
    tipoRegistro: '1',
    modeloDeclaracion: '349',
    ejercicio: null,
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
  proxy.resetForm("modelo349DeclaranteRef")
}



// ------------------ 获取申报人下拉信息 end ------------------

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

// 添加经营者
function handleAddOperador() {
  const newOperador = {
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
  
  modelo349OperadorIntraList.value.push(newOperador)
}

// 删除经营者记录
function handleDeleteOperador() {
  if (selectedOperadores.value.length === 0) {
    ElMessage.warning('请先选择要删除的经营者记录')
    return
  }
  
  ElMessageBox.confirm('确定删除选中的经营者记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 过滤掉选中的记录
    modelo349OperadorIntraList.value = modelo349OperadorIntraList.value.filter(
      item => !selectedOperadores.value.includes(item)
    )
    selectedOperadores.value = []
    calculateTotals()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 单独删除一行
function handleRemoveOperador(index) {
  ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    modelo349OperadorIntraList.value.splice(index, 1)
    calculateTotals()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 经营者选择变化
function handleOperadorSelectionChange(selection) {
  selectedOperadores.value = selection
}

// 行点击事件
function handleRowClick(row) {
  const tableRef = operadorTableRef.value
  if (tableRef) {
    tableRef.toggleRowSelection(row)
  }
}

// 验证国家代码
function validateCountryCode(row) {
  if (row.codigoPais && row.codigoPais.length > 2) {
    row.codigoPais = row.codigoPais.substring(0, 2)
    ElMessage.warning('国家代码最多2位')
  }
}

// 计算总计
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
          if(row.baseImponibleRectificada == null || row.baseImponibleRectificada == undefined || row.baseImponibleRectificada <= 0){
            ElMessage.warning('更新记录的“更新金额”不能小于0')
            return
          }
        } else {
          if(row.baseImponible == null || row.baseImponible == undefined || row.baseImponible <= 0){
            ElMessage.warning('记录的“金额”不能小于0')
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
      modelo349OperadorIntraList.value = res.data.modelo349OperadorIntraList

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


getInfoById();

</script>

<style lang="scss" scoped>
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许滚动 */
  padding: 0px;
  margin: 0px;

  .card-data{
    width: 100%;
    height: 100%;
    flex: 1;
    overflow-y: auto; /* 允许滚动 */
  }

  .card-operation-log{
    width: 100%;
    flex-shrink: 0;
    overflow-y: auto; /* 允许滚动 */

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

.operador-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 20px;

}
</style>