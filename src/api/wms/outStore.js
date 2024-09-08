import http from '@/utils/request'

export default {

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
