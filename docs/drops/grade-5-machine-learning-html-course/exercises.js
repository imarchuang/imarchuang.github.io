const zh = {
  "rules-learning": {
    reinforcement: [
      { question: "规则固定且边界清楚的任务，更适合哪种方法？", hint: "想想是否需要样本学习。", answer: "通常更适合规则程序。", rationale: "条件清晰时规则更直接、可控。" },
      { question: "同一输入两次输出不一致，应先检查什么？", hint: "先核对输入。", answer: "先检查输入字段与模型版本是否一致。", rationale: "一致输入应得到一致结果。" },
      { question: "“模型会猜到没给的信息”对吗？", hint: "模型只用已提供特征。", answer: "不对。", rationale: "模型不会读取不存在的数据。" },
      { question: "规则错 1 次，学习错 3 次，先选哪种？", hint: "比较错分数量。", answer: "先选规则方案。", rationale: "当前测试下规则更稳定。" },
      { question: "为什么要使用“模型根据输入计算输出”这句话？", hint: "关注表达规范。", answer: "因为它准确且不拟人化。", rationale: "能避免误导性的“模型会想”说法。" },
      { question: "遇到训练中没见过的新类型输入时，会有什么风险？", hint: "想覆盖范围。", answer: "更可能错分。", rationale: "超出训练分布时模型参考不足。" },
    ],
    bonus: [
      { question: "两方案总错分相同，还应比较什么？", hint: "看错在什么样本。", answer: "比较错分分布和影响级别。", rationale: "总数相同不代表风险相同。" },
      { question: "写一句非拟人化的预测说明。", hint: "用“输入特征”“计算结果”。", answer: "模型根据输入特征计算后输出该类别。", rationale: "突出可复查计算过程。" },
    ],
  },
  "data-features-labels": {
    reinforcement: [
      { question: "体重、活动时长、是否夜行中哪项最可能是标签？", hint: "标签是目标输出。", answer: "是否夜行。", rationale: "其余通常是输入特征。" },
      { question: "同列出现 kg 和 g，应先做什么？", hint: "单位统一。", answer: "先统一单位再训练。", rationale: "否则数值不可比。" },
      { question: "缺失值可以默认填 0 吗？", hint: "0 不一定有意义。", answer: "不可以随意填。", rationale: "应按规则处理并记录。" },
      { question: "样本编号适合当特征吗？", hint: "编号多为标识。", answer: "通常不适合。", rationale: "常会引入噪声模式。" },
      { question: "标签名称为什么要固定？", hint: "模型学的是稳定映射。", answer: "为了保持目标语义一致。", rationale: "频繁改名会破坏训练一致性。" },
      { question: "某关键特征大面积缺失时怎么办？", hint: "补采或删特征。", answer: "评估价值后补采或删除该特征。", rationale: "避免在低信息输入上硬训练。" },
    ],
    bonus: [
      { question: "标签列出现三种同义写法应怎么做？", hint: "做标准映射。", answer: "建立映射字典统一到标准标签。", rationale: "防止同义类别被拆分。" },
      { question: "写一条训练前检查项。", hint: "可选单位/缺失/重复。", answer: "检查数值列单位是否一致并记录转换。", rationale: "清单化可减少隐藏错误。" },
    ],
  },
  "classification-prediction": {
    reinforcement: [
      { question: "二分类有几个输出类别？", hint: "看“二”字。", answer: "2 个。", rationale: "只能在两个预设类别中选择。" },
      { question: "样本靠近边界时预测通常怎样？", hint: "微小变化会翻转。", answer: "更不稳定。", rationale: "边界附近对参数更敏感。" },
      { question: "极复杂边界一定测试更好吗？", hint: "想过拟合。", answer: "不一定。", rationale: "可能只记住训练点。" },
      { question: "如何规范表达分类结果？", hint: "避免拟人化。", answer: "模型根据输入特征计算，输出某类别。", rationale: "强调可复查计算。" },
      { question: "20 个测试点错 4 个，准确率是多少？", hint: "16/20。", answer: "80%。", rationale: "正确率=正确数/总数。" },
      { question: "多分类与二分类关键差异？", hint: "类别数量。", answer: "多分类是 3 类或以上。", rationale: "问题空间更复杂。" },
    ],
    bonus: [
      { question: "两方案总错分相同，下一步比较什么？", hint: "看各类错分分布。", answer: "比较各类别与关键场景错分。", rationale: "风险结构比总数更重要。" },
      { question: "解释“边界是工作假设”。", hint: "边界会随数据变化。", answer: "边界由当前数据与设定计算，后续可调整。", rationale: "帮助理解模型结论的条件性。" },
    ],
  },
  "training-testing-errors": {
    reinforcement: [
      { question: "训练集和测试集能互换吗？", hint: "想考试公平。", answer: "不能。", rationale: "混用会导致评估失真。" },
      { question: "测试 30 条正确 24 条，准确率？", hint: "24/30。", answer: "80%。", rationale: "准确率按测试集计算。" },
      { question: "训练 99%、测试 70% 可能出现什么？", hint: "训练高测试低。", answer: "可能过拟合。", rationale: "泛化能力不足。" },
      { question: "训练分提升后先做什么？", hint: "看未见数据。", answer: "在独立测试集复评。", rationale: "测试表现更能代表上线风险。" },
      { question: "雨天错分多应如何记录？", hint: "做分组统计。", answer: "记录雨天组错误率与样本数。", rationale: "便于定位系统性问题。" },
      { question: "删掉测试错题后分数更高，模型更好？", hint: "规则变了吗？", answer: "不是。", rationale: "那是改评分，不是改能力。" },
    ],
    bonus: [
      { question: "A:95/88，B:99/80（训练/测试），选哪个上线？", hint: "看测试与差值。", answer: "选 A。", rationale: "测试更高且更稳。" },
      { question: "写一句测试集管理规范。", hint: "关键词：隔离固定。", answer: "测试集独立保存、版本固定、不得回流训练。", rationale: "保证评估可信。" },
    ],
  },
  "simple-decision-tree": {
    reinforcement: [
      { question: "决策树最上面的提问叫什么？", hint: "第一层。", answer: "根节点。", rationale: "所有路径从根开始。" },
      { question: "叶节点通常表示什么？", hint: "路径终点。", answer: "最终预测输出。", rationale: "叶节点给出分类结果。" },
      { question: "为什么高区分度问题更适合做根节点？", hint: "看混合样本数量。", answer: "因为能更快分开样本。", rationale: "后续路径更短更清晰。" },
      { question: "树越深越好吗？", hint: "想解释性和泛化。", answer: "不一定。", rationale: "太深会过拟合且难解释。" },
      { question: "为什么提问必须可观测？", hint: "预测时也要回答。", answer: "因为模型只能用可获取输入。", rationale: "不可观测条件无法执行。" },
      { question: "“降雨=是且风强=是->不去户外”属于什么？", hint: "从根到叶。", answer: "一条决策路径。", rationale: "路径串联条件到输出。" },
    ],
    bonus: [
      { question: "根节点候选中谁能让混合样本更少，就应优先谁吗？", hint: "看区分度。", answer: "通常应优先。", rationale: "可减少复杂度与错分风险。" },
      { question: "写一句非拟人化的树输出解释。", hint: "用路径和条件。", answer: "模型沿决策路径检查条件后计算得到输出。", rationale: "突出过程可复查。" },
    ],
  },
  "responsible-ai": {
    reinforcement: [
      { question: "总体准确率高能单独证明公平吗？", hint: "看分组指标。", answer: "不能。", rationale: "可能掩盖组间差异。" },
      { question: "A组错 5%，B组错 18%，先做什么？", hint: "查覆盖与质量。", answer: "先排查覆盖差与数据质量差。", rationale: "大差异常有结构性原因。" },
      { question: "把无关敏感信息加入训练是否合适？", hint: "最小化原则。", answer: "不合适。", rationale: "会增加隐私风险。" },
      { question: "高风险场景可直接自动执行模型输出吗？", hint: "有人工审核。", answer: "不应直接执行。", rationale: "需人工复核降低伤害。" },
      { question: "覆盖不足会造成什么后果？", hint: "某些组更易错。", answer: "未覆盖群体错误率可能更高。", rationale: "模型学习到的模式不完整。" },
      { question: "“模型分数就是事实保证”对吗？", hint: "预测有不确定性。", answer: "不对。", rationale: "分数是统计表现而非保证。" },
    ],
    bonus: [
      { question: "写一条可执行公平检查规则。", hint: "用错误率差阈值。", answer: "任意两组错误率差>8%时暂停上线复查。", rationale: "阈值规则便于一致执行。" },
      { question: "给出一个人工审核触发条件。", hint: "低置信或高影响。", answer: "低置信或高影响任务必须人工复核。", rationale: "降低误判造成的伤害。" },
    ],
  },
};

