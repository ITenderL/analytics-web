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
        <el-input
          v-model="searchModel.buyUser"
          placeholder="采购人"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchModel.isInName" filterable placeholder="入库状态">
          <el-option
            v-for="item in purchaseIsInStateList"
            :key="item.isIn"
            :label="item.isInName"
            :value="item"
            @click.native="purchaseIsInStateSelectChange(item)"
          >
          </el-option>
        </el-select>
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
        <!--        <el-button-->
        <!--          type="success"-->
        <!--          icon="el-icon-plus"-->
        <!--          @click="openAddWindow()"-->
        <!--          v-if="hasPermission('sys:wms:edit')"-->
        <!--        >新增</el-button>-->
        <el-button
          type="success"
          icon="el-icon-plus"
          @click="openAddWindow()"
        >新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="purchaseList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column align="center" prop="storeName" label="仓库名称"></el-table-column>
      <el-table-column align="center" prop="productName" label="商品名称"></el-table-column>
      <el-table-column align="center" prop="buyNum" label="预计采购数量"></el-table-column>
      <el-table-column align="center" prop="factBuyNum" label="实际采购数量"></el-table-column>
      <el-table-column align="center" prop="buyUser" label="采购人"></el-table-column>
      <el-table-column align="center" prop="buyTime" label="采购时间"></el-table-column>
      <el-table-column align="center" prop="phone" label="采购人电话"></el-table-column>
      <el-table-column align="center" prop="isIn" label="入库状态">
        <template slot-scope="scope">
          {{ showPurchaseStateName(scope.row.isIn) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-if="hasPermission('sys:role:edit') && scope.row.factBuyNum == null"
          >编辑
          </el-button>
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-if="hasPermission('sys:role:delete') && scope.row.factBuyNum == null"
          >删除
          </el-button>
          <el-button
            icon="el-icon-setting"
            type="primary"
            size="small"
            @click="createInStore(scope.row)"
            v-if="hasPermission('sys:role:assign') && scope.row.isIn == '0' && scope.row.factBuyNum != null"
          >生成入库单
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
    <!-- 添加和修改角色窗口 -->
    <system-dialog
      :title="purchaseDialog.title"
      :visible="purchaseDialog.visible"
      :width="purchaseDialog.width"
      :height="purchaseDialog.height"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <!--        <el-form
                  :model="purchase"
                  ref="purchaseForm"
                  :rules="rules"
                  label-width="100px"
                  :inline="false"
                  size="small"
                >-->
        <el-form
          :model="purchase"
          ref="purchaseForm"
          label-width="100px"
          :inline="false"
          size="small"
        >
          <el-form-item label="采购单号">
            <el-input style="width: 175px" readonly v-model="purchase.buyId"></el-input>
          </el-form-item>
          <el-form-item label="仓库">
            <el-input style="width: 175px" readonly v-model="purchase.storeName"></el-input>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input style="width: 175px" readonly v-model="purchase.productName"></el-input>
          </el-form-item>
          <el-form-item label="预计采购数量">
            <el-input-number aria-readonly="true" style="width: 175px" v-model="purchase.buyNum" @change="buyNumChange"
                             :min="1"
                             label="描述文字"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="实际采购数量">
            <el-input-number style="width: 175px" v-model="purchase.factBuyNum" @change="factBuyNumChange" :min="1"
                             label="描述文字"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
//导入对话框组件
import SystemDialog from '@/components/system/SystemDialog.vue'
//导入末级节点脚本

import purchaseApi from '@/api/wms/purchase'
import storeApi from '@/api/wms/store'
import inStoreApi from '@/api/wms/inStore'

export default {
  name: 'purchaseList',
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
        isIn: '',
        isInName: '',
        storeName: ''
      },
      // 采购单集合
      purchaseList: [],
      purchase: {
        buyId: '',
        productId: '',
        storeId: '',
        buyNum: '',
        factBuyNum: '',
        buyTime: '',
        supplyId: '',
        placeId: '',
        specId: '',
        buyUser: '',
        phone: '',
        isIn: '',
        storeName: '',
        productName: '',
        specName: '',
        placeName: '',
        startTime: '',
        endTime: ''
      },
      storeList: [],
      storeId: '',
      storeName: '',
      purchaseIsInStateList: [
        { isIn: 0, isInName: '未入库' },
        { isIn: 1, isInName: '已入库' }
      ],
      isIn: '',
      isInName: '',
      inStore: {
        insId: '',
        storeId: '',
        productId: '',
        inNum: '',
        createBy: '',
        createTime: '',
        isIn: '',
        buyId: ''
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
      // 添加和修改角色窗口属性
      purchaseDialog: {
        title: '',
        visible: false,
        height: 320,
        width: 340
      },
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
      //修改当前页码
      this.searchModel.pageNo = pageNo
      //修改每页显示数量
      this.searchModel.pageSize = pageSize
      //发生查询请求
      let res = await purchaseApi.getPurchaseByPage(this.searchModel)
      //判断是否成功
      if (res.success) {
        //赋值
        this.purchaseList = res.data.records
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

    purchaseIsInStateSelectChange(data) {
      console.log(data)
      this.searchModel.isInName = data.isInName
      this.searchModel.isIn = data.isIn
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

    showPurchaseStateName(state) {
      switch (state) {
        case '0':
          return '未入库'
        case '1':
          return '已入库'
        default:
          return '未入库'
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
      //清空数据
      this.searchModel.storeId = ''
      this.searchModel.productName = ''
      this.searchModel.buyUser = ''
      this.searchModel.startTime = ''
      this.searchModel.endTime = ''
      this.searchModel.isIn = ''
      this.searchModel.isInName = ''
      this.searchModel.storeName = ''
      //重新查询
      this.search()
    },
    /**
     * 打开添加窗口
     */
    openAddWindow() {
      //清空表单数据
      this.$resetForm('purchaseForm', this.purchase)
      //设置窗口标题
      this.purchaseDialog.title = '新增角色'
      //显示窗口
      this.purchaseDialog.visible = true
    },
    /**
     * 窗口取消事件
     */
    onClose() {
      this.purchaseDialog.visible = false
    },
    /**
     * 窗口确认事件
     */
    async onConfirm() {
      let res = await purchaseApi.updatePurchase(this.purchase)
      // 判断是否成功
      if (res.success) {
        // 提示成功
        this.$message.success(res.message)
        // 刷新数据
        this.search()
        // 关闭窗口
        this.purchaseDialog.visible = false
      } else {
        // 提示失败
        this.$message.error(res.message)
      }
    },
    /**
     * 编辑采购单
     */
    handleEdit(row) {
      // 数据回显
      this.$objCopy(row, this.purchase)
      // 设置窗口标题
      this.purchaseDialog.title = '编辑采购单'
      // 显示编辑角色窗口
      this.purchaseDialog.visible = true
    },
    /**
     * 删除角色
     */
    async handleDelete(row) {
      // 确认是否删除
      let confirm = await this.$myconfirm('确定要删除该数据吗?')
      if (confirm) {
        // 发送删除请求
        let res = await purchaseApi.deletePurchase({ id: row.buyId })
        // 判断是否成功
        if (res.success) {
          // 成功提示
          this.$message.success(res.message)
          // 刷新
          this.search(this.pageNo, this.pageSize)
        } else {
          // 失败提示
          this.$message.error(res.message)
        }
      }
    },

    /**
     * 生成入库单
     *
     * @param row
     * @returns {Promise<void>}
     */
    async createInStore(row) {
      this.inStore.isIn = '0'
      this.inStore.storeId = row.storeId
      this.inStore.createBy = this.$store.getters.userId
      this.inStore.inNum = row.factBuyNum
      this.inStore.buyId = row.buyId
      this.inStore.productId = row.productId
      let res = await inStoreApi.addInStore(this.inStore)
      if (res.success) {
        // 成功提示
        this.$message.success(res.message)
        // 刷新
        this.search(this.pageNo, this.pageSize)
      } else {
        // 失败提示
        this.$message.error(res.message)
      }
    },

    buyNumChange(value) {
      console.log(value)
      this.purchase.buyNum = value
    },

    factBuyNumChange(value) {
      console.log(value)
      this.purchase.factBuyNum = value
    }
  }
}
</script>

<style lang="scss" scoped></style>
