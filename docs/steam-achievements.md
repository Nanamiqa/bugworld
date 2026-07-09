# 变量城夜巡成就草案

本轮先实现本地成就事件和 Steamworks 映射草案。网页和桌面版都通过 `platform.unlockAchievement(apiName)` 解锁；当前 Web/Electron fallback 会把已解锁 API 名写入 `variableCityAchievements`，后续接 Steamworks 时在桌面平台层改为调用 Steam API。

## 当前成就

| Steam API Name | 中文名 | 触发条件 |
| --- | --- | --- |
| `ACH_FIRST_SHIFT` | 第一次夜巡 | 从档案柜开启任意一轮夜巡 |
| `ACH_FIRST_FIX` | 第一枚断点 | 解决任意一个异常事件 |
| `ACH_TEN_CLEANUPS` | 清扫十处噪声 | 单轮击破 10 个敌对异常 |
| `ACH_FIRST_BOSS` | 打断第一条协议 | 击败任意章节 Boss |
| `ACH_THREE_CHAPTERS` | 穿过三层变量城 | 同一轮中清理至少 3 个章节 |
| `ACH_RESONANCE` | 构筑共鸣 | 触发任意概念 2 层或 4 层共鸣 |
| `ACH_FULL_CLEAR` | 公共规则校准 | 完成五章完整流程并通关 |
| `ACH_LOW_DAMAGE_CLEAR` | 低噪声通关 | 以不超过 80 点总受伤完成五章 |
| `ACH_S_RANK_OPENER` | 首席夜巡 | 拿到 S级开场徽章，并购买首席夜巡印记 |
| `ACH_OPENING_S_STREAK` | 三连S开场 | 在首席夜巡印记生效后，连续 3 次打出 S级开场 |

## 文件关系

- `src/data/achievement-data.js`：网页运行时成就清单。
- `desktop/steam/achievements.json`：Steamworks 后台录入草案。
- `desktop/tools/check-achievements.cjs`：校验网页清单和 Steam 草案是否一一对应。
- `desktop/steam/save-layout.json`：已包含 `variableCityAchievements` 云同步槽。

## 后续接 Steamworks

1. 保留游戏逻辑中的 `unlockLocalAchievement(id)`。
2. 在 Electron 平台层把 `unlockAchievement(apiName)` 接到 Steamworks SDK。
3. 保留 JSON fallback，便于无 Steam 客户端环境测试。
4. 将 `desktop/steam/achievements.json` 的内容录入 Steamworks 后台。