const en = {
  "rules-learning": {
    reinforcement: [
      { question: "A task has fixed and clear conditions. Which method fits best?", hint: "Do you need many samples to learn?", answer: "A rule-based program usually fits best.", rationale: "Clear boundaries are easy to encode as rules." },
      { question: "Same input gives different outputs twice. What do you check first?", hint: "Verify the inputs.", answer: "Check input fields and model version consistency first.", rationale: "Identical input should lead to identical computation." },
      { question: "Is this correct: 'the model can guess missing information'?", hint: "Models use provided features only.", answer: "No.", rationale: "A model cannot use data that is not present." },
      { question: "Rules make 1 error and learning makes 3 errors on the same test. Which do you pick now?", hint: "Compare error counts.", answer: "Pick the rule method for now.", rationale: "It is more stable under current evidence." },
      { question: "Why keep this sentence: 'the output is computed from input data'?", hint: "Think about wording quality.", answer: "Because it is accurate and non-anthropomorphic.", rationale: "It avoids misleading human-like language." },
      { question: "Why might a model fail on a new unseen input type?", hint: "Think about coverage.", answer: "Because the training data did not cover that type.", rationale: "Out-of-distribution inputs are harder to classify." },
    ],
    bonus: [
      { question: "If two plans have the same total errors, what should you compare next?", hint: "Where do errors happen?", answer: "Compare error distribution and impact level.", rationale: "Equal totals can still mean very different risk." },
      { question: "Write one non-anthropomorphic prediction sentence.", hint: "Use 'input features' and 'computed output'.", answer: "The model computed this class from the sample's input features.", rationale: "It describes computation, not intention." },
    ],
  },
  "data-features-labels": {
    reinforcement: [
      { question: "Which is most likely the label: weight, activity time, or night-active?", hint: "Label is the target output.", answer: "Night-active.", rationale: "The others are usually input features." },
      { question: "One column mixes kg and g. What first?", hint: "Unify units.", answer: "Convert to one unit before training.", rationale: "Mixed units break comparability." },
      { question: "Can missing values be filled with 0 by default?", hint: "Does 0 always mean something?", answer: "No.", rationale: "Use explicit handling rules and log them." },
      { question: "Is sample ID a good feature?", hint: "ID is often just an identifier.", answer: "Usually no.", rationale: "It can inject meaningless patterns." },
      { question: "Why should label names stay fixed?", hint: "Models learn stable mappings.", answer: "To keep target meaning consistent.", rationale: "Frequent renaming breaks label consistency." },
      { question: "A key feature is missing for many rows. What can you do?", hint: "Collect more data or drop the feature.", answer: "Evaluate value, then collect more or remove it.", rationale: "Avoid training on weak information." },
    ],
    bonus: [
      { question: "Same label appears in three synonym forms. How do you clean it?", hint: "Use a mapping dictionary.", answer: "Map all synonyms to one standard label set.", rationale: "Prevents one class from splitting into many." },
      { question: "Write one pre-training data check item.", hint: "Units/missing/duplicates.", answer: "Check unit consistency in all numeric columns and record conversions.", rationale: "Checklist habits reduce hidden data bugs." },
    ],
  },
  "classification-prediction": {
    reinforcement: [
      { question: "How many output classes in binary classification?", hint: "Binary means two.", answer: "2 classes.", rationale: "Prediction is between two predefined classes." },
      { question: "What happens near a decision boundary?", hint: "Small changes can flip outputs.", answer: "Predictions are less stable.", rationale: "Boundary-near points are sensitivity hotspots." },
      { question: "Does a very complex boundary always improve test results?", hint: "Think overfitting.", answer: "No.", rationale: "It may memorize training points only." },
      { question: "Give a proper output statement for classification.", hint: "Avoid human-like wording.", answer: "The model computed class X from the input features.", rationale: "Accurate and reproducible wording." },
      { question: "20 test points with 4 errors. Accuracy?", hint: "16/20.", answer: "80%.", rationale: "Accuracy equals correct over total." },
      { question: "Main difference between multi-class and binary tasks?", hint: "Class count.", answer: "Multi-class has 3 or more classes.", rationale: "More classes usually mean harder boundaries." },
    ],
    bonus: [
      { question: "Two plans tie on total errors. What else do you inspect?", hint: "Class-wise pattern.", answer: "Inspect class-wise and scenario-wise error distribution.", rationale: "Risk profile matters as much as total count." },
      { question: "Explain: 'a boundary is a working hypothesis.'", hint: "It can change with data.", answer: "A boundary is computed from current data and settings, so it may shift later.", rationale: "Model conclusions are conditional." },
    ],
  },
  "training-testing-errors": {
    reinforcement: [
      { question: "Can training and test sets be swapped?", hint: "Think fair exam rules.", answer: "No.", rationale: "Mixing them invalidates evaluation." },
      { question: "24 correct out of 30 tests. Accuracy?", hint: "24/30.", answer: "80%.", rationale: "Accuracy is measured on test data." },
      { question: "Train 99%, test 70% suggests what?", hint: "High train, low test.", answer: "Possible overfitting.", rationale: "Model may not generalize well." },
      { question: "After improving train score, what next?", hint: "Check unseen data.", answer: "Evaluate on an independent test set.", rationale: "Test behavior predicts deployment stability." },
      { question: "Rainy samples have many errors. How record this?", hint: "Group metrics.", answer: "Track rainy-group error rate and sample count.", rationale: "Grouped metrics expose root causes." },
      { question: "Higher score after deleting hard test items means better model?", hint: "Did scoring rules change?", answer: "No.", rationale: "That changes evaluation, not model ability." },
    ],
    bonus: [
      { question: "A:95/88 vs B:99/80 (train/test). Which to deploy?", hint: "Prioritize test stability.", answer: "Choose A.", rationale: "Higher test score with smaller gap is safer." },
      { question: "Write one test-set governance rule.", hint: "Isolation and versioning.", answer: "Keep the test set isolated and version-locked; never feed it back into training.", rationale: "Protects evaluation trustworthiness." },
    ],
  },
  "simple-decision-tree": {
    reinforcement: [
      { question: "What is the first question node called?", hint: "Top node.", answer: "Root node.", rationale: "All paths start from the root." },
      { question: "What does a leaf node represent?", hint: "Path endpoint.", answer: "Final predicted output.", rationale: "Leaves produce class decisions." },
      { question: "Why choose a high-separation question as root?", hint: "Look at mixed groups.", answer: "It separates samples faster.", rationale: "It shortens later paths and improves clarity." },
      { question: "Is a deeper tree always better?", hint: "Interpretability and overfitting.", answer: "No.", rationale: "Very deep trees can overfit and confuse users." },
      { question: "Why must each question be observable?", hint: "Need answer at prediction time.", answer: "Because the model can only use available inputs.", rationale: "Unobservable conditions cannot be executed." },
      { question: "What is 'rain=yes and wind=strong -> stay inside'?", hint: "Root-to-leaf chain.", answer: "A decision path.", rationale: "A path links conditions to one output." },
    ],
    bonus: [
      { question: "If one root option leaves fewer mixed samples, should it be preferred?", hint: "Think split quality.", answer: "Usually yes.", rationale: "Better split quality reduces complexity and risk." },
      { question: "Write a non-anthropomorphic tree explanation.", hint: "Use path and conditions.", answer: "The model checked path conditions and computed the final output.", rationale: "Keeps explanation testable and precise." },
    ],
  },
  "responsible-ai": {
    reinforcement: [
      { question: "Does high overall accuracy alone prove fairness?", hint: "Need grouped checks.", answer: "No.", rationale: "Group disparities may still be large." },
      { question: "Group A error 5%, Group B error 18%. First action?", hint: "Inspect coverage and quality gaps.", answer: "Audit coverage and data quality differences first.", rationale: "Large gaps often have structural causes." },
      { question: "Is adding unrelated sensitive personal data acceptable?", hint: "Data minimization.", answer: "No.", rationale: "It raises unnecessary privacy risk." },
      { question: "Can high-risk outputs auto-execute?", hint: "Human review step.", answer: "No, they require human review.", rationale: "Human checks reduce harmful errors." },
      { question: "What risk comes from poor coverage?", hint: "Some groups underrepresented.", answer: "Higher error rates for undercovered groups.", rationale: "Model patterns become biased by imbalance." },
      { question: "Is model score a guaranteed fact?", hint: "Predictions are uncertain.", answer: "No.", rationale: "Scores summarize behavior, not certainty." },
    ],
    bonus: [
      { question: "Write one executable fairness gate rule.", hint: "Use error-gap threshold.", answer: "Pause release when any group error-rate gap exceeds 8%.", rationale: "Thresholds make risk control consistent." },
      { question: "Give one human-review trigger example.", hint: "Low confidence or high impact.", answer: "Require human review for low-confidence or high-impact outputs.", rationale: "Combines model speed with human judgment." },
    ],
  },
};

module.exports = { zh, en };
