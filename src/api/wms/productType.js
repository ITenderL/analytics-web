import http from '@/utils/request'

export default {
  /**
   * 查询商品类型列表
   *
   * @param params
   * @returns
   */
  async getProductTypeList(params) {
    return await http.get('/api/productType/list', params)
  }
}
