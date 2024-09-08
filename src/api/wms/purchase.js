import http from '@/utils/request'

export default {
  /**
   * 查询采购单列表
   *
   * @param params
   * @returns
   */
  async getPurchaseList(params) {
    return await http.get('/api/purchase/list', params)
  },

  /**
   * 添加采购单
   *
   * @param params
   * @returns
   */
  async addPurchase(params) {
    return await http.post('/api/purchase/add', params)
  }
}
