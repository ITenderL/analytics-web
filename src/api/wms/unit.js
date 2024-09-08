import http from '@/utils/request'

export default {
  /**
   * 查询计量单位列表
   *
   * @param params
   * @returns
   */
  async getUnitList(params) {
    return await http.get('/api/unit/list', params)
  }
}
