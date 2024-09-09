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
   * 分页查询采购单
   *
   * @param params
   * @returns
   */
  async getPurchaseByPage(params) {
    return await http.post('/api/purchase/page', params)
  },

  /**
   * 添加采购单
   *
   * @param params
   * @returns
   */
  async addPurchase(params) {
    return await http.post('/api/purchase/add', params)
  },

  /**
   * 编辑采购单
   *
   * @param params
   * @returns
   */
  async updatePurchase(params) {
    return await http.put('/api/purchase/update', params)
  },

  /**
   * 删除采购单
   *
   * @param params
   * @returns
   */
  async deletePurchase(params) {
    return await http.delete('/api/purchase/delete', params)
  }
}
