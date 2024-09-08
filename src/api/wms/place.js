import http from '@/utils/request'

export default {
  /**
   * 查询产地列表
   *
   * @param params
   * @returns
   */
  async getPlaceList(params) {
    return await http.get('/api/place/list', params)
  }
}
