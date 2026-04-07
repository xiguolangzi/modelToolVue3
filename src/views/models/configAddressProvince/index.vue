<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="国家编码" prop="countryCode">
        <AddressCountrySelect v-model="queryParams.countryCode"  @keyup.enter="handleQuery" :size="small" />
      </el-form-item>
      <el-form-item label="大区编码" prop="communityCode">
        <AddressCommunitySelect v-model="queryParams.communityCode"  @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="省份编码" prop="provinceCode">
        <el-input
          v-model="queryParams.provinceCode"
          placeholder="请输入省份编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="省份代码" prop="provinceNum">
        <el-input
          v-model="queryParams.provinceNum"
          placeholder="请输入省份代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="省份名称" prop="provinceNameZh">
        <el-input
          v-model="queryParams.provinceNameZh"
          placeholder="请输入省份名称"
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
          v-hasPermi="['models:configAddressProvince:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:configAddressProvince:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:configAddressProvince:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:configAddressProvince:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configAddressProvinceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="国家编码" align="left" prop="countryCode" width="80"/>
      <el-table-column label="大区编码" align="left" prop="communityCode" width="80"/>
      <el-table-column label="省份编码" align="left" prop="provinceCode" width="80"/>
      <el-table-column label="省份代码" align="left" prop="provinceNum" width="80"/>
      <el-table-column label="省份名称-中" align="left" prop="provinceNameZh" show-overflow-tooltip />
      <el-table-column label="省份名称-英" align="left" prop="provinceNameEn" show-overflow-tooltip />
      <el-table-column label="省份名称-西" align="left" prop="provinceNameEs" show-overflow-tooltip />
      
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:configAddressProvince:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:configAddressProvince:remove']">删除</el-button>
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

    <!-- 添加或修改省份配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configAddressProvinceRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="国家编码" prop="countryCode">
          <AddressCountrySelect v-model="form.countryCode" @selectedData="selectCountryData" />
        </el-form-item>
        <el-form-item label="大区编码" prop="communityCode">
          <AddressCommunitySelect v-model="form.communityCode" @selectedData="selectCommunityData" />
        </el-form-item>
        <el-form-item label="省份编码" prop="provinceCode">
          <el-input v-model="form.provinceCode" placeholder="请输入省份编码" :maxlength="3" show-word-limit/>
        </el-form-item>
        <el-form-item label="省份代码" prop="provinceNum">
          <el-input v-model="form.provinceNum" placeholder="请输入省份代码" :maxlength="3" show-word-limit/>
        </el-form-item>
        <el-form-item label="省份名称-中" prop="provinceNameZh">
          <el-input v-model="form.provinceNameZh" placeholder="请输入省份名称-中" :maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="省份名称-英" prop="provinceNameEn">
          <el-input v-model="form.provinceNameEn" placeholder="请输入省份名称-英" :maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="省份名称-西" prop="provinceNameEs">
          <el-input v-model="form.provinceNameEs" placeholder="请输入省份名称-西" :maxlength="50" show-word-limit/>
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

<script setup name="ConfigAddressProvince">
import { listConfigAddressProvince, getConfigAddressProvince, delConfigAddressProvince, addConfigAddressProvince, updateConfigAddressProvince } from "@/api/models/configAddressProvince"
import AddressCountrySelect from "@/components/Common/AddressCountrySelect.vue";
import AddressCommunitySelect from "@/components/Common/AddressCommunitySelect.vue";


const { proxy } = getCurrentInstance()

const configAddressProvinceList = ref([])
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
    communityCode: null,
    provinceCode: null,
    provinceNameZh: null, // 兼容中英西
    provinceNum: null
  },
  rules: {
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
  } else{
    form.value.countryId = null;
    form.value.countryCode = null;
    form.value.nameZh = null;
    form.value.nameEs = null;
    form.value.nameEn = null;
  }
}

/**
 * 选择大区数据
 */
const selectCommunityData = (data) => {
  if(data){
    if(data.countryCode && form.value.countryCode && data.countryCode == form.value.countryCode){
      form.value.communityId = data.communityId;
      form.value.communityCode = data.communityCode;
      form.value.communityNameZh = data.communityNameZh;
      form.value.communityNameEs = data.communityNameEs;
      form.value.communityNameEn = data.communityNameEn;
    } else {
      proxy.$modal.msgError("国家与大区不一致，请重新选择");
      form.value.communityId = null;
      form.value.communityCode = null;
      form.value.communityNameZh = null;
      form.value.communityNameEs = null;
      form.value.communityNameEn = null;
    }
  }
}


/** 查询省份配置列表 */
function getList() {
  loading.value = true
  listConfigAddressProvince(queryParams.value).then(response => {
    configAddressProvinceList.value = response.rows
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
    provinceId: null,
    countryId: null,
    countryCode: null,
    communityId: null,
    communityCode: null,
    provinceCode: null,
    provinceNameZh: null,
    provinceNameEn: null,
    provinceNameEs: null,
    provinceNum: null
  }
  proxy.resetForm("configAddressProvinceRef")
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
  ids.value = selection.map(item => item.provinceId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加省份配置"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _provinceId = row.provinceId || ids.value
  getConfigAddressProvince(_provinceId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改省份配置"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["configAddressProvinceRef"].validate(valid => {
    if (valid) {
      if (form.value.provinceId != null) {
        updateConfigAddressProvince(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addConfigAddressProvince(form.value).then(response => {
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
  const _provinceIds = row.provinceId || ids.value
  proxy.$modal.confirm('是否确认删除省份配置编号为"' + _provinceIds + '"的数据项？').then(function() {
    return delConfigAddressProvince(_provinceIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/configAddressProvince/export', {
    ...queryParams.value
  }, `configAddressProvince_${new Date().getTime()}.xlsx`)
}

getList()
</script>
