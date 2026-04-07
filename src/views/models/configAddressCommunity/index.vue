<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="国家编码" prop="countryCode">
        <AddressCountrySelect v-model="queryParams.countryCode"  @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="大区编码" prop="communityCode">
        <AddressCommunitySelect v-model="queryParams.communityCode"  @keyup.enter="handleQuery"/>
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
          v-hasPermi="['models:configAddressCommunity:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:configAddressCommunity:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:configAddressCommunity:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:configAddressCommunity:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configAddressCommunityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="国家编码" align="center" prop="countryCode" width="80"/>
      <el-table-column label="大区编码" align="center" prop="communityCode" width="80"/>
      <el-table-column label="大区名称-中" align="left" prop="communityNameZh" show-overflow-tooltip />
      <el-table-column label="大区名称-英" align="left" prop="communityNameEn" show-overflow-tooltip />
      <el-table-column label="大区名称-西" align="left" prop="communityNameEs" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:configAddressCommunity:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:configAddressCommunity:remove']">删除</el-button>
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

    <!-- 添加或修改大区配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configAddressCommunityRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="选择国家" prop="countryCode">
          <AddressCountrySelect v-model="form.countryCode" @selectedData="selectCountryData" />
        </el-form-item>
        <el-form-item label="大区编码" prop="communityCode">
          <el-input v-model="form.communityCode" placeholder="请输入大区编码" />
        </el-form-item>
        <el-form-item label="大区名称-中" prop="communityNameZh">
          <el-input v-model="form.communityNameZh" placeholder="请输入大区名称-中" />
        </el-form-item>
        <el-form-item label="大区名称-英" prop="communityNameEn">
          <el-input v-model="form.communityNameEn" placeholder="请输入大区名称-英" />
        </el-form-item>
        <el-form-item label="大区名称-西" prop="communityNameEs">
          <el-input v-model="form.communityNameEs" placeholder="请输入大区名称-西" />
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

<script setup name="ConfigAddressCommunity">
import { listConfigAddressCommunity, getConfigAddressCommunity, delConfigAddressCommunity, addConfigAddressCommunity, updateConfigAddressCommunity } from "@/api/models/configAddressCommunity"
import AddressCountrySelect from "@/components/Common/AddressCountrySelect.vue";
import AddressCommunitySelect from "@/components/Common/AddressCommunitySelect.vue";


const { proxy } = getCurrentInstance()

const configAddressCommunityList = ref([])
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
    communityId: null,
    countryId: null,
    countryCode: null,
    communityCode: null,
    communityNameZh: null,
    communityNameEn: null,
    communityNameEs: null,
  },
  rules: {
    countryCode: [
      { required: true, message: "国家编码不能为空", trigger: "blur" }
    ],
    communityCode: [
      { required: true, message: "大区编码不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/**
 * 选择国家数据 
 */
const selectCountryData = (data) => {
  if(data){
    form.value.countryId = data.countryId;
    form.value.countryCode = data.countryCode;
    form.value.nameZh = data.nameZh;
    form.value.nameEs = data.nameEs;
    form.value.nameEn = data.nameEn;
  }
}

/** 查询大区配置列表 */
function getList() {
  loading.value = true
  listConfigAddressCommunity(queryParams.value).then(response => {
    configAddressCommunityList.value = response.rows
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
    communityId: null,
    countryId: null,
    countryCode: null,
    communityCode: null,
    communityNameZh: null,
    communityNameEn: null,
    communityNameEs: null,
    delFlag: null
  }
  proxy.resetForm("configAddressCommunityRef")
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
  ids.value = selection.map(item => item.communityId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加大区配置"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _communityId = row.communityId || ids.value
  getConfigAddressCommunity(_communityId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改大区配置"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configAddressCommunityRef"].validate(valid => {
    if (valid) {
      if (form.value.communityId != null) {
        updateConfigAddressCommunity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfigAddressCommunity(form.value).then(response => {
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
  const _communityIds = row.communityId || ids.value
  proxy.$modal.confirm('是否确认删除大区配置编号为"' + _communityIds + '"的数据项？').then(function() {
    return delConfigAddressCommunity(_communityIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/configAddressCommunity/export', {
    ...queryParams.value
  }, `configAddressCommunity_${new Date().getTime()}.xlsx`)
}

getList()
</script>
