import http from '@/utils/request'

export default {

  /**
   * 分页查询出库单
   *
   * @param params
   * @returns
   */
  async getOutStoreByPage(params) {
    return await http.post('/api/outStore/page', params)
  },

  /**
   * 确定出库
   *
   * @param params
   * @returns
   */
  async confirmOutStore(params) {
    return await http.put('/api/outStore/confirm', params)
  },

  /**
   * 新增出库单
   *
   * @param params
   * @returns
   */
  async addOutStore(params) {
    return await http.post('/api/outStore/add', params)
  }
}
