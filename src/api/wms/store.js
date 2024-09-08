import http from '@/utils/request'

export default {
  /**
   * 查询仓库
   *
   * @param params
   * @returns
   */
  async getStoreList(params) {
    return await http.get('/api/store/list', params)
  },
}
