/**
 * @fileoverview YYC³ UI 组件库示例
 * @description 展示所有组件的使用示例
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import { defineComponent, ref } from 'vue'
import { Button } from '@/components/UI/Button'
import { Input } from '@/components/UI/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/UI/Card'
import { Badge } from '@/components/UI/Badge'
import { Alert } from '@/components/UI/Alert'
import { Modal } from '@/components/UI/Modal'
import { Avatar, AvatarGroup } from '@/components/UI/Avatar'
import { Divider } from '@/components/UI/Divider'
import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components/UI/Skeleton'
import { Empty } from '@/components/UI/Empty'
import { Checkbox, CheckboxGroup } from '@/components/UI/Checkbox'
import { Radio, RadioGroup } from '@/components/UI/Radio'
import { Switch } from '@/components/UI/Switch'
import { Select } from '@/components/UI/Select'
import { Form, FormField, FormLabel, FormError } from '@/components/UI/Form'
import { Dropdown } from '@/components/UI/Dropdown'
import { Breadcrumb } from '@/components/UI/Breadcrumb'
import { Pagination } from '@/components/UI/Pagination'
import { Table } from '@/components/UI/Table'
import { List } from '@/components/UI/List'
import { Tree } from '@/components/UI/Tree'
import { Timeline } from '@/components/UI/Timeline'
import { Drawer } from '@/components/UI/Drawer'
import { Dialog } from '@/components/UI/Dialog'
import { Tooltip } from '@/components/UI/Tooltip'
import { Layout, LayoutHeader, LayoutSider, LayoutContent, LayoutFooter } from '@/components/UI/Layout'
import { Grid, GridItem } from '@/components/UI/Grid'
import { Space } from '@/components/UI/Space'
import { Flex, FlexItem } from '@/components/UI/Flex'
import { Search, User, Bell, Settings, LogOut, Menu, X, Plus, Edit, Trash } from 'lucide-vue-next'

export default function ComponentExamples() {
  const modalVisible = ref(false)
  const drawerVisible = ref(false)
  const dialogVisible = ref(false)
  const inputValue = ref('')
  const selectValue = ref('')
  const checkboxValue = ref([])
  const radioValue = ref('option1')
  const switchValue = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(100)

  const tableData = ref([
    { id: 1, name: '张三', age: 25, address: '北京市朝阳区' },
    { id: 2, name: '李四', age: 30, address: '上海市浦东新区' },
    { id: 3, name: '王五', age: 28, address: '广州市天河区' },
  ])

  const tableColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '地址', dataIndex: 'address', key: 'address' },
  ]

  const dropdownItems = [
    { label: '个人中心', value: 'profile', icon: User },
    { label: '消息通知', value: 'notification', icon: Bell },
    { label: '系统设置', value: 'settings', icon: Settings },
    { divider: true },
    { label: '退出登录', value: 'logout', icon: LogOut, danger: true },
  ]

  const breadcrumbItems = [
    { label: '首页', path: '/' },
    { label: '组件库', path: '/components' },
    { label: '示例', path: '/examples' },
  ]

  const selectOptions = [
    { label: '选项一', value: 'option1' },
    { label: '选项二', value: 'option2' },
    { label: '选项三', value: 'option3' },
  ]

  const treeData = [
    {
      label: '父节点 1',
      value: '1',
      children: [
        { label: '子节点 1-1', value: '1-1' },
        { label: '子节点 1-2', value: '1-2' },
      ],
    },
    {
      label: '父节点 2',
      value: '2',
      children: [
        { label: '子节点 2-1', value: '2-1' },
        { label: '子节点 2-2', value: '2-2' },
      ],
    },
  ]

  const timelineData = [
    { title: '创建项目', time: '2024-01-01 10:00' },
    { title: '完成设计', time: '2024-01-05 14:00' },
    { title: '开始开发', time: '2024-01-10 09:00' },
    { title: '测试上线', time: '2024-01-20 16:00' },
  ]

  return (
    <div class="min-h-screen bg-neutral-50 p-8">
      <div class="max-w-7xl mx-auto space-y-12">
        {/* 标题 */}
        <div class="text-center space-y-2">
          <h1 class="text-4xl font-bold text-neutral-900">YYC³ UI 组件库</h1>
          <p class="text-lg text-neutral-600">基于 Vue 3 + TypeScript + Tailwind CSS</p>
        </div>

        {/* 按钮组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Button 按钮</CardTitle>
          </CardHeader>
          <CardContent>
            <Space direction="vertical" size="large">
              <Space>
                <Button type="primary">主要按钮</Button>
                <Button>默认按钮</Button>
                <Button type="success">成功按钮</Button>
                <Button type="warning">警告按钮</Button>
                <Button type="danger">危险按钮</Button>
              </Space>
              <Space>
                <Button size="sm">小型按钮</Button>
                <Button>默认按钮</Button>
                <Button size="lg">大型按钮</Button>
              </Space>
              <Space>
                <Button disabled>禁用按钮</Button>
                <Button loading>加载中</Button>
                <Button icon={<Plus size={16} />}>带图标</Button>
              </Space>
            </Space>
          </CardContent>
        </Card>

        {/* 输入框组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Input 输入框</CardTitle>
          </CardHeader>
          <CardContent>
            <Space direction="vertical" size="large">
              <Input placeholder="请输入内容" v-model={inputValue.value} />
              <Input placeholder="带图标" prefix={<Search size={16} />} />
              <Input placeholder="可清空" clearable />
              <Input placeholder="禁用状态" disabled />
              <Input placeholder="错误状态" error errorMessage="请输入有效的内容" />
            </Space>
          </CardContent>
        </Card>

        {/* 卡片组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Card 卡片</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={3} gap={4}>
              <Card hoverable>
                <CardHeader>
                  <CardTitle>可悬停卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>鼠标悬停查看效果</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>普通卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>这是卡片内容</p>
                </CardContent>
              </Card>
              <Card bordered={false}>
                <CardHeader>
                  <CardTitle>无边框卡片</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>无边框样式</p>
                </CardContent>
              </Card>
            </Grid>
          </CardContent>
        </Card>

        {/* 徽章组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Badge 徽章</CardTitle>
          </CardHeader>
          <CardContent>
            <Space>
              <Badge>默认</Badge>
              <Badge variant="primary">主要</Badge>
              <Badge variant="success">成功</Badge>
              <Badge variant="warning">警告</Badge>
              <Badge variant="danger">危险</Badge>
              <Badge count={5}>消息</Badge>
              <Badge count={99}>通知</Badge>
              <Badge count={100} maxCount={99}>更多</Badge>
            </Space>
          </CardContent>
        </Card>

        {/* 警告提示组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Alert 警告提示</CardTitle>
          </CardHeader>
          <CardContent>
            <Space direction="vertical" size="large">
              <Alert>这是一条默认提示</Alert>
              <Alert variant="info">这是一条信息提示</Alert>
              <Alert variant="success">这是一条成功提示</Alert>
              <Alert variant="warning">这是一条警告提示</Alert>
              <Alert variant="danger">这是一条错误提示</Alert>
            </Space>
          </CardContent>
        </Card>

        {/* 模态框组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Modal 模态框</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="primary" onClick={() => modalVisible.value = true}>
              打开模态框
            </Button>
            <Modal
              visible={modalVisible.value}
              title="模态框示例"
              onUpdate:visible={(v) => modalVisible.value = v}
            >
              <p>这是模态框的内容</p>
            </Modal>
          </CardContent>
        </Card>

        {/* 抽屉组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Drawer 抽屉</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="primary" onClick={() => drawerVisible.value = true}>
              打开抽屉
            </Button>
            <Drawer
              visible={drawerVisible.value}
              title="抽屉示例"
              onUpdate:visible={(v) => drawerVisible.value = v}
            >
              <p>这是抽屉的内容</p>
            </Drawer>
          </CardContent>
        </Card>

        {/* 对话框组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog 对话框</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="danger" onClick={() => dialogVisible.value = true}>
              打开确认对话框
            </Button>
            <Dialog
              visible={dialogVisible.value}
              type="warning"
              title="确认删除"
              content="确定要删除这条数据吗？"
              onUpdate:visible={(v) => dialogVisible.value = v}
              onOk={() => console.log('确认')}
              onCancel={() => console.log('取消')}
            />
          </CardContent>
        </Card>

        {/* 提示框组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip 提示框</CardTitle>
          </CardHeader>
          <CardContent>
            <Space>
              <Tooltip content="这是提示内容">
                <Button>悬停查看</Button>
              </Tooltip>
              <Tooltip content="这是提示内容" placement="top">
                <Button>顶部提示</Button>
              </Tooltip>
              <Tooltip content="这是提示内容" placement="bottom">
                <Button>底部提示</Button>
              </Tooltip>
              <Tooltip content="这是提示内容" placement="left">
                <Button>左侧提示</Button>
              </Tooltip>
              <Tooltip content="这是提示内容" placement="right">
                <Button>右侧提示</Button>
              </Tooltip>
            </Space>
          </CardContent>
        </Card>

        {/* 头像组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar 头像</CardTitle>
          </CardHeader>
          <CardContent>
            <Space>
              <Avatar size="sm" text="张" />
              <Avatar text="李四" />
              <Avatar size="lg" text="王五" />
              <Avatar size="xl" text="赵六" />
              <AvatarGroup max={3}>
                <Avatar text="A" />
                <Avatar text="B" />
                <Avatar text="C" />
                <Avatar text="D" />
                <Avatar text="E" />
              </AvatarGroup>
            </Space>
          </CardContent>
        </Card>

        {/* 分割线组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Divider 分割线</CardTitle>
          </CardHeader>
          <CardContent>
            <Space direction="vertical" size="large">
              <p>上方内容</p>
              <Divider />
              <p>下方内容</p>
              <Divider>带文字的分割线</Divider>
              <p>更多内容</p>
            </Space>
          </CardContent>
        </Card>

        {/* 骨架屏组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton 骨架屏</CardTitle>
          </CardHeader>
          <CardContent>
            <Space direction="vertical" size="large">
              <SkeletonAvatar />
              <SkeletonText lines={3} />
              <SkeletonButton />
            </Space>
          </CardContent>
        </Card>

        {/* 空状态组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Empty 空状态</CardTitle>
          </CardHeader>
          <CardContent>
            <Empty description="暂无数据" />
            <Empty type="error" description="加载失败" showAction actionText="重试" />
          </CardContent>
        </Card>

        {/* 表单组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Form 表单</CardTitle>
          </CardHeader>
          <CardContent>
            <Form>
              <Space direction="vertical" size="large">
                <FormField name="username" label="用户名" required>
                  <Input placeholder="请输入用户名" />
                </FormField>
                <FormField name="email" label="邮箱" required>
                  <Input type="email" placeholder="请输入邮箱" />
                </FormField>
                <FormField name="role" label="角色">
                  <Select
                    v-model={selectValue.value}
                    options={selectOptions}
                    placeholder="请选择角色"
                  />
                </FormField>
                <FormField name="agree" label="同意协议">
                  <Checkbox v-model={checkboxValue.value} label="我同意用户协议" />
                </FormField>
              </Space>
            </Form>
          </CardContent>
        </Card>

        {/* 下拉菜单组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown 下拉菜单</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropdown
              trigger={<Button>点击打开</Button>}
              items={dropdownItems}
              onSelect={(item) => console.log('选中:', item)}
            />
          </CardContent>
        </Card>

        {/* 面包屑组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb 面包屑</CardTitle>
          </CardHeader>
          <CardContent>
            <Breadcrumb
              items={breadcrumbItems}
              onClick={(item) => console.log('点击:', item)}
            />
          </CardContent>
        </Card>

        {/* 分页组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Pagination 分页</CardTitle>
          </CardHeader>
          <CardContent>
            <Pagination
              currentPage={currentPage.value}
              pageSize={pageSize.value}
              total={total.value}
              onChange={(page) => currentPage.value = page}
            />
          </CardContent>
        </Card>

        {/* 表格组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Table 表格</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              columns={tableColumns}
              data={tableData.value}
              rowKey="id"
            />
          </CardContent>
        </Card>

        {/* 布局组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Layout 布局</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-64 border border-neutral-200 rounded-lg overflow-hidden">
              <Layout>
                <LayoutSider width={200}>侧边栏</LayoutSider>
                <Layout>
                  <LayoutHeader>头部</LayoutHeader>
                  <LayoutContent>内容区</LayoutContent>
                  <LayoutFooter>页脚</LayoutFooter>
                </Layout>
              </Layout>
            </div>
          </CardContent>
        </Card>

        {/* 网格组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Grid 网格</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={4} gap={4}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <GridItem key={item}>
                  <div class="bg-primary-100 text-primary-700 p-4 rounded-lg text-center">
                    {item}
                  </div>
                </GridItem>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* 弹性布局组件 */}
        <Card>
          <CardHeader>
            <CardTitle>Flex 弹性布局</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex justify="space-between" align="center">
              <FlexItem>左侧</FlexItem>
              <FlexItem>中间</FlexItem>
              <FlexItem>右侧</FlexItem>
            </Flex>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
