<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="明细状态" prop="situacion">
        <el-select v-model="queryParams.situacion" placeholder="请选择明细状态" clearable>
          <el-option
            v-for="dict in intrastat_detail_situacion"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="对方国家编码" prop="paisMiembro">
        <el-input
          v-model="queryParams.paisMiembro"
          placeholder="请输入对方国家编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="对方欧盟税号" prop="nifIvaContraparte">
        <el-input
          v-model="queryParams.nifIvaContraparte"
          placeholder="请输入对方欧盟税号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="运输方式" prop="modoTransporte">
        <el-select v-model="queryParams.modoTransporte" placeholder="请选择运输方式" clearable>
          <el-option
            v-for="dict in intrastat_detail_modo_transporte"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品编码" prop="mercancia">
        <el-input
          v-model="queryParams.mercancia"
          placeholder="请输入商品编码"
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
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['models:intrastatDetail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="intrastatDetailList" >
      <el-table-column label="序号"  type="index" width="55" align="center" />
      <el-table-column label="申报编号" align="center" prop="headId" />
      <el-table-column label="申报用户编号" align="center" prop="userId" />
      <el-table-column label="明细序号" align="center" prop="numPartida" />
      <el-table-column label="明细状态" align="center" prop="situacion" />
      <el-table-column label="对方国家编码" align="center" prop="paisMiembro" />
      <el-table-column label="对方国家名称" align="center" prop="miembroName" />
      <el-table-column label="对方欧盟税号" align="center" prop="nifIvaContraparte" />
      <el-table-column label="交易种类" align="center" prop="naturalezaTransaccion" />
      <el-table-column label="交货条件" align="center" prop="condicionEntrega" />
      <el-table-column label="运输方式" align="center" prop="modoTransporte" />
      <el-table-column label="港口机场代码" align="center" prop="puerto" />
      <el-table-column label="商品编码" align="center" prop="mercancia" />
      <el-table-column label="商品统计制度" align="center" prop="regimen" />
      <el-table-column label="原产国编码" align="center" prop="paisOrigen" />
      <el-table-column label="省份代码" align="center" prop="provincia" />
      <el-table-column label="货物净重" align="center" prop="masaNeta" />
      <el-table-column label="补充单位数量" align="center" prop="unidadSuplementaria" />
      <el-table-column label="发票金额" align="center" prop="importeFactura" />
      <el-table-column label="统计价值" align="center" prop="valorEstadístico" />
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

<script setup name="IntrastatDetail">
import { listIntrastatDetail } from "@/api/models/intrastatDetail"

const { proxy } = getCurrentInstance()
const { intrastat_detail_naturaleza_transaccion, intrastat_detail_regimen, intrastat_detail_situacion, intrastat_detail_condicion_entrega, intrastat_detail_puerto, intrastat_detail_modo_transporte } = proxy.useDict('intrastat_detail_naturaleza_transaccion', 'intrastat_detail_regimen', 'intrastat_detail_situacion', 'intrastat_detail_condicion_entrega', 'intrastat_detail_puerto', 'intrastat_detail_modo_transporte')

const intrastatDetailList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    situacion: null,
    paisMiembro: null,
    nifIvaContraparte: null,
    modoTransporte: null,
    mercancia: null,
  }
})

const { queryParams } = toRefs(data)

/** 查询intrastat申报明细列表 */
function getList() {
  loading.value = true
  listIntrastatDetail(queryParams.value).then(response => {
    intrastatDetailList.value = response.rows
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
  proxy.download('models/intrastatDetail/export', {
    ...queryParams.value
  }, `intrastatDetail_${new Date().getTime()}.xlsx`)
}

getList()
</script>
