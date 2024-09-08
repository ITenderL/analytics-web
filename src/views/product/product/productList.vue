<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form ref="searchForm" label-width="80px" :inline="true" size="small">
      <el-form-item>
        <el-select v-model="storeName" filterable placeholder="请选择仓库">
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
        <el-input
          v-model="searchModel.productName"
          placeholder="请输入商品名称"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchModel.brandName"
          placeholder="请输入品牌名称"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchModel.productTypeName"
          placeholder="商品类型"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchModel.supplyName"
          placeholder="供应商"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="searchModel.placeName"
          placeholder="产地"
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
    <!--
      data属性：表格数据
      border属性：表格边框
      stripe属性：表格斑马线
      row-key属性：行数据的 Key，用来优化 Table 的渲染
      default-expand-all属性：默认展开树形表格数据
      tree-props属性：树形表格配置属性选型
    -->
    <el-table
      :data="productList"
      style="width: 100%; margin-bottom: 20px"
      row-key="productId"
      border
      stripe
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <!-- prop属性：填写数据的属性名称 -->
      <!-- label属性：表格表头标题 -->
      <el-table-column width="100" align="center" prop="imgs" label="商品图片">
        <template slot-scope="scope">
          <!--          <img :src="scope.row.imgs" :min-width="70" :height="70"/>-->
          <img :src="url" :min-width="40" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column width="180" align="center" prop="productName" label="商品名称"/>
      <el-table-column align="center" prop="brandName" label="品牌"/>
      <el-table-column align="center" prop="typeName" label="商品类型"/>
      <el-table-column align="center" prop="supplyName" label="供应商"/>
      <el-table-column width="80" align="center" prop="placeName" label="产地"/>
      <el-table-column width="100" align="center" prop="storeName" label="仓库"/>
      <el-table-column align="center" prop="upDownState" label="上下架">
        <template slot-scope="scope">
          {{ showUpDownStateName(scope.row.upDownState) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="salePrice" label="售价"/>
      <el-table-column width="60" align="center" prop="unitName" label="计量单位"/>
      <el-table-column align="center" prop="inPrice" label="商品进价"/>
      <el-table-column align="center" prop="salePrice" label="商品售价"/>
      <el-table-column align="center" prop="memPrice" label="商品会员价"/>
      <el-table-column width="120" align="center" prop="productDate" label="生产日期"/>
      <el-table-column width="120" align="center" prop="suppDate" label="保质期"/>
      <el-table-column
        fixed="right"
        label="操作"
        width="240"
        align="left"
      >
        <template slot-scope="scope">
          <el-button @click="handleEdit(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit') && scope.row.upDownState == '0'"
          >编辑
          </el-button>
          <el-button @click="handleDelete(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit') && scope.row.upDownState == '0'"
          >删除
          </el-button>
          <el-button @click="handleUpDownState(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit')"
          >{{ showUpDownStateButtonName(scope.row.upDownState) }}
          </el-button>
          <el-button @click="handlePurchase(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit')"
          >采购
          </el-button>
          <el-button @click="handleUpDownState(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit')"
          >盘点
          </el-button>
          <el-button @click="handleOutStore(scope.row)" type="text" size="small"
                     v-if="hasPermission('sys:department:edit') && scope.row.upDownState == '1'"
          >出库
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
    <!-- 添加和修改窗口 -->
    <system-dialog
      :title="productDialog.title"
      :visible="productDialog.visible"
      :width="productDialog.width"
      :height="productDialog.height"
      @onClose="onClose()"
      @onConfirm="onConfirm()"
    >
      <div slot="content">
        <el-form
          :model="product"
          ref="productForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
        >

          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="product.productName"></el-input>
          </el-form-item>
          <el-form-item label="商品编号" prop="productNum">
            <el-input v-model="product.productNum"></el-input>
          </el-form-item>
          <el-form-item label="商品类型">
            <el-select v-model="product.typeName" filterable placeholder="请选择商品类型" style="width: 175px">
              <el-option
                v-for="item in typeList"
                :key="item.typeId"
                :label="item.typeName"
                :value="item"
                @click.native="typeSelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number style="width: 175px" v-model="product.productInvent" @change="productInventChange" :min="1"
                             label="描述文字"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="品牌">
            <el-select v-model="product.brandName" filterable placeholder="请选择品牌" style="width: 175px">
              <el-option
                v-for="item in brandList"
                :key="item.brandId"
                :label="item.brandName"
                :value="item"
                @click.native="brandSelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="仓库">
            <el-select v-model="product.storeName" filterable placeholder="请选择仓库" style="width: 175px">
              <el-option
                v-for="item in storeList"
                :key="item.storeId"
                :label="item.storeName"
                :value="item"
                @click.native="storeSubSelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="供应商">
            <el-select v-model="product.supplyName" filterable placeholder="请选择供应商" style="width: 175px">
              <el-option
                v-for="item in supplyList"
                :key="item.supplyId"
                :label="item.supplyName"
                :value="item"
                @click.native="supplySelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产地">
            <el-select v-model="product.placeName" filterable placeholder="请选择产地" style="width: 175px">
              <el-option
                v-for="item in placeList"
                :key="item.placeId"
                :label="item.placeName"
                :value="item"
                @click.native="placeSelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="单位">
            <el-select v-model="product.unitName" filterable placeholder="请选择单位" style="width: 175px">
              <el-option
                v-for="item in unitList"
                :key="item.unitId"
                :label="item.unitName"
                :value="item"
                @click.native="unitSelectChange(item)"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="进价">
            <el-input-number @change="inPriceChange" style="width: 175px" v-model="product.inPrice" :precision="2"
                             :step="0.1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="售价">
            <el-input-number @change="salePriceChange" style="width: 175px" v-model="product.salePrice" :precision="2"
                             :step="0.1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="会员价">
            <el-input-number @change="memPriceChange" style="width: 175px" v-model="product.memPrice" :precision="2"
                             :step="0.1"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="生产日期">
            <div class="block">
              <el-date-picker
                v-model="product.productDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 175px"
              >
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item label="保质期">
            <div class="block">
              <el-date-picker
                v-model="product.suppDate"
                type="date"
                style="width: 175px"
                value-format="yyyy-MM-dd"
                placeholder="选择日期"
              >
              </el-date-picker>
            </div>
          </el-form-item>
          <el-form-item label="介绍">
            <el-input v-model="product.introduce"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
    <!-- 采购单窗口 -->
    <system-dialog
      :title="purchaseDialog.title"
      :visible="purchaseDialog.visible"
      :width="purchaseDialog.width"
      :height="purchaseDialog.height"
      @onClose="onPurchaseClose()"
      @onConfirm="onPurchaseConfirm()"
    >
      <div slot="content">
        <el-form
          :model="purchase"
          ref="purchaseForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
        >
          <el-form-item label="商品名称" prop="productName">
            <el-input readonly v-model="purchase.productName"></el-input>
          </el-form-item>
          <el-form-item label="仓库">
            <el-input readonly v-model="purchase.storeName"></el-input>
          </el-form-item>
          <el-form-item label="供应商">
            <el-input readonly v-model="purchase.supplyName"></el-input>
          </el-form-item>
          <el-form-item label="产地">
            <el-input readonly v-model="purchase.placeName"></el-input>
          </el-form-item>
          <el-form-item label="采购数量">
            <el-input-number style="width: 175px" v-model="purchase.buyNum" @change="productInventChange" :min="1"
                             label="描述文字"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="采购人">
            <el-input v-model="purchase.buyUser"></el-input>
          </el-form-item>
          <el-form-item label="采购人电话">
            <el-input v-model="purchase.phone"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>

    <!-- 出库单窗口 -->
    <system-dialog
      :title="outStoreDialog.title"
      :visible="outStoreDialog.visible"
      :width="outStoreDialog.width"
      :height="outStoreDialog.height"
      @onClose="onOutStoreClose()"
      @onConfirm="onOutStoreConfirm()"
    >
      <div slot="content">
        <el-form
          :model="outStore"
          ref="outStoreForm"
          :rules="rules"
          label-width="80px"
          :inline="true"
          size="small"
        >
          <el-form-item label="商品名称" prop="productName">
            <el-input readonly v-model="outStore.productName"></el-input>
          </el-form-item>
          <el-form-item label="仓库">
            <el-input readonly v-model="outStore.storeName"></el-input>
          </el-form-item>
          <el-form-item label="库存">
            <el-input readonly v-model="outStore.inventory"></el-input>
          </el-form-item>
          <el-form-item label="出库数量">
            <el-input-number style="width: 175px" v-model="outStore.outNum" @change="productInventChange" :min="1"
                             label="描述文字"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
//导入department脚本文件
//导入SystemDialog组件
import SystemDialog from '@/components/system/SystemDialog.vue'

import productApi from '@/api/wms/product'
import storeApi from '@/api/wms/store'
import brandApi from '@/api/wms/brand'
import placeApi from '@/api/wms/place'
import productTypeApi from '@/api/wms/productType'
import unitApi from '@/api/wms/unit'
import supplyApi from '@/api/wms/supply'
import purchaseApi from '@/api/wms/purchase'
import outStoreApi from '@/api/wms/outStore'

export default {
  name: 'department',
  //注册组件
  components: {
    SystemDialog
  },
  data() {
    return {
      fits: ['fill', 'contain', 'cover', 'none', 'scale-down'],
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      // url: 'file:///E:/workSpace/IdeaProjects/analytics/analytics-wms/target/classes/static/img/upload/hahah.png',
      storeList: [],
      typeList: [],
      brandList: [],
      productList: [],
      supplyList: [],
      placeList: [],
      unitList: [],
      searchModel: {
        // 查询条件
        roleName: '',
        pageNo: 1, //当前页码
        pageSize: 10, //每页显示数量
        userId: this.$store.getters.userId, //当前登录用户ID
        brandName: '',
        storeId: '',
        productName: '',
        productTypeName: '',
        supplyName: '',
        placeName: '',
        upDownState: '',
        state: ''
      },
      // 当前页码
      pageNo: 1,
      // 数据总数量
      total: 0,
      // 每页显示数量
      pageSize: 10,
      product: {
        storeId: '',
        storeName: '',
        brandId: '',
        brandName: '',
        productName: '',
        typeId: '',
        typeName: '',
        supply: '',
        supplyName: '',
        placeId: '',
        placeName: '',
        upDownState: '',
        upDownStateName: '',
        unitId: '',
        unitName: '',
        state: '',
        productId: '',
        productNum: '',
        productInvent: '',
        supplyId: '',
        introduce: '',
        inPrice: '',
        salePrice: '',
        memPrice: '',
        createTime: '',
        updateTime: '',
        createBy: '',
        updateBy: '',
        imgs: '',
        productDate: '',
        suppDate: '',
        isOverDate: ''
      },
      // 采购单
      purchase: {
        buyId: '',
        productId: '',
        productName: '',
        storeId: '',
        storeName: '',
        buyNum: '',
        factBuyNum: '',
        buyTime: '',
        supplyId: '',
        supplyName: '',
        placeId: '',
        placeName: '',
        buyUser: '',
        phone: '',
        isIn: ''
      },
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
      storeId: '',
      storeName: '',
      addStoreId: '',
      addStoreName: '',
      brandId: '',
      brandName: '',
      typeId: '',
      typeName: '',
      placeId: '',
      placeName: '',
      supplyId: '',
      supplyName: '',
      unitId: '',
      unitName: '',
      productDialog: {
        title: '', //窗口标题
        visible: false, //是否显示窗口
        width: 600, //窗口宽度
        height: 400 //窗口高度
      },
      dept: {
        id: '', //部门编号
        departmentName: '', //部门名称
        pid: '', //所属部门id
        parentName: '', //所属部门名称
        phone: '', //电话
        address: '', //地址
        orderNum: '' //序号
      },
      //表单验证规则
      rules: {
        parentName: [
          { required: true, message: '请选择所属部门', trigger: 'change' }
        ],
        departmentName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ]
      },
      // 采购单窗口属性
      purchaseDialog: {
        //窗口标题
        title: '添加采购单',
        //是否显示窗口
        visible: false,
        //窗口宽度
        width: 300,
        //窗口高度
        height: 390
      },
      // 出库单窗口属性
      outStoreDialog: {
        //窗口标题
        title: '添加出库单',
        //是否显示窗口
        visible: false,
        //窗口宽度
        width: 300,
        //窗口高度
        height: 280
      },
      treeList: [], //树形数据
      // 树形组件默认属性值
      defaultProps: {
        children: 'children',
        label: 'departmentName'
      }
    }
  },
  //初始化时调用
  created() {
    //调用查询部门列表
    this.search()
  },
  methods: {
    /**
     * 查询商品列表
     */
    async search(pageNo = 1, pageSize = 10) {
      let storeRes = await storeApi.getStoreList()
      if (storeRes.success) {
        this.storeList = storeRes.data
      }
      let brandRes = await brandApi.getBrandList()
      if (brandRes.success) {
        this.brandList = brandRes.data
      }
      // 修改当前页码
      this.searchModel.pageNo = pageNo
      // 修改每页显示数量
      this.searchModel.pageSize = pageSize
      // 发送查询请求
      let res = await productApi.getProductPage(this.searchModel)
      // 判断是否成功
      if (res.success) {
        this.productList = res.data.records
        this.total = res.data.total
      }
    },
    storeSelectChange(data) {
      console.log(data)
      this.storeName = data.storeName
      this.searchModel.storeId = data.storeId
    },
    storeSubSelectChange(data) {
      this.product.storeId = data.storeId
      this.product.storeName = data.storeName
    },
    brandSelectChange(data) {
      this.product.brandId = data.brandId
      this.product.brandName = data.brandName
    },
    typeSelectChange(data) {
      this.product.typeId = data.typeId
      this.product.typeName = data.typeName
    },
    placeSelectChange(data) {
      this.product.placeId = data.placeId
      this.product.placeName = data.placeName
    },
    supplySelectChange(data) {
      this.product.supplyId = data.supplyId
      this.product.supplyName = data.supplyName
    },
    unitSelectChange(data) {
      this.product.unitId = data.unitId
      this.product.unitName = data.unitName
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
      // 修改当前页码
      this.pageNo = page
      // 调用查询方法
      this.search(page, this.pageSize)
    }
    ,
    /**
     * 重置查询条件
     */
    resetValue() {
      //清空数据
      this.searchModel.departmentName = ''
      //重新查询
      this.search()
    }
    ,
    /**
     * 打开添加窗口
     */
    async openAddWindow() {
      await this.initSelect()
      // 清空表单数据
      this.$resetForm('productForm', this.product)
      // 设置窗口属性
      this.productDialog.title = '新增商品'
      this.productDialog.visible = true
    },

    /**
     * 窗口关闭事件
     */
    onClose() {
      //关闭窗口
      this.productDialog.visible = false
    },

    async initSelect() {
      let storeRes = await storeApi.getStoreList()
      if (storeRes.success) {
        this.storeList = storeRes.data
      }
      let brandRes = await brandApi.getBrandList()
      if (brandRes.success) {
        this.brandList = brandRes.data
      }
      let typeRes = await productTypeApi.getProductTypeList()
      if (typeRes.success) {
        this.typeList = typeRes.data
      }
      let placeRes = await placeApi.getPlaceList()
      if (placeRes.success) {
        this.placeList = placeRes.data
      }
      let unitRes = await unitApi.getUnitList()
      if (unitRes.success) {
        this.unitList = unitRes.data
      }
      let supplyRes = await supplyApi.getSupplyList()
      if (supplyRes.success) {
        this.supplyList = supplyRes.data
      }
    },

    /**
     * 窗口确认事件
     */
    onConfirm() {
      //进行表单验证 Duplicate keys detected: 'product'.
      this.$refs.productForm.validate(async(valid) => {
        //如果验证通过
        if (valid) {
          let res
          //判断当前是新增还是修改（依据：判断当前dept对象的id属性是否为空）
          //发送新增请求
          this.product.userId = this.$store.getters.userId
          if (this.product.productId === '') {
            this.product.upDownState = '0'
            res = await productApi.addProduct(this.product)
          } else {
            //发送修改请求
            res = await productApi.updateProduct(this.product)
          }
          //判断是否成功
          if (res.success) {
            //提示成功
            this.$message.success(res.message)
            //刷新数据
            this.search()
            //关闭窗口
            this.productDialog.visible = false
          } else {
            //提示失败
            this.$message.error(res.message)
          }
        }
      })
    },

    /**
     * 编辑商品
     */
    async handleEdit(row) {
      await this.initSelect()
      debugger
      //数据回显
      this.$objCopy(row, this.product)
      //设置窗口标题
      this.productDialog.title = '编辑商品'
      //显示窗口
      this.productDialog.visible = true
    }
    ,
    /**
     * 删除部门
     */
    async handleDelete(row) {
      // 确认是否删除
      let confirm = await this.$myconfirm('确定要删除该商品吗?')
      if (confirm) {
        // 发送删除请求
        let res = await productApi.deleteProduct({ id: row.productId })
        // 判断是否成功
        if (res.success) {
          // 成功提示
          this.$message.success(res.message)
          // 刷新
          await this.search(this.pageNo, this.pageSize)
        } else {
          //失败提示
          this.$message.error(res.message)
        }
      }
    },

    productInventChange(value) {
      console.log(value)
      this.product.productInvent = value
    },
    inPriceChange(value) {
      console.log(value)
      this.product.inPrice = value
    },
    salePriceChange(value) {
      console.log(value)
      this.product.salePrice = value
    },
    memPriceChange(value) {
      console.log(value)
      this.product.memPrice = value
    },

    /**
     * 修改上下架状态
     *
     * @param row
     */
    async handleUpDownState(row) {
      let upDownStateName = this.showUpDownStateButtonName(row.upDownState)
      // 确认是否修改状态
      let confirm = await this.$myconfirm('确定要【' + upDownStateName + '】该商品吗?')
      if (confirm) {
        row.upDownState = row.upDownState == '1' ? '0' : '1'
        row.userId = this.$store.getters.userId
        // 发送更新请求
        let res = await productApi.updateUpDownState(row)
        // 判断是否成功
        if (res.success) {
          // 成功提示
          this.$message.success(res.message)
          // 刷新
          await this.search(this.pageNo, this.pageSize)
        } else {
          //失败提示
          this.$message.error(res.message)
        }
      }
    },

    /**
     *
     * @param v
     * @returns {string}
     */
    showUpDownStateName(state) {
      switch (state) {
        case '0':
          return '已下架'
        case '1':
          return '已上架'
        default:
          return '已下架'
      }
    },
    /**
     *
     * @param v
     * @returns {string}
     */
    showUpDownStateButtonName(state) {
      switch (state) {
        case '0':
          return '上架'
        case '1':
          return '下架'
        default:
          return '上架'
      }
    },

    /**
     * 采购
     */
    handlePurchase(row) {
      this.purchase.productId = row.productId
      this.purchase.productName = row.productName
      this.purchase.storeId = row.storeId
      this.purchase.storeName = row.storeName
      this.purchase.supplyId = row.supplyId
      this.purchase.supplyName = row.supplyName
      this.purchase.placeId = row.placeId,
        this.purchase.placeName = row.placeName,
        this.purchaseDialog.visible = true
    },
    /**
     * 采购单取消事件
     */
    onPurchaseClose() {
      this.purchaseDialog.visible = false
    },
    /**
     * 采购单确认事件
     */
    async onPurchaseConfirm() {
      // 进行表单验证
      this.$refs.purchaseForm.validate(async(valid) => {
        // 如果验证通过
        if (valid) {
          // 发送新增请求
          this.purchase.userId = this.$store.getters.userId
          this.purchase.isIn = '0'
          let res = await purchaseApi.addPurchase(this.purchase)
          //判断是否成功
          if (res.success) {
            //提示成功
            this.$message.success(res.message)
            //关闭窗口
            this.purchaseDialog.visible = false
            this.$router.push('/purchaseList')
          } else {
            //提示失败
            this.$message.error(res.message)
          }
        }
      })
    },
    /**
     * 采购
     */
    handleOutStore(row) {
      this.outStore.productId = row.productId
      this.outStore.productName = row.productName
      this.outStore.storeId = row.storeId
      this.outStore.storeName = row.storeName
      this.outStore.inventory = row.productInvent
      this.outStore.salePrice = row.salePrice
      this.outStoreDialog.visible = true
    },
    /**
     * 出库单取消事件
     */
    onOutStoreClose() {
      this.outStoreDialog.visible = false
    },
    /**
     * 出库单确认事件
     */
    async onOutStoreConfirm() {
      debugger
      if (this.outStore.outNum > this.outStore.inventory) {
        this.$message.error('出库数量不能大于库存数量')
        return
      }
      // 进行表单验证
      this.$refs.outStoreForm.validate(async(valid) => {
        // 如果验证通过
        if (valid) {
          // 发送新增请求
          this.outStore.createBy = this.$store.getters.userId
          this.outStore.isOut = '0'
          let res = await outStoreApi.addOutStore(this.outStore)
          // 判断是否成功
          if (res.success) {
            // 提示成功
            this.$message.success(res.message)
            // 关闭窗口
            this.outStoreDialog.visible = false
            this.$router.push('/outStoreList')
          } else {
            // 提示失败
            this.$message.error(res.message)
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-tree {
  .el-tree-node {
    position: relative;
    padding-left: 10px;
  }

  .el-tree-node__children {
    padding-left: 20px;
  }

  .el-tree-node :last-child:before {
    height: 40px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before,
  .el-tree-node:after {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .tree :first-child .el-tree-node:before {
    border-left: none;
  }

  .el-tree-node:before {
    border-left: 1px dotted #d9d9d9;
    bottom: 0px;
    height: 100%;
    top: -25px;
    width: 1px;
  }

  .el-tree-node:after {
    border-top: 1px dotted #d9d9d9;
    height: 20px;
    top: 14px;
    width: 24px;
  }

  .el-tree-node__expand-icon.is-leaf {
    width: 8px;
  }

  .el-tree-node__content > .el-tree-node__expand-icon {
    display: none;
  }

  .el-tree-node__content {
    line-height: 30px;
    height: 30px;
    padding-left: 10px !important;
  }
}

::v-deep .el-tree > div {
  &::before {
    display: none;
  }

  &::after {
    display: none;
  }
}
</style>
