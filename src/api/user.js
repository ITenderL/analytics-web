import http from '@/utils/request'

/**
 * 用户登录方法
 * @param  data
 * @returns
 */
export async function login(data) {
  return await http.login("/api/user/login", data);
}

/**
 * 获取登录用户信息
 * @param token
 * @returns
 */
export async function getInfo() {
  return await http.get("/api/sysUser/getInfo");
}

/**
 * 退出登录
 * @returns
 */
export async function logout(params) {
  return await http.post("/api/sysUser/logout", params);
}

/**
 * 获取用户菜单信息
 */
export async function getMenuList() {
  return await http.get("/api/sysUser/getMenuList");
}

/**
 * 刷新token
 * @returns
 */
export async function refreshTokenApi(params) {
  return await http.post("/api/sysUser/refreshToken", params);
}

export default {

  /**
   * 查询用户列表
   * @param params
   * @returns
   */
  async getUserList(params) {
    return await http.get("/api/user/list", params);
  },
  /**
   * 添加用户
   * @param params
   * @returns
   */
  async addUser(params) {
    return await http.post("/api/user/add", params);
  },
  /**
   * 修改用户
   * @param params
   * @returns
   */
  async updateUser(params) {
    return await http.put("/api/user/update", params);
  },
  /**
   * 删除用户
   * @param params
   * @returns
   */
  async deleteUser(params) {
    return await http.delete("/api/user/delete", params);
  },
  /**
   * 查询用户角色列表
   * @param params
   * @returns
   */
  async getAssignRoleList(params) {
    return await http.get("/api/user/getRoleListForAssign", params);
  },
  /**
   * 获取分配角色列表数据
   * @param params
   * @returns
   */
  async getRoleIdByUserId(params) {
    return await http.getRestApi("/api/user/getRoleByUserId", params);
  },
  /**
   * 分配角色
   */
  async assignRoleSave(params) {
    return await http.post("/api/user/saveUserRole", params)
  }
}
