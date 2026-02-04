/**
 * 表格行ID生成器（简化版）
 * 支持临时操作生成不重复的ID，适合20000条数据以内的场景
 */

class TableRowIdGenerator {
  constructor() {
    this.sequence = 0;                // 当前序号
    this.generatedIds = new Set();    // 用于检查重复
    this.instanceId = Math.floor(Math.random() * 1000); // 实例ID，避免多实例冲突
  }

  /**
   * 生成简易Long类型ID
   * 格式：时间戳后8位 + 3位实例ID + 4位序列号 = 15位数字
   * @returns {string} 生成的数字字符串ID
   */
  generateLongId() {
    const now = Date.now();
    // 取时间戳后8位（已经足够，100年内不会重复）
    const timestampPart = (now % 100000000).toString().padStart(8, '0');

    // 实例ID（3位，0-999）
    const instancePart = this.instanceId.toString().padStart(3, '0');

    // 序列号（4位，0-9999）
    const sequencePart = this.sequence.toString().padStart(4, '0');

    // 生成ID
    const id = `${timestampPart}${instancePart}${sequencePart}`;

    // 递增序列号，超过最大值重置
    this.sequence = (this.sequence + 1) % 10000;

    // 确保ID唯一性
    if (this.generatedIds.has(id)) {
      // 如果重复（极小概率），继续生成直到唯一
      return this.generateLongId();
    }

    this.generatedIds.add(id);
    return id;
  }

  /**
   * 生成更短的Long类型ID（推荐）
   * 格式：时间戳后6位 + 4位序列号 = 10位数字
   * @returns {string} 生成的数字字符串ID
   */
  generateShortLongId() {
    const now = Date.now();
    // 取时间戳后6位
    const timestampPart = (now % 1000000).toString().padStart(6, '0');

    // 序列号（4位，0-9999）
    const sequencePart = this.sequence.toString().padStart(4, '0');

    // 生成ID
    const id = `${timestampPart}${sequencePart}`;

    // 递增序列号
    this.sequence = (this.sequence + 1) % 10000;

    // 确保ID唯一性
    if (this.generatedIds.has(id)) {
      return this.generateShortLongId();
    }

    this.generatedIds.add(id);
    return id;
  }

  /**
   * 生成带前缀的String类型ID
   * @param {string} prefix - ID前缀
   * @returns {string} 生成的String类型ID
   */
  generateStringId(prefix = 'row') {
    const now = Date.now();
    // 取时间戳后6位
    const timestampPart = (now % 1000000).toString().padStart(6, '0');

    // 序列号（4位）
    const sequencePart = this.sequence.toString().padStart(4, '0');

    // 生成ID
    const id = `${prefix}_${timestampPart}_${sequencePart}`;

    // 递增序列号
    this.sequence = (this.sequence + 1) % 10000;

    // 确保ID唯一性
    if (this.generatedIds.has(id)) {
      return this.generateStringId(prefix);
    }

    this.generatedIds.add(id);
    return id;
  }

  /**
   * 通用ID生成方法
   * @param {string|undefined|null} prefix - ID前缀
   * @returns {string} 生成的ID
   */
  generateId(prefix) {
    if (prefix !== undefined && prefix !== null) {
      return this.generateStringId(prefix);
    }
    return this.generateShortLongId(); // 默认返回短ID
  }

  /**
   * 批量生成ID
   * @param {number} count - 生成数量
   * @param {string|undefined|null} prefix - ID前缀
   * @returns {string[]} 生成的ID数组
   */
  generateBatchIds(count, prefix) {
    const ids = [];
    for (let i = 0; i < count; i++) {
      ids.push(this.generateId(prefix));
    }
    return ids;
  }

  /**
   * 批量生成ID（高性能版，不检查重复）
   * 适用于知道生成数量且确信不会重复的场景
   * @param {number} count - 生成数量
   * @param {string|undefined|null} prefix - ID前缀
   * @returns {string[]} 生成的ID数组
   */
  generateBatchIdsFast(count, prefix) {
    const now = Date.now();
    const timestampPart = (now % 1000000).toString().padStart(6, '0');
    const ids = [];

    for (let i = 0; i < count; i++) {
      const sequencePart = this.sequence.toString().padStart(4, '0');

      let id;
      if (prefix !== undefined && prefix !== null) {
        id = `${prefix}_${timestampPart}_${sequencePart}`;
      } else {
        id = `${timestampPart}${sequencePart}`;
      }

      ids.push(id);
      this.sequence = (this.sequence + 1) % 10000;
    }

    return ids;
  }

  /**
   * 重置生成器
   */
  clear() {
    this.sequence = 0;
    this.generatedIds.clear();
  }

  /**
   * 获取已生成ID的数量
   * @returns {number}
   */
  getGeneratedCount() {
    return this.generatedIds.size;
  }
}

// 导出单例实例
export const tableRowIdGenerator = new TableRowIdGenerator();

// 导出类以便测试
export { TableRowIdGenerator };