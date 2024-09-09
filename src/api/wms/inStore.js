import http from '@/utils/request'

export default {
  /**
   * 新增入库单
   *
   * @param params
   * @returns
   */
  async addInStore(params) {
    return await http.post('/api/inStore/add', params)
  },

  /**
   * 分页查询入库单
   *
   * @param params
   * @returns
   */
  async getInStoreByPage(params) {
    return await http.post('/api/inStore/page', params)
  },

  /**
   * 确定入库
   *
   * @param params
   * @returns
   */
  async confirmInStore(params) {
    return await http.put('/api/inStore/confirm', params)
  },
}
