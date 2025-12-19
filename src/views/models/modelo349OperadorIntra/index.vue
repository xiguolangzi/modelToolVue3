<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="财政年度" prop="ejercicio">
        <el-input
          v-model="queryParams.ejercicio"
          placeholder="请输入财政年度"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申报人税号" prop="nifDeclarante">
        <el-input
          v-model="queryParams.nifDeclarante"
          placeholder="请输入申报人税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家代码" prop="codigoPais">
        <el-input
          v-model="queryParams.codigoPais"
          placeholder="请输入经营者国家代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="欧盟编号" prop="nifOperador">
        <el-input
          v-model="queryParams.nifOperador"
          placeholder="请输入经营者欧盟编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="经营者姓名" prop="nombreOperador">
        <el-input
          v-model="queryParams.nombreOperador"
          placeholder="请输入经营者姓名或公司名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作代码" prop="claveOperacion">
        <el-select v-model="queryParams.claveOperacion" placeholder="请选择操作代码" clearable>
          <el-option
            v-for="dict in model349_operation_key"
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
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:modelo349OperadorIntra:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="modelo349OperadorIntraList" >
      <el-table-column label="编码" align="center" prop="id" width="80"/>
      <el-table-column label="流水编号" align="center" prop="declaranteId" width="80"/>
      <el-table-column label="记录类型" align="center" prop="tipoRegistro" width="80"/>
      <el-table-column label="申报模型" align="center" prop="modeloDeclaracion" width="80"/>
      <el-table-column label="财政年度" align="center" prop="ejercicio" width="80"/>
      <el-table-column label="申报人税号" align="left" header-align="center" prop="nifDeclarante" />
      <el-table-column label="国家代码" align="left" header-align="center" prop="codigoPais" width="80"/>
      <el-table-column label="欧盟编号" align="left" header-align="center" prop="nifOperador" />
      <el-table-column label="经营者姓名" align="left" header-align="center" prop="nombreOperador" min-width="200" show-overflow-tooltip/>
      <el-table-column label="操作代码" align="center" prop="claveOperacion">
        <template #default="scope">
          <dict-tag :options="model349_operation_key" :value="scope.row.claveOperacion"/>
        </template>
      </el-table-column>
      <el-table-column label="交易金额" align="right" header-align="center" prop="baseImponible" />
      <el-table-column label="修正的财政年度" align="center" prop="ejercicioRectificacion" />
      <el-table-column label="修正的期间" align="center" prop="periodoRectificacion">
        <template #default="scope">
          <dict-tag :options="model349_periodo" :value="scope.row.periodoRectificacion"/>
        </template>
      </el-table-column>
      <el-table-column label="修正后的交易金额" align="right" header-align="center" prop="baseImponibleRectificada" />
      <el-table-column label="先前申报的交易金额" align="right" header-align="center" prop="baseImponibleAnterior" />
      <el-table-column label="替代最终接收者的税号" align="left" header-align="center" prop="nifDestinatarioSustituto" show-overflow-tooltip />
      <el-table-column label="替代最终接收者的姓名" align="left" header-align="center" prop="nombreDestinatarioSustituto" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['models:modelo349OperadorIntra:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['models:modelo349OperadorIntra:remove']">删除</el-button>
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

<script setup name="Modelo349OperadorIntra">
import { listModelo349OperadorIntra } from "@/api/models/modelo349OperadorIntra"

const { proxy } = getCurrentInstance()
const { model349_operation_key, model349_periodo } = proxy.useDict('model349_operation_key', 'model349_periodo')

const modelo349OperadorIntraList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ejercicio: null,
    nifDeclarante: null,
    codigoPais: null,
    nifOperador: null,
    nombreOperador: null,
    claveOperacion: null,
  }
})

const { queryParams } = toRefs(data)

/** 查询349经营者记录明细列表 */
function getList() {
  loading.value = true
  listModelo349OperadorIntra(queryParams.value).then(response => {
    modelo349OperadorIntraList.value = response.rows
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


/** 导出按钮操作 */
function handleExport() {
  proxy.download('models/modelo349OperadorIntra/export', {
    ...queryParams.value
  }, `modelo349OperadorIntra_${new Date().getTime()}.xlsx`)
}

getList()
</script>
