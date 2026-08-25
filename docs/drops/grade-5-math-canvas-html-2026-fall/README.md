# Grade 5 Math HTML Deck Bundle

输出目录：`.superpowers/grade5-math-html-decks`

## 文件说明

- `generate-grade5-math-html-decks.js`：可重复运行的生成脚本
- `index.html`：总目录页
- `README.md`：本说明
- `qa-report.txt`：QA 记录
- `<chapter-key>/index.html`：每章独立课件

## 生成方式

本脚本不会手动复制章节内容，而是直接从以下源文件读取并提取 `DECK_STRUCTURE` 与 `CHAPTERS`：

`/Users/marc.huang/shadow-marc/.superpowers/grade5-math-decks/generate-grade5-math-decks.js`

然后基于这些章节数据生成：

1. 根目录索引页
2. 九个章节子目录与独立 `index.html`
3. 教学备注、视觉模型、交互控制与打印样式

## 章节列表

1. `decimals-add-subtract` | 小数的再认识和加减法 | 2课时 | 理解小数位值、数线表示和小数点对齐的加减算理
2. `triangles` | 三角形的再认识 | 2课时 | 从边和角两个维度分类三角形，并理解稳定性与三角形三边关系
3. `decimal-multiply` | 小数乘法 | 2课时 | 理解小数乘法的意义，会用转化、估算和点小数点的方法求积
4. `letters-1` | 用字母表示（一） | 1课时 | 理解字母表示数、数量关系和简单公式，会代入求值
5. `polygon-area` | 多边形的面积 | 2课时 | 通过割补、拼组和转化求平行四边形、三角形与组合图形面积
6. `position-movement` | 图形的位置与运动（一） | 1课时 | 用数对描述位置，理解平移、旋转和简单对称的基本特征
7. `factors-multiples` | 倍数与因数 | 2课时 | 理解倍数与因数、质数与合数，会找因数、倍数及公因数公倍数
8. `probability` | 可能性 | 1课时 | 理解事件发生的可能大小，会用语言、分数或简单统计描述随机事件
9. `review` | 总复习 | 2课时 | 串联本学期数与代数、图形与几何、统计与概率重点并查漏补缺

## 重新生成

```bash
node generate-grade5-math-html-decks.js
```

## 已知内容修正

脚本内包含一条显式数学修正：

- `decimals-add-subtract` 的诊断题第 3 题答案已从“更接近8”修正为“更接近9”，并会在 `qa-report.txt` 中记录原因。
