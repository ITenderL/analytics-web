import http from '@/utils/request'

export default {

  /**
   * 分页查询商品
   *
   * @param params
   * @returns
   */
  async getProductPage(params) {
    return await http.post('/api/product/page', params)
  },

  /**
   * 查询商品
   *
   * @param params
   * @returns
   */
  async getProductList(params) {
    return await http.get('/api/product/list', params)
  },
  /**
   * 添加商品
   * @param params
   * @returns
   */
  async addProduct(params) {
    return await http.post('/api/product/add', params)
  },
  /**
   * 修改商品
   * @param params
   * @returns
   */
  async updateProduct(params) {
    return await http.put('/api/product/update', params)
  },
  /**
   * 删除商品
   * @param params
   * @returns
   */
  async deleteProduct(params) {
    return await http.delete('/api/product/delete', params)
  },

  /**
   * 修改商品上下架状态
   * @param params
   * @returns
   */
  async updateUpDownState(params) {
    return await http.put('/api/product/updateUpDownState', params)
  }
}
