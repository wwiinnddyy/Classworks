# 阑山桌面插件集成契约

Classworks for Lan Desktop 是 Classworks 的独立桌面客户端组件。它不嵌入网页构建产物，而是通过 Classworks 已有 KV API 读取和更新同一份班级数据。

## 权威协议

插件应与当前 Classworks 客户端保持以下约定：

| 项目 | 约定 |
| --- | --- |
| 默认 KV 服务 | `https://kv-service.houlang.cloud` |
| 兼容 KV 服务 | `https://kv-service.wuyuan.dev` |
| App ID | `d158067f53627d2b98babe8bffd2fd7d` |
| 令牌申请 | `POST /apps/auth/token` |
| KV 鉴权头 | `x-app-token: <token>` |
| 每日数据键 | `classworks-data-YYYYMMDD` |
| 作业内容 | `homework.<subject>.content` |
| 考勤内容 | `attendance`，插件写作业时必须保留 |

服务端有时会把 KV 值包装为 `{ "value": { ... } }`。客户端读取时应兼容包装与未包装两种响应；写入时提交实际作业板对象。

## 兼容性要求

- 插件更新作业时只替换 `homework`，不得清空 `attendance` 或未知扩展字段。
- 直接复用网页端 App Token 时，不再要求保存命名空间密码。
- 使用命名空间与密码换取令牌时，默认使用上表 App ID。
- 令牌不得写入仓库、日志、Release 资产或错误报告。

## 版本边界

阑山桌面插件仓库负责 .NET/Plugin SDK、桌面 UI、`.laapp` 和市场发布；本仓库负责 Classworks 数据格式与 Web 客户端行为。协议发生变化时，应同步更新本文件和插件仓库 README。
