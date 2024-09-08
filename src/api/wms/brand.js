import http from '@/utils/request'

export default {
  /**
   * 查询品牌列表
   *
   * @param params
   * @returns
   */
  async getBrandList(params) {
    return await http.get('/api/brand/list', params)
  }
}
