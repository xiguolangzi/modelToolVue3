<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="国家编码" prop="codigoPais">
        <el-input
          v-model="queryParams.codigoPais"
          placeholder="请输入国家编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家名称" prop="nombrePais">
        <el-input
          v-model="queryParams.nombrePais"
          placeholder="请输入国家名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否激活" prop="activo">
        <el-select v-model="queryParams.activo" placeholder="请选择是否激活" clearable>
          <el-option
            v-for="dict in yes_or_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['models:configPaisesUe:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:configPaisesUe:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:configPaisesUe:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:configPaisesUe:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configPaisesUeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="国家代码" align="left" prop="codigoPais"  width="80"/>
      <el-table-column label="国家名称" align="left" prop="nombrePais" width="120" />
      <el-table-column label="号码最小长度" align="left" prop="lengthMin" width="120"/>
      <el-table-column label="号码最大长度" align="left" prop="lengthMax"  width="120"/>
      <el-table-column label="号码格式描述" align="left" prop="formatoNif" show-overflow-tooltip/>
      <el-table-column label="号码验证表达式" align="left" prop="regexValidacion" />
      <el-table-column label="是否激活" align="center" prop="activo"  width="80">
        <template #default="scope">
          <dict-tag :options="yes_or_no" :value="scope.row.activo"/>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="fechaActualizacion" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.fechaActualizacion) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:configPaisesUe:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:configPaisesUe:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改欧盟国家代码配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configPaisesUeRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="国家编码" prop="codigoPais">
          <el-input v-model.trim="form.codigoPais"
          @input="handleCodigoPaisInput"
          placeholder="请输入国家编码" />
        </el-form-item>
        <el-form-item label="国家名称" prop="nombrePais">
          <el-input v-model="form.nombrePais" placeholder="请输入国家名称" />
        </el-form-item>
        <el-form-item label="号码最小长度" prop="lengthMin">
          <el-input v-model.number="form.lengthMin" placeholder="请输入税号最小长度" />
        </el-form-item>
        <el-form-item label="号码最大长度" prop="lengthMax">
          <el-input v-model.number="form.lengthMax" placeholder="请输入税号最大长度" />
        </el-form-item>
        <el-form-item label="号码格式描述" prop="formatoNif">
          <el-input v-model="form.formatoNif" placeholder="请输入NIF格式描述" />
        </el-form-item>
        <el-form-item label="号码验证表达式" prop="regexValidacion">
          <el-input v-model="form.regexValidacion" placeholder="请输入验证正则表达式" />
        </el-form-item>
        <el-form-item label="是否激活" prop="activo">
          <el-radio-group v-model="form.activo">
            <el-radio
              v-for="dict in yes_or_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="更新时间" prop="fechaActualizacion">
          <el-date-picker clearable
            v-model="form.fechaActualizacion"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择更新时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ConfigPaisesUe">
import { listConfigPaisesUe, getConfigPaisesUe, delConfigPaisesUe, addConfigPaisesUe, updateConfigPaisesUe } from "@/api/models/configPaisesUe"
import { id } from "element-plus/es/locales.mjs"

const { proxy } = getCurrentInstance()
const { yes_or_no } = proxy.useDict('yes_or_no')

const configPaisesUeList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 50,
    codigoPais: null,
    nombrePais: null,
    activo: null,
  },
  rules: {
    codigoPais: [
      { required: true, message: "国家编码不能为空", trigger: "blur" }
    ],
    nombrePais: [
      { required: true, message: "国家名称不能为空", trigger: "blur" }
    ],
    lengthMin: [
      { required: true, message: "税号最小长度不能为空", trigger: "blur" }
    ],
    lengthMax: [
      { required: true, message: "税号最大长度不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

// 处理输入事件
const handleCodigoPaisInput = (value) => {
  // 只保留大写字母
  const upperValue = value.replace(/[^A-Z]/g, '')
  form.value.codigoPais = upperValue
}

/** 查询欧盟国家代码配置列表 */
function getList() {
  loading.value = true
  listConfigPaisesUe(queryParams.value).then(response => {
    configPaisesUeList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    codigoPais: null,
    nombrePais: null,
    lengthMin: null,
    lengthMax: null,
    formatoNif: null,
    regexValidacion: null,
    activo: 1,
    fechaActualizacion: null
  }
  proxy.resetForm("configPaisesUeRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加欧盟国家代码配置"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getConfigPaisesUe(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改欧盟国家代码配置"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configPaisesUeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateConfigPaisesUe(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfigPaisesUe(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _id = row.id || ids.value
  proxy.$modal.confirm('是否确认删除欧盟国家代码配置编号为"' + _id + '"的数据项？').then(function() {
    return delConfigPaisesUe(_id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/configPaisesUe/export', {
    ...queryParams.value
  }, `configPaisesUe_${new Date().getTime()}.xlsx`)
}

getList()
</script>
