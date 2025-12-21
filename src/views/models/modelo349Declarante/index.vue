<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="申报人税号" prop="nifDeclarante">
        <el-input
          v-model="queryParams.nifDeclarante"
          placeholder="请输入申报人NIF税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="财政年度" prop="ejercicio">
        <el-input
          v-model="queryParams.ejercicio"
          placeholder="请输入财政年度，YYYY格式"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申报期间" prop="periodo">
        <el-select v-model="queryParams.periodo" placeholder="请选择申报期间" clearable>
          <el-option
            v-for="dict in model349_periodo"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申报识别号" prop="numeroIdentificativo">
        <el-input
          v-model="queryParams.numeroIdentificativo"
          placeholder="请输入申报识别号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="前一识别号" prop="numeroDeclaracionAnterior">
        <el-input
          v-model="queryParams.numeroDeclaracionAnterior"
          placeholder="请输入前一申报识别号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申报类型" prop="declaracionTipo">
        <el-select v-model="queryParams.declaracionTipo" placeholder="请选择申报类型" clearable>
          <el-option
            v-for="dict in model349_declaration_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="状态" prop="estado">
        <el-select v-model="queryParams.estado" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in model349_status"
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
          v-hasPermi="['models:modelo349Declarante:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['models:modelo349Declarante:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['models:modelo349Declarante:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:modelo349Declarante:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="modelo349DeclaranteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流水编码" align="center" prop="id" width="80">
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.id }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="财政年度" align="center" prop="ejercicio"  width="80"/>
      <el-table-column label="申报人NIF" align="center" prop="nifDeclarante"  width="120"/>
      <el-table-column label="申报人姓名" align="center" prop="nombreDeclarante" min-width="200" show-overflow-tooltip/>
      <el-table-column label="联系电话" align="center" prop="telefonoContacto" width="110"/>
      <el-table-column label="联系人姓名" align="center" prop="personaContacto" min-width="150" show-overflow-tooltip/>

      <el-table-column label="申报识别号" align="center" prop="numeroIdentificativo" width="130">
        <template #default="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">
            {{ scope.row.numeroIdentificativo }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="申报类型" align="center" prop="declaracionTipo" width="80" show-overflow-tooltip >
        <template #default="scope">
          <dict-tag :options="model349_declaration_type" :value="scope.row.declaracionTipo"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="estado" width="80">
        <template #default="scope">
          <dict-tag :options="model349_status" :value="scope.row.estado"/>
        </template>
      </el-table-column>
      <el-table-column label="前一申报识别号" align="center" prop="numeroDeclaracionAnterior" width="130"/>
      <el-table-column label="申报期间" align="center" prop="periodo" width="90">
        <template #default="scope">
          <dict-tag :options="model349_periodo" :value="scope.row.periodo"/>
        </template>
      </el-table-column>
      <el-table-column label="欧盟内经营者总数" align="center" prop="totalOperadoresIntracomunitarios" width="80"/>
      <el-table-column label="欧盟内交易总额" align="center" prop="importeOperaciones" width="80"/>
      <el-table-column label="修正的经营者总数" align="center" prop="totalOperadoresRectificaciones" width="80"/>
      <el-table-column label="修正金额总额" align="center" prop="importeRectificaciones" width="80"/>
      <el-table-column label="申报频率变更指示器" align="center" prop="indicadorCambioPeriodicidad" width="90" />
      <el-table-column label="法定NIF" align="center" prop="nifRepresentanteLegal" width="120" />
      <el-table-column label="备注" align="center" prop="remark" width="120" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:modelo349Declarante:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:modelo349Declarante:remove']">删除</el-button>
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

<script setup name="Modelo349Declarante">
 // api
import { listModelo349Declarante, delModelo349Declarante,  } from "@/api/models/modelo349Declarante";
import {selectDeclarantes} from "@/api/models/configDeclarante";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance()
const { model349_operation_key, model349_declaration_type, model349_periodo, model349_status } = proxy.useDict('model349_operation_key', 'model349_declaration_type', 'model349_periodo', 'model349_status')

const modelo349DeclaranteList = ref([])
const modelo349OperadorIntraList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedModelo349OperadorIntra = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)

// ------------------ 获取申报人下拉信息 start ------------------

const declaranteList = ref([])

// 申报人下拉菜单
function getDeclaranteList(){
  selectDeclarantes().then(res => {
    if(res.code == 200){
      declaranteList.value = res.data
    }
  })
}

getDeclaranteList()

// ------------------ 获取申报人下拉信息 end ------------------

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 50,
    ejercicio: null,
    nifDeclarante: null,
    nombreDeclarante: null,
    numeroIdentificativo: null,
    numeroDeclaracionAnterior: null,
    declaracionTipo: null,
    periodo: null,
    estado: null,
  }
})

const { queryParams } = toRefs(data)

/** 查询349模型申报人主列表 */
function getList() {
  loading.value = true
  listModelo349Declarante(queryParams.value).then(response => {
    modelo349DeclaranteList.value = response.rows
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
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  const obj = {path: "/Model349/EditDeclarante", name:"EditDeclarante"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/Model349/EditDeclarante"});
    } 
  )
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _id = row.id || ids.value[0]
  const obj = {path: "/Model349/EditDeclarante", name:"EditDeclarante"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/Model349/EditDeclarante", query: { id: _id } });
    } 
  )
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除349模型申报人主编号为"' + _ids + '"的数据项？').then(function() {
    return delModelo349Declarante(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/modelo349Declarante/export', {
    ...queryParams.value
  }, `modelo349Declarante_${new Date().getTime()}.xlsx`)
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
