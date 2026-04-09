<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户用户" prop="userName">
        <UserSelect v-model="queryParams.userName" @selectedData="selectedCustomerData" />
      </el-form-item>
      <el-form-item label="申报年份" prop="periodoAno">
        <el-input
          v-model="queryParams.periodoAno"
          placeholder="请输入申报年份"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申报月份" prop="periodoMes">
        <el-select v-model="queryParams.periodoMes" placeholder="请选择申报月份" clearable>
          <el-option
            v-for="dict in intrastat_periodo_mes"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申报状态" prop="situacion">
        <el-select v-model="queryParams.situacion" placeholder="请选择申报状态" clearable>
          <el-option
            v-for="dict in intrastat_situacion"
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
          v-hasPermi="['models:intrastatHead:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:intrastatHead:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:intrastatHead:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:intrastatHead:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="intrastatHeadList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" />
      <el-table-column label="申报税号" align="center" prop="declarantNif" />
      <el-table-column label="申报法定名称" align="center" prop="declarantName" />
      <el-table-column label="代理税号" align="center" prop="tercerDeclaranteNif" />
      <el-table-column label="代理法定名称" align="center" prop="tercerDeclaranteName" />
      <el-table-column label="贸易流向" align="center" prop="flujo" />
      <el-table-column label="申报类型" align="center" prop="tipoDeclaracion" />
      <el-table-column label="海关办公室代码" align="center" prop="oficina" />
      <el-table-column label="申报年份" align="center" prop="periodoAno" />
      <el-table-column label="申报月份" align="center" prop="periodoMes" />
      <el-table-column label="申报序号" align="center" prop="numDeclaracion" />
      <el-table-column label="申报状态" align="center" prop="situacion" />
      <el-table-column label="货币种类" align="center" prop="moneda" />
      <el-table-column label="定位码" align="center" prop="localizacion" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:intrastatHead:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:intrastatHead:remove']">删除</el-button>
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

  </div>
</template>

<script setup name="IntrastatHead">
import { listIntrastatHead, getIntrastatHead, delIntrastatHead, addIntrastatHead, updateIntrastatHead } from "@/api/models/intrastatHead";

// 导入组件
import UserSelect from "@/components/Common/UserSelect.vue";

const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance()
const { intrastat_flujo, intrastat_tipo_declaracion, intrastat_detail_naturaleza_transaccion, intrastat_moneda, intrastat_detail_regimen, intrastat_detail_situacion, intrastat_periodo_mes, intrastat_situacion, intrastat_detail_condicion_entrega, intrastat_detail_puerto, intrastat_detail_modo_transporte } = proxy.useDict('intrastat_flujo', 'intrastat_tipo_declaracion', 'intrastat_detail_naturaleza_transaccion', 'intrastat_moneda', 'intrastat_detail_regimen', 'intrastat_detail_situacion', 'intrastat_periodo_mes', 'intrastat_situacion', 'intrastat_detail_condicion_entrega', 'intrastat_detail_puerto', 'intrastat_detail_modo_transporte')

const intrastatHeadList = ref([])
const intrastatDetailList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

const currentYear = new Date().getFullYear()
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    declarantNif: null,
    declarantName: null,
    periodoMes: null,
    periodoAno: currentYear,
    situacion: null,
  }
})

const { queryParams, form } = toRefs(data)

/** 选择客户 */
function selectedCustomerData(data){
  if(data && data.userId){
    queryParams.value.userId = data.userId
    queryParams.value.userName = data.userName
  } else {
    queryParams.value.userId = null
    queryParams.value.userName = null
  }
}

/** 查询欧盟内部货物贸易的统计申报列表 */
function getList() {
  loading.value = true
  queryParams.value.userName = null

  listIntrastatHead(queryParams.value).then(response => {
    intrastatHeadList.value = response.rows
    total.value = response.total
    loading.value = false
  })
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
  ids.value = selection.map(item => item.headId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  const obj = {path: "/IntrastatManage/EditIntrastat", name:"EditIntrastat"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/IntrastatManage/EditIntrastat"});
    } 
  )
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _headId = row.headId || ids.value[0]
  const obj = {path: "/IntrastatManage/EditIntrastat", name:"EditIntrastat"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/IntrastatManage/EditIntrastat", query: { headId: _headId } });
    } 
  )
}



/** 删除按钮操作 */
function handleDelete(row) {
  const _headIds = row.headId || ids.value
  proxy.$modal.confirm('是否确认删除欧盟内部货物贸易的统计申报编号为"' + _headIds + '"的数据项？').then(function() {
    return delIntrastatHead(_headIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/intrastatHead/export', {
    ...queryParams.value
  }, `intrastatHead_${new Date().getTime()}.xlsx`)
}

/** 监听路由，路由跳转后更新界面数据 */
watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList();
  },{props: true}
);

getList()
</script>
