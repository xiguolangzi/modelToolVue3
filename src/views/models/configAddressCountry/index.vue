<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="95px">
      <el-form-item label="国家编码" prop="countryCode">
        <AddressCountrySelect v-model="queryParams.countryCode"  @keyup.enter="handleQuery"/>
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
          v-hasPermi="['models:configAddressCountry:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:configAddressCountry:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:configAddressCountry:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:configAddressCountry:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configAddressCountryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="iso编码" align="center" prop="countryCode" width="80"/>
      <el-table-column label="国家名称-中" align="left" prop="nameZh" show-overflow-tooltip />
      <el-table-column label="国家名称-英" align="left" prop="nameEn" show-overflow-tooltip />
      <el-table-column label="国家名称-西" align="left" prop="nameEs" show-overflow-tooltip />
      <el-table-column label="排序字段" align="center" prop="orderNum" width="80"/>
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:configAddressCountry:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:configAddressCountry:remove']">删除</el-button>
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

    <!-- 添加或修改国家配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configAddressCountryRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="iso编码" prop="countryCode">
          <el-input v-model.trim="form.countryCode" placeholder="iso编码" :maxlength="2" show-word-limit />
        </el-form-item>
        <el-form-item label="国家名称-中" prop="nameZh">
          <el-input v-model="form.nameZh" placeholder="请输入国家名称-中" :maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="国家名称-英" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入国家名称-英" :maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="国家名称-西" prop="nameEs">
          <el-input v-model="form.nameEs" placeholder="请输入国家名称-西" :maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="排序字段" prop="orderNum">
          <el-input-number v-model="form.orderNum" placeholder="请输入排序字段" />
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

<script setup name="ConfigAddressCountry">
import { listConfigAddressCountry, getConfigAddressCountry, delConfigAddressCountry, addConfigAddressCountry, updateConfigAddressCountry } from "@/api/models/configAddressCountry"
import AddressCountrySelect from "@/components/Common/AddressCountrySelect.vue";

const { proxy } = getCurrentInstance()

const configAddressCountryList = ref([])
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
    pageSize: 20,
    countryCode: null,
    nameZh: null,
    nameEn: null,
    nameEs: null,
  },
  rules: {
    countryCode: [
      { required: true, message: "国家代码不能为空", trigger: "blur" }
    ],
    nameZh: [
      { required: true, message: "中文名称不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询国家配置列表 */
function getList() {
  loading.value = true
  listConfigAddressCountry(queryParams.value).then(response => {
    configAddressCountryList.value = response.rows
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
    countryId: null,
    countryCode: null,
    nameZh: null,
    nameEn: null,
    nameEs: null,
    delFlag: null,
    orderNum: null
  }
  proxy.resetForm("configAddressCountryRef")
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
  ids.value = selection.map(item => item.countryId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加国家配置"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _countryId = row.countryId || ids.value
  getConfigAddressCountry(_countryId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改国家配置"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configAddressCountryRef"].validate(valid => {
    if (valid) {
      if (form.value.countryId != null) {
        updateConfigAddressCountry(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfigAddressCountry(form.value).then(response => {
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
  const _countryIds = row.countryId || ids.value
  proxy.$modal.confirm('是否确认删除国家配置编号为"' + _countryIds + '"的数据项？').then(function() {
    return delConfigAddressCountry(_countryIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/configAddressCountry/export', {
    ...queryParams.value
  }, `configAddressCountry_${new Date().getTime()}.xlsx`)
}

getList()
</script>
