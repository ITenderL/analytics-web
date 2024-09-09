<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form ref="searchForm" label-width="80px" :inline="true" size="small">
      <el-form-item>
        <el-select v-model="searchModel.storeName" filterable placeholder="请选择仓库">
          <el-option
            v-for="item in storeList"
            :key="item.storeId"
            :label="item.storeName"
            :value="item"
            @click.native="storeSelectChange(item)"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <div class="block">
          <el-date-picker
            v-model="value2"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
            value-format="yyyy-MM-dd"
            @change="selectQueryDateRange"
          >
          </el-date-picker>
        </div>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchModel.productName"
          placeholder="商品名称"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search()"
        >查询
        </el-button
        >
        <el-button icon="el-icon-refresh-right" @click="resetValue()"
        >重置
        </el-button
        >
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="outStoreList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column align="center" prop="outsId" label="出库单ID"></el-table-column>
      <el-table-column align="center" prop="storeName" label="仓库名称"></el-table-column>
      <el-table-column align="center" prop="productName" label="商品名称"></el-table-column>
      <el-table-column align="center" prop="tallyName" label="理货员"></el-table-column>
      <el-table-column align="center" prop="outNum" label="出库数量"></el-table-column>
      <el-table-column align="center" prop="isOut" label="出库状态">
        <template slot-scope="scope">
          {{ showIsOutName(scope.row.isOut) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="createBy" label="创建人"></el-table-column>
      <el-table-column align="center" prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-setting"
            type="primary"
            size="small"
            @click="outStoreConfirm(scope.row)"
            v-if="hasPermission('sys:role:assign') && scope.row.isOut == '0'"
          >确定出库
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页工具栏 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNo"
      :page-sizes="[10, 20, 30, 40, 50]"
      :page-size="10"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </el-main>
</template>

<script>
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue'
//导入末级节点脚本

import storeApi from '@/api/wms/store'
import outStoreApi from '@/api/wms/outStore'

export default {
  name: 'outStoreList',
  //注册组件
  components: {
    SystemDialog
  },
  data() {
    return {
      //查询条件
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        userId: this.$store.getters.userId,
        storeId: '',
        startTime: '',
        endTime: '',
        productName: '',
        buyUser: '',
        isOut: '',
        isOutName: '',
        storeName: ''
      },
      // 出库单集合
      outStoreList: [],
      storeList: [],
      storeId: '',
      storeName: '',
      isOut: '',
      isOutName: '',
      // 出库单
      outStore: {
        outsId: '',
        productId: '',
        productName: '',
        storeId: '',
        storeName: '',
        inventory: '',
        tallyId: '',
        tallyName: '',
        outPrice: '',
        salePrice: '',
        outNum: '',
        createBy: '',
        createTime: '',
        isOut: ''
      },
      tableHeight: 0, //表格高度
      pageNo: 1, //当前页码
      total: 0, //数据总数量
      pageSize: 10, //每页显示数量
      // 表单验证规则
      // rules: {
      //   roleCode: [
      //     { required: true, trigger: 'blur', message: '请输入角色编码' }
      //   ],
      //   roleName: [
      //     { required: true, trigger: 'blur', message: '请输入角色名称' }
      //   ]
      // },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value2: ''
    }
  },
  created() {
    // 调用查询角色列表的方法
    this.search()
    // 初始化查询条件数据
    this.initSearchModelData()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220
    })
  },
  methods: {
    /**
     * 查询角色列表
     */
    async search(pageNo = 1, pageSize = 10) {
      // 修改当前页码
      this.searchModel.pageNo = pageNo
      // 修改每页显示数量
      this.searchModel.pageSize = pageSize
      // 发生查询请求
      let res = await outStoreApi.getOutStoreByPage(this.searchModel)
      // 判断是否成功
      if (res.success) {
        // 赋值
        this.outStoreList = res.data.records
        this.total = res.data.total
      }
    },
    async initSearchModelData() {
      let storeRes = await storeApi.getStoreList()
      if (storeRes.success) {
        this.storeList = storeRes.data
      }
    },

    storeSelectChange(data) {
      console.log(data)
      this.searchModel.storeName = data.storeName
      this.searchModel.storeId = data.storeId
    },

    selectQueryDateRange(val) {
      console.log(val)
      if (val) {
        this.searchModel.startTime = val[0]
        this.searchModel.endTime = val[1]
      } else {
        this.searchModel.startTime = ''
        this.searchModel.endTime = ''
      }
    },

    showIsOutName(state) {
      switch (state) {
        case '0':
          return '未出库'
        case '1':
          return '已出库'
        default:
          return '未出库'
      }
    },

    /**
     * 当每页显示数量发生变化时触发
     */
    handleSizeChange(size) {
      //修改每页显示数量
      this.pageSize = size
      //调用查询方法
      this.search(this.pageNo, size)
    },
    /**
     * 当页码发生变化时触发
     */
    handleCurrentChange(page) {
      //修改当前页码
      this.pageNo = page
      //调用查询方法
      this.search(page, this.pageSize)
    },

    /**
     * 重置查询条件
     */
    resetValue() {
      // 清空数据
      this.searchModel.storeId = ''
      this.searchModel.productName = ''
      this.searchModel.buyUser = ''
      this.searchModel.startTime = ''
      this.searchModel.endTime = ''
      this.searchModel.isOut = ''
      this.searchModel.isOutName = ''
      this.searchModel.storeName = ''
      // 重新查询
      this.search()
    },
    /**
     * 确认入库
     *
     * @param row
     * @returns {Promise<void>}
     */
    async outStoreConfirm(row) {
      this.outStore.outsId = row.outsId
      this.outStore.outNum = row.outNum
      this.outStore.productId = row.productId
      let res = await outStoreApi.confirmOutStore(this.outStore)
      if (res.success) {
        // 成功提示
        this.$message.success(res.message)
        // 刷新
        await this.search(this.pageNo, this.pageSize)
      } else {
        // 失败提示
        this.$message.error(res.message)
      }
    },
  }
}
</script>
<style lang="scss" scoped></style>
