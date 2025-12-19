/** el-input 自动聚焦选中内容的注解 v-focusSelect */
export default {
  mounted(el) {
    el.querySelector('input').addEventListener('focus', (event) => {
      event.target.select();
    });
  },
}