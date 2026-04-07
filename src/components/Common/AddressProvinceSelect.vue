<template>
  <el-select-v2
    :model-value="modelValue"
    filterable
    remote
    clearable
    default-first-option
    :options="dataList"
    :remote-method="onSearch"
    :loading="loading"
    :disabled="disabled"
    :multiple="multiple"
    :placeholder="actualPlaceholder"
    :fit-input-width="false" 
    @change="handleChange"
    :size="size"
    :teleported='teleported'
  />
</template>

<script setup>
// 每次需要修改  1 - 6 处备注的信息
import { ref, watch } from "vue";
// 1 api 接口
import { listConfigAddressProvince } from "@/api/models/configAddressProvince.js";
import { debounce } from "lodash-es";
import { StatusEnum, DebounceTime, KeywordLength } from './CommonEnum.js'
import { MaxLengthEnum } from './CommonEnum.js';

// 2 组件参数
const props = defineProps({
  modelValue: [String, Number, Array],
  placeholder: { type: String, default: "" },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: "small" },
  teleported: { type: Boolean, default: false }
});

// 在模板中使用时处理默认值
const actualPlaceholder = computed(() => {
  return props.placeholder || "省份代码/编码/名称"
});

const emit = defineEmits(['update:modelValue', 'selectedData']);

const dataList = ref([]);
const loading = ref(false);
const keyword = ref("");
const pageNum = ref(1);
const pageSize = MaxLengthEnum.maxQuerySize;
const total = ref(0);


const fetchData = async (query = "") => {
  query  = query.trim();
  console.log("搜索关键词:", query);
  if (query.length < 1 || !query) {
    dataList.value = [];
    return;
  }
  loading.value = true;

  try {
    // 3 请求参数
    const queryParams = {
      provinceCode: null,
      provinceNum: null,
      provinceNameZh: null,
      provinceNameEs: null,
      provinceNameEn: null,
      pageNum: pageNum.value,
      pageSize
    };

    // 3.1 判断query参数
    if (/^\d{2}$/.test(query)) {
      // 两位数字（省份代码）
      queryParams.provinceNum = query;
    } else if (/^[A-Z]{1,3}$/.test(query)) {
      // 1-3位大写字母（省份编码）
      queryParams.provinceCode = query;
    } else {
      // 其他情况（省份名称）
      queryParams.provinceNameZh = query;
    }
    console.log("请求参数:", queryParams);

    // 4 发起请求
    const response = await listConfigAddressProvince(queryParams);
    dataList.value = response.rows.map(item => ({
      // 5 同步视图参数
      value: item.provinceNum,
      label: `${item.provinceNum} - ${item.provinceNameZh}`,
      data: item // 保留完整数据
    }));
    total.value = response.total || 0;
  } catch (error) {
    // 6 错误提示
    console.error("获取 身份配置 列表失败:", error);
  } finally {
    loading.value = false;
  }
};

/** 防抖搜索 */
const handleSearch = debounce(fetchData, DebounceTime);

/** 1 当前输入值发生变化触发的函数 */
const onSearch = (query) => {
  keyword.value = query;
  pageNum.value = 1;
  handleSearch(query);
};

/** 确保 v-model 绑定值能正确更新 */
const handleChange = (val) => {
  emit("update:modelValue", val);

  // 清空输入框时，确保选中的数据也是清空
  if (!val) {
    emit("selectedData", null); // 清空输入框时 -> 传递空数据对象
    return;
  }

  // 获取所选ID对应的完整数据对象
  const selectedData = dataList.value.find((item) => item.value === val);
  if (selectedData) {
    // 触发事件，传递所选ID对应的完整数据对象
    emit("selectedData", selectedData.data);
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) fetchData();
  },
  { immediate: true }
);
</script>