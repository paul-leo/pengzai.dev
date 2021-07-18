module.exports = {
    title: 'PENG',
    description: '记录学习和工作的点滴',
    dest: './dist',
    themeConfig: {
        sidebar: [
            {
                title:"主页",
                path:'/'
            },
            {
                title: '服务器',   // 必要的
                // path: '/server/install',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                collapsable: true, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: [
                  '/server/install'
                ]
              },
        ]
    }
}