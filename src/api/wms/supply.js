import http from '@/utils/request'

export default {
  /**
   * 查询供应商列表
   *
   * @param params
   * @returns
   */
  async getSupplyList(params) {
    return await http.get('/api/supply/list', params)
  }
}
