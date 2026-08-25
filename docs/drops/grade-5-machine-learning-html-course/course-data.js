const chapterKeys = [
  "rules-learning",
  "data-features-labels",
  "classification-prediction",
  "training-testing-errors",
  "simple-decision-tree",
  "responsible-ai",
];

const chapterStyles = {
  "rules-learning": { number: 1, color: { primary: "#1F4F8A", secondary: "#EAF2FF", accent: "#F3A940" } },
  "data-features-labels": { number: 2, color: { primary: "#245A3D", secondary: "#E9F9EF", accent: "#F29E38" } },
  "classification-prediction": { number: 3, color: { primary: "#6A3FA0", secondary: "#F2ECFF", accent: "#F59F45" } },
  "training-testing-errors": { number: 4, color: { primary: "#9A4A20", secondary: "#FFF1E9", accent: "#3EB57D" } },
  "simple-decision-tree": { number: 5, color: { primary: "#006A78", secondary: "#E8FAFC", accent: "#F2B134" } },
  "responsible-ai": { number: 6, color: { primary: "#7A2048", secondary: "#FFEAF4", accent: "#2FB06A" } },
};

const localeData = {
  zh: {
    course: {
      id: "grade5-ml-lab",
      title: "五年级机器学习互动课程（中文）",
      subtitle: "少年数据实验室",
      language: "zh-CN",
      audience: "Grade 5",
    },
    chapters: {
      "rules-learning": {
        title: "规则与学习",
        tagline: "比较固定规则与从样本学习的差异",
        objectives: ["区分规则程序与模型学习", "解释输入与输出的计算关系", "通过重复测试检查稳定性"],
        vocabulary: ["规则", "样本", "输入", "输出", "预测"],
        misconceptions: ["模型不会“理解世界”，只会按步骤计算。", "规则方法在稳定场景中依然高效。"],
        demos: [
          { type: "rules-vs-learning", statusLabel: "主实验状态" },
          { type: "stability-check", statusLabel: "复核状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "你要帮果园把水果分到 A 箱和 B 箱",
            points: [
              "先看同一条输入在不同方法下的输出差异。",
              "把“输入字段”与“输出类别”逐项说清楚。",
              "所有判断都基于数据，不使用拟人化描述。",
            ],
            note: "先让学生口头说出输入列和输出列。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "规则程序与机器学习的工作边界",
            points: [
              "规则程序由人先写条件，适合边界清楚任务。",
              "机器学习先看样本与标签，再计算可复用模式。",
              "两种方法都能验证，关键是是否稳定可复查。",
            ],
            note: "追问：如果新增样本，哪种方法改动成本更低？",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "输入卡片 -> 计算步骤 -> 输出类别",
            points: [
              "样本字段包含颜色、重量、甜度三列。",
              "边界样本最能暴露规则与学习的差异。",
              "记录每次输出，为后续复核提供证据。",
            ],
            workedExample: "例：S3(黄,140g,甜度7) 在规则模式输出 B，在学习模式输出 A，需要解释差异来源。",
            note: "提醒学生用“因为输入是...所以输出是...”的句式。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "切换规则模式与学习模式",
            points: [
              "选择样本后运行分类，观察即时反馈。",
              "对比边界样本在两种模式下的去向。",
              "记录你认为更稳的方案及理由。",
            ],
            note: "让每组提交 1 条证据句。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "重复输入稳定性挑战",
            points: [
              "连续测试同一输入，确认结果是否一致。",
              "切换样本顺序后再次复核。",
              "若不一致，先检查输入是否真的相同。",
            ],
            note: "强调稳定输出是可部署前提。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "分对一次不等于永远正确",
            points: [
              "误解：模型分错就是“坏掉”。",
              "误解：规则条目越多一定越准。",
              "修正：看多组测试样本的整体表现。",
            ],
            note: "链接下一章数据质量主题。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "为新水果样本选择更稳方案",
            points: [
              "比较两种方案在 8 个样本上的一致性。",
              "指出至少 1 个高风险边界样本。",
              "给出可复查的证据结论。",
            ],
            note: "要求证据中包含具体样本 ID。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我会区分写规则与让模型学习",
            points: [
              "我能比较两种方法适用场景。",
              "我能用输入输出语言解释预测。",
              "我能用复核样本检查稳定性。",
            ],
            note: "请学生写 1 句本章最重要结论。",
          },
        ],
      },
      "data-features-labels": {
        title: "数据、特征与标签",
        tagline: "数据先整理，模型才可能学得稳",
        objectives: ["区分样本、特征与标签", "识别缺失值与单位混乱", "完成数据清洗与字段分类"],
        vocabulary: ["数据集", "特征", "标签", "缺失值", "一致单位"],
        misconceptions: ["数据量大不代表数据质量高。", "标签命名必须稳定一致。"],
        demos: [
          { type: "feature-label-sorter", statusLabel: "字段分类状态" },
          { type: "data-cleanup", statusLabel: "清洗状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "整理虚构宠物资料卡给模型训练",
            points: [
              "每一行样本都要可读、可比、可追踪。",
              "特征列输入模型，标签列作为目标。",
              "仅使用虚构且儿童安全的数据字段。",
            ],
            note: "开场强调隐私与最小化数据原则。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "一致格式是数据表的底线",
            points: [
              "同一列必须统一单位与格式。",
              "缺失值需要标记与处理规则，不可硬填。",
              "标签集合要在训练前固定。",
            ],
            note: "追问：为什么编号通常不该做特征？",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "输入特征列 + 输出标签列",
            points: [
              "特征示例：耳朵长度、活动时长、跳跃高度。",
              "标签示例：昼行 / 夜行。",
              "错误标签命名会导致同义类被拆分。",
            ],
            workedExample: "例：将“2kg、1800g、1.7kg”统一到克后再训练，避免模型误判。",
            note: "让学生说出“清洗前后”差别。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "字段分类器：特征 / 标签 / 不应使用",
            points: [
              "逐项选择字段归类并立即检查。",
              "系统提示错误项与修正方向。",
              "直到全部正确后记录你的分类规则。",
            ],
            note: "鼓励先解释再点击。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "数据清洗小实验",
            points: [
              "处理单位混写、缺失值、重复标签。",
              "比较清洗前后质量评分。",
              "总结哪一步最影响模型结果。",
            ],
            note: "引导学生建立自己的检查清单。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "数据越多不一定越好",
            points: [
              "误解：缺失值随便填 0 即可。",
              "误解：标签可以临时改名。",
              "修正：质量、一致性、可解释性优先。",
            ],
            note: "再次强调“垃圾进，垃圾出”。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "清洗一张混乱数据小表",
            points: [
              "找出至少 3 个数据问题并修正。",
              "说明哪些列可当特征，哪些不行。",
              "输出一个可执行的训练前检查步骤。",
            ],
            note: "要求给出字段级证据。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我能先整理数据再谈模型",
            points: [
              "我能准确区分特征与标签。",
              "我能识别并修复关键数据问题。",
              "我能解释数据质量如何影响预测。",
            ],
            note: "收集每位学生的 1 条检查项。",
          },
        ],
      },
      "classification-prediction": {
        title: "分类与预测",
        tagline: "边界如何影响新样本的分类结果",
        objectives: ["区分二分类和多分类", "理解分类边界作用", "解释边界变化与错分关系"],
        vocabulary: ["二分类", "多分类", "边界", "预测", "不确定样本"],
        misconceptions: ["边界越复杂并不总是更好。", "预测结果不是绝对保证。"],
        demos: [
          { type: "boundary-board", statusLabel: "边界实验状态" },
          { type: "confidence-meter", statusLabel: "置信提示状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "根据点位图判断新样本类别",
            points: [
              "已知点有标签，新点需要计算归类。",
              "边界位置决定新点归属。",
              "边界附近样本需要更谨慎解释。",
            ],
            note: "先读图再下结论。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "边界是分区规则，不是事实墙",
            points: [
              "边界将输入空间划分成不同类别区域。",
              "靠近边界的小变化可能改结果。",
              "预测要配合不确定性说明。",
            ],
            note: "避免“百分百正确”的话术。",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "阈值线移动与错分变化",
            points: [
              "左侧预测 A，右侧预测 B。",
              "移动阈值后统计正确率变化。",
              "边界附近点是误差分析重点。",
            ],
            workedExample: "例：阈值从 5 调到 6，训练准确率提高但测试点 T2 从 A 变成 B。",
            note: "强调“改边界要看测试表现”。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "拖动边界并重新计算",
            points: [
              "调整阈值后查看训练准确率。",
              "关注测试点类别是否翻转。",
              "记录最稳阈值与理由。",
            ],
            note: "提醒观察边界样本。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "不确定性评分卡",
            points: [
              "选择新样本位置查看置信提示。",
              "比较“离边界远/近”时的差异。",
              "给出是否需要人工复核的建议。",
            ],
            note: "引导学生将分数转化为行动。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "边界不是越弯越好",
            points: [
              "误解：包住所有训练点一定更好。",
              "误解：一次高分就可以上线。",
              "修正：要看新样本与稳定性。",
            ],
            note: "衔接下一章训练测试主题。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "三分类区域设计与解释",
            points: [
              "比较两套分区方案错分结构。",
              "指出最不确定样本并说明原因。",
              "用证据说明你选的方案。",
            ],
            note: "要求至少 2 条证据。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我会用边界解释预测结果",
            points: [
              "我能区分二分类与多分类。",
              "我能解释边界移动如何改变输出。",
              "我能标注不确定样本并给建议。",
            ],
            note: "让学生复述“边界附近更敏感”。",
          },
        ],
      },
      "training-testing-errors": {
        title: "训练、测试与错误",
        tagline: "分清训练表现与测试表现",
        objectives: ["区分训练集和测试集", "计算并解释准确率", "识别过拟合信号并改进"],
        vocabulary: ["训练集", "测试集", "准确率", "错误分析", "过拟合"],
        misconceptions: ["删除错题不会提升模型能力。", "训练高分不等于泛化稳定。"],
        demos: [
          { type: "train-test-lab", statusLabel: "评估状态" },
          { type: "error-analysis", statusLabel: "错分分析状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "模型要参加一次独立测试日",
            points: [
              "训练集像练习题，测试集像新题。",
              "测试集必须独立，不可回流训练。",
              "同时记录总分与错分类型。",
            ],
            note: "用“泄题”类比强调隔离。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "准确率与错分分析要一起看",
            points: [
              "准确率=测试正确数/测试总数。",
              "高准确率也可能隐藏局部风险。",
              "按场景分组能更快定位问题。",
            ],
            note: "让学生算 1 个准确率例题。",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "训练仪表 vs 测试仪表",
            points: [
              "训练 98%、测试 76% 是典型预警信号。",
              "查看错分集中在哪类样本。",
              "先改数据与模型，再复测。",
            ],
            workedExample: "例：雨天组错分率 22%，晴天组 6%，先补充雨天样本再评估。",
            note: "强调“发现问题比掩盖问题更重要”。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "切换模型复杂度比较分数",
            points: [
              "对比简单模型与复杂模型。",
              "读取训练分、测试分、差值。",
              "判断哪个更适合上线。",
            ],
            note: "用“差值”做证据。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "错分类型诊断台",
            points: [
              "选择错分案例进行归因。",
              "系统给出改进建议方向。",
              "提交你的修复优先级。",
            ],
            note: "鼓励先修高影响错误。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "删测试错题不等于模型变好",
            points: [
              "误解：删错题可提高可靠性。",
              "误解：训练集越大越不会错。",
              "修正：要改模型与数据流程。",
            ],
            note: "强调评估规则必须固定。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "在两个模型中选择更稳方案",
            points: [
              "比较测试准确率与波动。",
              "结合错分类型判断风险。",
              "写出不选另一模型的证据。",
            ],
            note: "答案必须提到至少 1 个分组指标。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我会分清练习分与考试分",
            points: [
              "我能独立计算准确率。",
              "我能识别并解释过拟合迹象。",
              "我能坚持测试集隔离原则。",
            ],
            note: "收集学生的一条评估底线。",
          },
        ],
      },
      "simple-decision-tree": {
        title: "简单决策树",
        tagline: "提问顺序如何影响预测效率",
        objectives: ["认识根节点/分支/叶节点", "比较不同提问顺序", "构建可解释的浅层树"],
        vocabulary: ["根节点", "分支", "叶节点", "路径", "可解释性"],
        misconceptions: ["树更深不一定更好。", "复杂路径不代表更可靠。"],
        demos: [
          { type: "tree-builder", statusLabel: "建树状态" },
          { type: "path-trace", statusLabel: "路径追踪状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "根据天气判断是否进行户外活动",
            points: [
              "样本字段包含降雨、温度、风力。",
              "标签为“去户外/不去户外”。",
              "每个问题都要可观测、可回答。",
            ],
            note: "提醒使用可测量条件。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "从根到叶是一条决策路径",
            points: [
              "根节点是首个分流问题。",
              "分支表达不同回答方向。",
              "叶节点给出最终预测输出。",
            ],
            note: "请学生画一条路径。",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "同样数据，不同提问顺序",
            points: [
              "先问降雨通常更快分开样本。",
              "先问温度可能留下更多混合样本。",
              "路径更短通常更易解释与执行。",
            ],
            workedExample: "例：以“是否降雨”为根节点，平均路径长度从 3.1 步降到 2.2 步。",
            note: "比较路径长度与准确率。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "选择根问题并生成决策路径",
            points: [
              "选择根节点与第二问题。",
              "查看系统生成的解释路径。",
              "比较不同顺序的效果。",
            ],
            note: "鼓励找“短且稳”的树。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "路径追踪与错分诊断",
            points: [
              "输入新天气样本并追踪路径。",
              "定位错分发生在哪个节点。",
              "提出一个改进提问。",
            ],
            note: "让学生提交节点级修正建议。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "问题越多不一定越好",
            points: [
              "误解：每层都加很多条件更专业。",
              "误解：树越复杂越准确。",
              "修正：优先可解释和可泛化。",
            ],
            note: "强调“简洁有效”。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "设计一棵两层校园活动决策树",
            points: [
              "定义输入字段与标签。",
              "给出两条样本路径结果。",
              "解释为何选这个根节点。",
            ],
            note: "要求比较至少一个备选根节点。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我会搭建并解释浅层决策树",
            points: [
              "我能指出根、分支、叶节点。",
              "我能解释预测是沿路径计算。",
              "我能比较提问顺序影响。",
            ],
            note: "学生口头复述一条路径。",
          },
        ],
      },
      "responsible-ai": {
        title: "负责任地使用 AI",
        tagline: "检查偏差、公平、隐私与人工审核",
        objectives: ["识别覆盖不足风险", "比较分组错误率", "设计上线前安全检查单"],
        vocabulary: ["偏差", "公平", "隐私", "人工审核", "潜在伤害"],
        misconceptions: ["总体高分不代表每组都公平。", "模型建议不能直接自动执行高风险决策。"],
        demos: [
          { type: "fairness-inspector", statusLabel: "公平检查状态" },
          { type: "risk-triage", statusLabel: "风险分级状态" },
        ],
        slides: [
          {
            id: "mission",
            title: "情境任务",
            subtitle: "你是公平数据侦探，检查模型是否稳妥",
            points: [
              "比较分组样本覆盖是否均衡。",
              "比较分组错误率是否接近。",
              "评估错分会带来的影响。",
            ],
            note: "先看数据再下结论。",
          },
          {
            id: "concept",
            title: "核心讲解",
            subtitle: "公平不能只看总体准确率",
            points: [
              "总体分高也可能掩盖局部问题。",
              "要按群体和场景看差异。",
              "高风险场景必须加入人工复核。",
            ],
            note: "让学生说出一个高风险场景。",
          },
          {
            id: "visual",
            title: "例题演示",
            subtitle: "公平检查板：覆盖、错误率、影响",
            points: [
              "覆盖不足会导致某组错分更高。",
              "错误差异阈值可做上线门槛。",
              "影响评估决定是否必须人工审核。",
            ],
            workedExample: "例：A组错分 6%，B组 15%，差值 9% 超阈值，需暂停上线并补数据。",
            note: "强调“分组指标+阈值”表达。",
          },
          {
            id: "lab-main",
            title: "互动实验 1",
            subtitle: "比较方案 A/B 的公平指标",
            points: [
              "查看两组错误率与覆盖差。",
              "判断哪套方案更稳。",
              "给出可执行改进建议。",
            ],
            note: "答案需包含具体数字。",
          },
          {
            id: "lab-check",
            title: "互动实验 2",
            subtitle: "风险分级与人工审核触发",
            points: [
              "为样本分配低/中/高风险等级。",
              "高风险任务必须触发人工审核。",
              "写出一条可执行触发条件。",
            ],
            note: "强调可执行规则而非口号。",
          },
          {
            id: "misconception",
            title: "常见误解纠正",
            subtitle: "平均表现好不等于每组都好",
            points: [
              "误解：只看总准确率就够了。",
              "误解：模型建议可以直接执行。",
              "修正：分组评估与人工复核并行。",
            ],
            note: "强调人机协作。",
          },
          {
            id: "challenge",
            title: "应用挑战",
            subtitle: "写一份上线前公平与安全检查单",
            points: [
              "包含覆盖率、错误率差值阈值。",
              "写出隐私最小化要求。",
              "写出人工审核触发条件。",
            ],
            note: "输出必须是可执行清单。",
          },
          {
            id: "summary",
            title: "小结与自评",
            subtitle: "我会做基础公平与安全检查",
            points: [
              "我能使用分组指标评估公平。",
              "我能定义审核触发条件。",
              "我能把模型输出当作建议而非结论。",
            ],
            note: "课程闭环回顾六章规则。",
          },
        ],
      },
    },
  },
  en: {
    course: {
      id: "grade5-ml-lab-en",
      title: "Grade 5 Machine Learning Interactive Course (English)",
      subtitle: "Young Data Lab",
      language: "en",
      audience: "Grade 5",
    },
    chapters: {
      "rules-learning": {
        title: "Rules and Learning",
        tagline: "Compare fixed rules with pattern learning from samples",
        objectives: ["Differentiate rule programs and ML models", "Explain input-output computation", "Check stability with repeated testing"],
        vocabulary: ["rule", "sample", "input", "output", "prediction"],
        misconceptions: ["A model does not understand feelings or intent.", "Rule-based systems are still useful in stable tasks."],
        demos: [
          { type: "rules-vs-learning", statusLabel: "Main lab status" },
          { type: "stability-check", statusLabel: "Verification status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Sort orchard fruit into Box A or Box B", points: ["Compare outputs from two methods using the same input.", "Name each input field and output class clearly.", "Use computational wording, not human-like wording."], note: "Ask students to define input and output first." },
          { id: "concept", title: "Core Idea", subtitle: "Where rule programs and ML each fit", points: ["Rules are written first by people and work well for clear boundaries.", "ML uses labeled samples to compute reusable patterns.", "Both methods can be tested; stability matters most."], note: "Prompt: which method is easier to update for new samples?" },
          { id: "visual", title: "Worked Example", subtitle: "Input card -> computation -> class output", points: ["Samples include color, weight, and sweetness.", "Boundary samples reveal method differences quickly.", "Track outputs to support evidence-based decisions."], workedExample: "Example: S3 (yellow, 140g, sweetness 7) maps to B under rules and A under learning; explain why.", note: "Use the sentence frame: input is..., therefore output is..." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Switch between rule mode and learning mode", points: ["Pick a sample and run classification.", "Compare boundary sample behavior.", "Record which option feels more stable and why."], note: "Each group submits one evidence sentence." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Stability replay challenge", points: ["Run the same input repeatedly and verify consistency.", "Re-test after changing sample order.", "If output changes, check whether inputs were truly identical."], note: "Stable output is a deployment baseline." },
          { id: "misconception", title: "Misconceptions", subtitle: "One correct answer does not mean always correct", points: ["Misconception: one error means the model is broken.", "Misconception: more rules always improve results.", "Fix: compare performance across many test samples."], note: "Bridge to next chapter on data quality." },
          { id: "challenge", title: "Challenge", subtitle: "Choose a stable method for new fruit samples", points: ["Compare consistency across eight samples.", "Identify at least one risky boundary sample.", "Defend your choice with checkable evidence."], note: "Require sample IDs in the evidence." },
          { id: "summary", title: "Wrap-up", subtitle: "I can tell rules from learning", points: ["I can match each method to suitable tasks.", "I can explain predictions with input-output wording.", "I can verify stability using repeat tests."], note: "Students write one key takeaway sentence." },
        ],
      },
      "data-features-labels": {
        title: "Data, Features, and Labels",
        tagline: "Clean data first so models can learn reliably",
        objectives: ["Separate samples, features, and labels", "Detect missing values and unit mismatch", "Perform basic data cleaning"],
        vocabulary: ["dataset", "feature", "label", "missing value", "consistent unit"],
        misconceptions: ["More data is not always better data.", "Label names must stay consistent."],
        demos: [
          { type: "feature-label-sorter", statusLabel: "Field sorting status" },
          { type: "data-cleanup", statusLabel: "Cleanup status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Prepare fictional pet cards for model training", points: ["Each row should be readable and comparable.", "Feature columns go in; label column is the target.", "Use fictional, child-safe data only."], note: "Set privacy expectations at the beginning." },
          { id: "concept", title: "Core Idea", subtitle: "Consistency is non-negotiable", points: ["Use one unit per numeric column.", "Handle missing values with explicit rules.", "Lock the label set before training."], note: "Ask why IDs are usually poor features." },
          { id: "visual", title: "Worked Example", subtitle: "Feature columns plus one label column", points: ["Feature examples: ear length, activity duration, jump height.", "Label example: day-active / night-active.", "Inconsistent label naming splits equivalent classes."], workedExample: "Example: convert 2kg, 1800g, and 1.7kg into grams before training.", note: "Ask students to compare before/after quality." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Sort fields: feature / label / do not use", points: ["Classify each field and check instantly.", "Review targeted feedback on mistakes.", "Repeat until all items are correct."], note: "Have students explain before selecting." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Mini data-cleaning lab", points: ["Fix mixed units, missing values, and duplicate labels.", "Compare data quality scores before and after cleaning.", "Name the step that changed quality most."], note: "Students build a personal checklist." },
          { id: "misconception", title: "Misconceptions", subtitle: "More rows do not guarantee better learning", points: ["Misconception: fill missing values with zero by default.", "Misconception: labels can be renamed anytime.", "Fix: prioritize quality, consistency, and clarity."], note: "Reinforce the 'garbage in, garbage out' idea." },
          { id: "challenge", title: "Challenge", subtitle: "Clean a messy mini-table", points: ["Find and fix at least three data problems.", "Decide which columns are valid features.", "Write one pre-training quality check step."], note: "Require field-level evidence." },
          { id: "summary", title: "Wrap-up", subtitle: "I can clean data before modeling", points: ["I can distinguish features from labels.", "I can detect and fix major quality issues.", "I can explain how quality affects prediction."], note: "Collect one checklist item from each student." },
        ],
      },
      "classification-prediction": {
        title: "Classification and Prediction",
        tagline: "Understand how boundaries affect predictions",
        objectives: ["Differentiate binary vs multi-class tasks", "Explain decision boundary behavior", "Link boundary shifts to errors"],
        vocabulary: ["binary classification", "multi-class", "boundary", "prediction", "uncertain sample"],
        misconceptions: ["More complex boundaries are not always better.", "Predictions are estimates, not guarantees."],
        demos: [
          { type: "boundary-board", statusLabel: "Boundary lab status" },
          { type: "confidence-meter", statusLabel: "Confidence cue status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Classify a new sample on a point map", points: ["Known points already have labels.", "Boundary placement changes new-point classification.", "Boundary-near points need cautious interpretation."], note: "Read the chart before making claims." },
          { id: "concept", title: "Core Idea", subtitle: "Boundaries are rules, not facts", points: ["A boundary partitions the input space.", "Small changes near boundaries can flip classes.", "Uncertainty notes should accompany predictions."], note: "Discourage '100% certain' language." },
          { id: "visual", title: "Worked Example", subtitle: "Threshold moves and error changes", points: ["Left of threshold predicts A; right predicts B.", "Move threshold and compare accuracy.", "Boundary-near points drive most confusion."], workedExample: "Example: threshold 5 -> 6 increases train score, but test point T2 flips from A to B.", note: "Stress test performance over training score." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Move boundary and recalculate", points: ["Adjust threshold and inspect training accuracy.", "Watch for test-point label flips.", "Record the most stable threshold with evidence."], note: "Highlight boundary samples explicitly." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Uncertainty score card", points: ["Choose sample positions and inspect confidence cues.", "Compare far-from-boundary vs near-boundary behavior.", "Recommend whether human review is needed."], note: "Turn confidence into clear actions." },
          { id: "misconception", title: "Misconceptions", subtitle: "A twisty boundary is not automatically better", points: ["Misconception: covering every training point is ideal.", "Misconception: one high score means done.", "Fix: prioritize stability on unseen samples."], note: "Connect to train/test evaluation next." },
          { id: "challenge", title: "Challenge", subtitle: "Design and justify a three-class region plan", points: ["Compare error structures between two plans.", "Identify the most uncertain sample.", "Defend your chosen plan with evidence."], note: "Require at least two evidence points." },
          { id: "summary", title: "Wrap-up", subtitle: "I can explain prediction with boundaries", points: ["I can distinguish binary and multi-class tasks.", "I can explain why boundary shifts change outputs.", "I can flag uncertain samples and next actions."], note: "Students restate: boundary-near means higher uncertainty." },
        ],
      },
      "training-testing-errors": {
        title: "Training, Testing, and Errors",
        tagline: "Separate practice performance from test performance",
        objectives: ["Separate training from testing", "Compute and interpret accuracy", "Detect overfitting signals"],
        vocabulary: ["training set", "test set", "accuracy", "error analysis", "overfitting"],
        misconceptions: ["Removing hard test items does not improve model skill.", "High train score alone is not enough."],
        demos: [
          { type: "train-test-lab", statusLabel: "Evaluation status" },
          { type: "error-analysis", statusLabel: "Error analysis status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Your model takes an independent test day", points: ["Training data is practice; test data is new.", "Test data must stay separate from training.", "Track overall score and error types together."], note: "Use exam leakage analogy." },
          { id: "concept", title: "Core Idea", subtitle: "Accuracy and error breakdown go together", points: ["Accuracy = correct predictions / total tests.", "High accuracy can still hide local risk.", "Group-wise error analysis finds root causes faster."], note: "Have students compute one quick example." },
          { id: "visual", title: "Worked Example", subtitle: "Training gauge vs testing gauge", points: ["Train 98% and test 76% is a warning sign.", "Inspect which sample groups fail more often.", "Improve data and model, then retest."], workedExample: "Example: rainy group error 22% vs sunny group 6%; add rainy samples before re-evaluation.", note: "Celebrate finding problems early." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Switch model complexity and compare", points: ["Compare simple and complex models.", "Read train score, test score, and score gap.", "Decide which is safer to deploy."], note: "Use score gap as evidence." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Error diagnosis station", points: ["Inspect selected misclassified cases.", "Review generated improvement hints.", "Set a repair priority list."], note: "Prioritize high-impact errors first." },
          { id: "misconception", title: "Misconceptions", subtitle: "Deleting wrong test items is not progress", points: ["Misconception: delete failures to improve reliability.", "Misconception: bigger training set always fixes everything.", "Fix: improve data/model pipeline with fixed evaluation rules."], note: "Keep evaluation protocol unchanged." },
          { id: "challenge", title: "Challenge", subtitle: "Choose the more reliable model", points: ["Compare test score and variation.", "Use error type distribution to assess risk.", "Explain why you rejected the other model."], note: "Require at least one grouped metric." },
          { id: "summary", title: "Wrap-up", subtitle: "I can separate practice from test results", points: ["I can compute accuracy correctly.", "I can identify and explain overfitting signs.", "I can enforce test-set isolation rules."], note: "Collect one evaluation principle from each student." },
        ],
      },
      "simple-decision-tree": {
        title: "Simple Decision Trees",
        tagline: "Question order changes efficiency and clarity",
        objectives: ["Identify root/branch/leaf nodes", "Compare question orders", "Build interpretable shallow trees"],
        vocabulary: ["root node", "branch", "leaf node", "path", "interpretability"],
        misconceptions: ["Deeper trees are not always better.", "Complex paths are not always more reliable."],
        demos: [
          { type: "tree-builder", statusLabel: "Tree builder status" },
          { type: "path-trace", statusLabel: "Path tracing status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Decide if outdoor activity should happen", points: ["Inputs include rain, temperature, and wind.", "Label is go-outside / stay-inside.", "Every question must be measurable."], note: "Use observable conditions only." },
          { id: "concept", title: "Core Idea", subtitle: "A decision path runs from root to leaf", points: ["Root node is the first split question.", "Branches represent possible answers.", "Leaf nodes produce final predicted labels."], note: "Ask students to draw one full path." },
          { id: "visual", title: "Worked Example", subtitle: "Same data, different question orders", points: ["Asking rain first often separates data faster.", "Asking temperature first may leave mixed groups.", "Shorter paths are often easier to explain."], workedExample: "Example: choosing 'Is it raining?' as root reduces average path length from 3.1 to 2.2.", note: "Compare both path length and accuracy." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Choose root question and build paths", points: ["Pick a root and second question.", "Inspect generated explanation paths.", "Compare outcomes across orders."], note: "Aim for short and stable trees." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Path tracing and error diagnosis", points: ["Run new weather samples through the tree.", "Identify which node causes a wrong output.", "Propose one improved split question."], note: "Submit node-level fixes." },
          { id: "misconception", title: "Misconceptions", subtitle: "More questions do not always help", points: ["Misconception: add many conditions at each level.", "Misconception: more complex trees are always better.", "Fix: prioritize interpretability and generalization."], note: "Reinforce clear and useful trees." },
          { id: "challenge", title: "Challenge", subtitle: "Design a two-level school activity tree", points: ["Define measurable inputs and outputs.", "Show two sample decision paths.", "Justify your root choice against one alternative."], note: "Comparison is required." },
          { id: "summary", title: "Wrap-up", subtitle: "I can build and explain shallow trees", points: ["I can identify root, branch, and leaf nodes.", "I can explain predictions as path-based computation.", "I can compare question-order effects."], note: "Students verbally explain one path." },
        ],
      },
      "responsible-ai": {
        title: "Responsible Use of AI",
        tagline: "Check bias, fairness, privacy, and human review",
        objectives: ["Spot coverage gaps", "Compare group error rates", "Create a pre-launch safety checklist"],
        vocabulary: ["bias", "fairness", "privacy", "human review", "potential harm"],
        misconceptions: ["A strong overall score does not prove fairness for all groups.", "High-risk decisions should not be fully automatic."],
        demos: [
          { type: "fairness-inspector", statusLabel: "Fairness check status" },
          { type: "risk-triage", statusLabel: "Risk triage status" },
        ],
        slides: [
          { id: "mission", title: "Mission", subtitle: "Be a fairness detective for model outputs", points: ["Compare sample coverage across groups.", "Compare group-specific error rates.", "Estimate impact if misclassifications occur."], note: "Data first, conclusion second." },
          { id: "concept", title: "Core Idea", subtitle: "Fairness is more than one overall number", points: ["A high overall score can hide local harm.", "Evaluate by group and by scenario.", "High-risk contexts require human review."], note: "Ask for one high-risk use case." },
          { id: "visual", title: "Worked Example", subtitle: "Fairness board: coverage, error, impact", points: ["Low coverage can increase group-specific errors.", "Error-gap thresholds can gate release.", "Impact analysis decides review strictness."], workedExample: "Example: Group A error 6%, Group B error 15% (gap 9%) exceeds threshold, so release pauses.", note: "Use grouped metrics with thresholds." },
          { id: "lab-main", title: "Interactive 1", subtitle: "Compare Plan A and Plan B fairness", points: ["Inspect error rates and coverage gaps.", "Decide which plan is safer.", "Give one actionable improvement."], note: "Answers must include numbers." },
          { id: "lab-check", title: "Interactive 2", subtitle: "Risk triage and review triggers", points: ["Assign low/medium/high risk levels.", "High-risk outputs must trigger human review.", "Write one concrete trigger rule."], note: "Rules should be executable, not slogans." },
          { id: "misconception", title: "Misconceptions", subtitle: "Average quality is not equal group quality", points: ["Misconception: overall accuracy is enough.", "Misconception: model suggestions can auto-execute.", "Fix: combine grouped evaluation with human review."], note: "Reinforce human+model collaboration." },
          { id: "challenge", title: "Challenge", subtitle: "Write a pre-launch fairness and safety checklist", points: ["Include coverage and error-gap thresholds.", "Include one privacy minimization rule.", "Include one human-review trigger."], note: "Checklist must be actionable." },
          { id: "summary", title: "Wrap-up", subtitle: "I can perform basic fairness and safety checks", points: ["I can evaluate fairness with grouped metrics.", "I can define review-trigger conditions.", "I can treat model output as advice, not final fact."], note: "Close the loop across all six chapters." },
        ],
      },
    },
  },
};

function buildChapter(locale, key) {
  const base = localeData[locale].chapters[key];
  const style = chapterStyles[key];
  return {
    key,
    number: style.number,
    color: style.color,
    title: base.title,
    tagline: base.tagline,
    objectives: base.objectives,
    vocabulary: base.vocabulary,
    misconceptions: base.misconceptions,
    demos: base.demos,
    slides: base.slides,
  };
}

function buildLocaleBundle(locale) {
  return {
    course: localeData[locale].course,
    chapters: chapterKeys.map((key) => buildChapter(locale, key)),
  };
}

const bundles = {
  zh: buildLocaleBundle("zh"),
  en: buildLocaleBundle("en"),
};

module.exports = { bundles, chapterKeys };
