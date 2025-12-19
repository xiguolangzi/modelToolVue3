<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="150px">
      <el-form-item label="申报人NIF税号" prop="nifDeclarante">
        <el-input
          v-model="queryParams.nifDeclarante"
          placeholder="请输入申报人NIF税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申报人姓名" prop="nombreDeclarante">
        <el-input
          v-model="queryParams.nombreDeclarante"
          placeholder="请输入申报人姓名或公司名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['models:configDeclarante:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:configDeclarante:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:configDeclarante:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:configDeclarante:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configDeclaranteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="declaracionId"   width="70"/>
      <el-table-column label="申报人NIF税号" align="center" prop="nifDeclarante" width="120"/>
      <el-table-column label="申报人姓名" align="center" prop="nombreDeclarante" show-overflow-tooltip />
      <el-table-column label="联系电话" align="center" prop="telefonoContacto"  width="120"/>
      <el-table-column label="联系人姓名" align="center" prop="personaContacto" show-overflow-tooltip/>
      <el-table-column label="法定代表人税号" align="center" prop="nifRepresentanteLegal"  width="120"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:configDeclarante:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:configDeclarante:remove']">删除</el-button>
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

    <!-- 添加或修改申报人档案对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configDeclaranteRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="申报人NIF税号" prop="nifDeclarante">
          <el-input v-model.trim="form.nifDeclarante" placeholder="请输入申报人NIF税号" type="textarea" :maxlength="9" :rows="1" :show-word-limit="true" />
        </el-form-item>
        <el-form-item label="申报人姓名" prop="nombreDeclarante">
          <el-input v-model="form.nombreDeclarante" placeholder="请输入申报人姓名或公司名称" type="textarea"   :maxlength="40" :rows="1" :show-word-limit="true" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telefonoContacto">
          <el-input v-model="form.telefonoContacto" placeholder="请输入联系电话" type="textarea"   :maxlength="9" :rows="1" :show-word-limit="true"/>
        </el-form-item>
        <el-form-item label="联系人姓名" prop="personaContacto">
          <el-input v-model="form.personaContacto" placeholder="请输入联系人姓名"  type="textarea"  :maxlength="40" :rows="1" :show-word-limit="true"/>
        </el-form-item>
        <el-form-item label="法定代表人税号" prop="nifRepresentanteLegal">
          <el-input v-model="form.nifRepresentanteLegal" placeholder="请输入法定代表人的NIF税号" type="textarea"   :maxlength="9" :rows="1" :show-word-limit="true" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea"   :maxlength="100" :rows="2" :show-word-limit="true"/>
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

<script setup name="ConfigDeclarante">
import { listConfigDeclarante, getConfigDeclarante, delConfigDeclarante, addConfigDeclarante, updateConfigDeclarante } from "@/api/models/configDeclarante"

const { proxy } = getCurrentInstance()

const configDeclaranteList = ref([])
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
    pageSize: 10,
    nifDeclarante: null,
    nombreDeclarante: null,
  },
  rules: {
    nifDeclarante: [
      { required: true, message: "申报人NIF税号不能为空", trigger: "blur" }
    ],
    nombreDeclarante: [
      { required: true, message: "申报人姓名或公司名称不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询申报人档案列表 */
function getList() {
  loading.value = true
  listConfigDeclarante(queryParams.value).then(response => {
    configDeclaranteList.value = response.rows
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
    declaracionId: null,
    nifDeclarante: null,
    nombreDeclarante: null,
    telefonoContacto: null,
    personaContacto: null,
    nifRepresentanteLegal: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    remark: null
  }
  proxy.resetForm("configDeclaranteRef")
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
  ids.value = selection.map(item => item.declaracionId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加申报人档案"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _declaracionId = row.declaracionId || ids.value
  getConfigDeclarante(_declaracionId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改申报人档案"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configDeclaranteRef"].validate(valid => {
    if (valid) {
      if (form.value.declaracionId != null) {
        updateConfigDeclarante(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfigDeclarante(form.value).then(response => {
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
  const _declaracionIds = row.declaracionId || ids.value
  proxy.$modal.confirm('是否确认删除申报人档案编号为"' + _declaracionIds + '"的数据项？').then(function() {
    return delConfigDeclarante(_declaracionIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/configDeclarante/export', {
    ...queryParams.value
  }, `configDeclarante_${new Date().getTime()}.xlsx`)
}

getList()
</script>
