const { chapterKeys } = require("./course-data");

function item(question, hint, answer, rationale) {
  return { question, hint, answer, rationale };
}

const zh = {
  [chapterKeys[0]]: {
    reinforcement: [
      item("把“早上到校打卡”拆成 4 个明确步骤。", "每一步用动作词。", "打开应用 -> 选择班级 -> 点击打卡 -> 检查成功提示。", "机器需要可执行、可检查步骤。"),
      item("“把教室整理好”为什么不适合直接给机器？", "机器能否唯一理解？", "描述过于模糊，应改为明确动作列表。", "模糊指令无法稳定执行。"),
      item("输入-处理-输出中，扫码枪发声属于哪一环？", "看“结果呈现”环节。", "输出。", "声音是系统对外反馈。"),
      item("为什么调试时一次只改一个关键点？", "思考可归因。", "便于定位真正生效的改动。", "单点修改能形成清晰因果。"),
      item("给“整理书包”写一个结束条件。", "结束条件必须可检查。", "课表所需物品齐全且拉链关闭时结束。", "结束条件保障流程终止。"),
      item("写一个算法成功标准示例。", "包含结果与约束。", "机器人 6 步内把作业本送到目标组。", "成功标准让测试客观。"),
    ],
    bonus: [
      item("把借书流程写成 6 步，并加入异常处理。", "包含“找不到书”分支。", "查目录 -> 找书架 -> 扫码 -> 找不到则登记 -> 借阅确认 -> 记录归还日期。", "完整流程需覆盖异常场景。"),
      item("如何反驳“算法越复杂越高级”？", "从正确性与可维护性回答。", "算法价值在正确、清晰、可测，不在复杂本身。", "可读和可验证比花哨更重要。"),
    ],
  },
  [chapterKeys[1]]: {
    reinforcement: [
      item("1 字节等于多少比特？", "基础换算。", "8 比特。", "字节是常用存储单位。"),
      item("1010 在黑白像素规则下可表示什么？", "1=黑，0=白。", "黑、白、黑、白。", "编码依赖位顺序和规则。"),
      item("为什么同一串数据会出现不同图案？", "考虑读取规则。", "读取方向或映射规则不同。", "解释规则决定最终含义。"),
      item("像素提高一定更好吗？", "考虑成本。", "更清晰，但更占存储和传输。", "质量与成本存在权衡。"),
      item("为什么不上传真实照片到陌生网站？", "从隐私风险回答。", "可能泄露身份与位置信息。", "先保护个人隐私。"),
      item("把“黑白黑黑白白黑白”写成二进制。", "黑=1，白=0。", "10110010。", "编码是有规则的信息表示。"),
    ],
    bonus: [
      item("按行读改成按列读会怎样？", "对比同一编码。", "图案通常改变。", "规则变化会改变结果。"),
      item("为何系统常要求昵称而非真名？", "最小化暴露。", "降低真实身份泄露风险。", "最小必要信息原则提升儿童安全。"),
    ],
  },
  [chapterKeys[2]]: {
    reinforcement: [
      item("什么是算法终止条件？", "决定何时停。", "算法停止执行的明确规则。", "无终止条件可能无限运行。"),
      item("为什么要做边界测试？", "常规样例之外。", "边界更容易暴露隐藏 bug。", "完整测试提升可靠性。"),
      item("记录“第 4 步撞墙”有什么用？", "定位问题位置。", "能快速定位并复现错误。", "可复现是修复前提。"),
      item("顺序错误会导致什么？", "考虑中间状态。", "中间状态失效，最终失败。", "流程依赖正确先后关系。"),
      item("把“多处同时修改”改成正确策略。", "关键词：单点与复测。", "每次只改一个关键点并立即复测。", "可归因调试更高效。"),
      item("给迷宫任务写最小测试集。", "正常/边界/错误各一例。", "正常路径、墙边路径、越界输入。", "分类测试覆盖关键风险。"),
    ],
    bonus: [
      item("10x10 可行但 20x20 失败的可能原因？", "考虑上限和条件写死。", "步数上限过低、边界判断写死、策略扩展不足。", "规模变化检验算法泛化能力。"),
      item("写一句调试口令。", "包含复现与记录。", "先复现，再记录，再单点修改并复测。", "固定流程降低排错混乱。"),
    ],
  },
  [chapterKeys[3]]: {
    reinforcement: [
      item("变量 coins 初始 0，4 次每次 +2，最终多少？", "累加。", "8。", "状态追踪可快速验证。"),
      item("keys=2 时 if keys>=3 走哪个分支？", "比较真假。", "else 分支。", "条件真假决定分支。"),
      item("为什么循环必须有停止条件？", "避免无限运行。", "否则可能无限循环。", "终止性是正确性的基础。"),
      item("补全：for ... stars = stars + ?（每轮+1）", "看增量。", "1。", "循环体决定状态更新。"),
      item("变量命名为何要语义化？", "考虑协作阅读。", "便于理解与调试，如 keyCount。", "命名影响维护效率。"),
      item("if...else 会同时执行吗？", "互斥分支。", "不会。", "同次判断只执行一支。"),
    ],
    bonus: [
      item("写收集 5 枚徽章程序骨架。", "初始化->循环->判断。", "badge=0; while badge<5: badge++; if badge>=5: 通关。", "完整结构体现状态与终止条件。"),
      item("while 条件依赖变量却不更新，会怎样？", "条件值是否变化。", "若初值满足条件会无限循环。", "循环条件相关变量必须更新。"),
    ],
  },
  [chapterKeys[4]]: {
    reinforcement: [
      item("顺序搜索最坏比较次数（n 项）？", "目标可能最后。", "n 次。", "顺序搜索最坏要全扫。"),
      item("二分搜索前提是什么？", "看数据组织。", "数据按同一规则排序。", "无序时折半失效。"),
      item("有序 [10,20,30,40,50] 找 40，首比什么？", "取中间。", "30。", "二分先看中间值。"),
      item("“学号->姓名”为何适合键值结构？", "学号通常唯一。", "可用学号快速定位姓名。", "键值适合唯一标识查询。"),
      item("乱序数据用二分可能漏目标吗？", "判断对错。", "会。", "前提不满足会误排除。"),
      item("写找不到目标时处理。", "要有结束反馈。", "区间为空则停止并返回未找到。", "异常处理是完整算法的一部分。"),
    ],
    bonus: [
      item("16 本有序书，二分最坏约比较几次？", "16->8->4->2->1。", "约 4 次。", "折半策略显著减少比较次数。"),
      item("图书每日新增，如何保持二分可用？", "维护排序。", "按编号规则插入并保持有序。", "算法有效性依赖前提持续成立。"),
    ],
  },
  [chapterKeys[5]]: {
    reinforcement: [
      item("谁存放网页内容：浏览器/服务器/路由？", "看谁提供响应。", "服务器。", "服务器存资源并响应请求。"),
      item("数据包为什么需要序号？", "包可能不同路径到达。", "用于正确重组消息。", "序号保障完整性。"),
      item("HTTPS=绝对可信内容吗？", "传输与内容区别。", "不是。", "HTTPS 仅保护传输链路。"),
      item("收到“领奖填验证码”先做什么？", "先停再求助。", "停止互动并告诉可信任大人。", "快速中断可降低受骗风险。"),
      item("列两项不应在线提交的信息。", "真实身份与账号安全。", "如真实姓名、住址、密码、验证码。", "敏感信息泄露风险高。"),
      item("陌生公共 Wi-Fi 为什么要谨慎？", "考虑监听风险。", "可能被监听或伪装。", "网络环境可信度影响安全。"),
    ],
    bonus: [
      item("写儿童安全上网三步法。", "先判断-再保护-后求助。", "核验来源；不填敏感信息；异常立刻求助。", "短规则更易执行。"),
      item("同学让你点陌生链接，如何回复？", "礼貌拒绝并给安全建议。", "我先不点，建议官方渠道核验，并请老师协助。", "同伴压力下坚持安全流程很重要。"),
    ],
  },
};

const en = {
  [chapterKeys[0]]: {
    reinforcement: [
      item("Break 'morning check-in' into 4 explicit steps.", "Use clear action verbs.", "Open app -> choose class -> press check-in -> verify success message.", "Machines need explicit and testable actions."),
      item("Why is 'clean the classroom' a poor machine instruction?", "Can the action be interpreted uniquely?", "It is too vague; rewrite as concrete actions.", "Vague instructions are not reliably executable."),
      item("In IPO, scanner beep belongs to which stage?", "Think output feedback.", "Output.", "Sound is system feedback."),
      item("Why debug one key change at a time?", "Think traceability.", "It keeps cause-and-effect clear.", "Focused changes improve diagnosis speed."),
      item("Write one stopping condition for packing a school bag.", "Must be checkable.", "Stop when all timetable items are packed and zipper is closed.", "Stopping conditions guarantee termination."),
      item("Give one algorithm success criterion.", "Include result + constraint.", "Robot delivers workbook in 6 steps without wrong group.", "Objective criteria make testing fair."),
    ],
    bonus: [
      item("Write a 6-step borrowing flow with one exception branch.", "Include 'book not found'.", "Catalog -> shelf -> scan -> if not found log request -> confirm borrow -> record return date.", "Robust flows cover normal and exception paths."),
      item("How would you refute 'more complex algorithm is always better'?", "Use correctness and maintainability.", "Value comes from correctness, clarity, and testability, not complexity alone.", "Simple, verifiable logic scales better."),
    ],
  },
  [chapterKeys[1]]: {
    reinforcement: [
      item("How many bits are in one byte?", "Core conversion.", "8 bits.", "Byte is a common storage unit."),
      item("Decode 1010 with 1=black, 0=white.", "Read left to right.", "Black, white, black, white.", "Binary meaning depends on mapping and order."),
      item("Why can one binary string render different images?", "Check interpretation rules.", "Because mapping or reading order changed.", "Data and protocol must match."),
      item("Is more pixels always better?", "Consider trade-off.", "Sharper image but larger size and transfer cost.", "Quality and cost are linked."),
      item("Why avoid uploading real photos to unknown sites?", "Think privacy risk.", "Real photos can leak identity and location clues.", "Protecting personal data comes first."),
      item("Encode black-white-black-black-white-white-black-white.", "1=black, 0=white.", "10110010.", "Encoding converts visual patterns into data."),
    ],
    bonus: [
      item("What happens if row-wise reading changes to column-wise?", "Compare same code under two rules.", "The reconstructed image usually changes.", "Protocol changes alter interpretation."),
      item("Why use nicknames instead of real names online?", "Minimize exposure.", "Nicknames reduce identity leakage risk.", "Least-necessary data improves child safety."),
    ],
  },
  [chapterKeys[2]]: {
    reinforcement: [
      item("What is a stopping condition?", "Defines when to stop.", "A clear rule for algorithm termination.", "Without it, loops may run forever."),
      item("Why test edge cases?", "Beyond normal inputs.", "Edge inputs reveal hidden bugs.", "Comprehensive testing improves reliability."),
      item("What is the value of 'hit wall at step 4' logs?", "Locate failure quickly.", "It identifies and reproduces the failure point.", "Reproducibility enables efficient debugging."),
      item("How can wrong step order break results?", "Think intermediate states.", "Invalid intermediate states cause final failure.", "Order defines dependency correctness."),
      item("Rewrite 'change many places quickly' as good debugging strategy.", "Single change + retest.", "Change one key part and retest immediately.", "Traceable changes are easier to validate."),
      item("Give minimal maze tests (normal/edge/error).", "One case each category.", "Normal path, wall-edge path, out-of-bound input.", "Categorized tests cover risk patterns."),
    ],
    bonus: [
      item("10x10 works but 20x20 fails: possible reasons?", "Consider hard-coded bounds and scale.", "Step limit too small, hard-coded boundaries, poor scalability.", "Scale changes test algorithm generalization."),
      item("Write a debugging mantra.", "Include reproduce + record.", "Reproduce first, record evidence, change one key point, retest.", "A stable workflow reduces debugging chaos."),
    ],
  },
  [chapterKeys[3]]: {
    reinforcement: [
      item("`coins` starts 0, add 2 for 4 loops. Final value?", "Accumulate updates.", "8.", "State tracing validates loop results."),
      item("If keys=2, branch for `if keys>=3`?", "Check truth value.", "Else branch.", "Branching depends on condition truth."),
      item("Why must loops have stop conditions?", "Avoid infinite run.", "Without it, loops can be infinite.", "Termination is a core correctness property."),
      item("Fill: `stars = stars + ?` for +1 each loop.", "Update increment.", "1.", "Loop body defines state change."),
      item("Why should variable names be meaningful?", "Think maintainability.", "Clear names improve reading and debugging.", "Naming quality impacts collaboration."),
      item("Can if...else run both branches at once?", "Mutual exclusivity.", "No.", "One decision runs one branch."),
    ],
    bonus: [
      item("Write a skeleton for 'collect 5 badges then win'.", "Init -> loop -> condition.", "badge=0; while badge<5 badge++; if badge>=5 win.", "Combines state update and stopping logic."),
      item("What happens if loop condition variable never updates?", "Will condition change?", "If true initially, it can loop forever.", "Condition-related variables must update."),
    ],
  },
  [chapterKeys[4]]: {
    reinforcement: [
      item("Linear search worst-case comparisons for n items?", "Target may be last.", "n.", "Worst case scans all items."),
      item("Binary search precondition?", "Data organization first.", "Data must be sorted by one consistent rule.", "Without order, elimination logic fails."),
      item("Sorted [10,20,30,40,50], first compare for target 40?", "Pick middle.", "30.", "Binary search starts from midpoint."),
      item("Why is studentID->name good for key-value?", "Unique key idea.", "Student IDs are usually unique keys.", "Key-value fits unique lookup patterns."),
      item("Can binary search miss targets on unsorted data?", "True/false.", "Yes.", "Broken ordering leads to wrong elimination."),
      item("How should search handle not-found?", "Need termination and feedback.", "Stop when interval is empty and return not found.", "Fallback behavior is part of algorithm quality."),
    ],
    bonus: [
      item("In 16 sorted books, binary search worst-case comparisons?", "Half each round.", "About 4.", "Halving quickly reduces search space."),
      item("How to keep binary search valid with daily inserts?", "Maintain invariant.", "Insert by rule and keep collection sorted.", "Algorithm validity depends on maintained preconditions."),
    ],
  },
  [chapterKeys[5]]: {
    reinforcement: [
      item("Who stores webpage content: browser/server/router?", "Who returns responses?", "Server.", "Servers host resources and respond."),
      item("Why do packets need sequence numbers?", "Paths may differ.", "To reassemble messages correctly.", "Sequence metadata preserves integrity."),
      item("Does HTTPS guarantee trustworthy content?", "Transport vs content.", "No.", "HTTPS secures transport, not truthfulness."),
      item("First action for 'claim reward, enter OTP now'?", "Stop first.", "Stop and tell a trusted adult.", "Immediate interruption lowers risk."),
      item("List two data types never submitted online.", "Identity/account related.", "Real name, address, password, OTP, etc.", "Sensitive data can be abused."),
      item("Why be careful with unknown public Wi-Fi?", "Think monitoring risk.", "Traffic may be intercepted or spoofed.", "Network trust level impacts safety."),
    ],
    bonus: [
      item("Write a 3-step child online safety card.", "Check source -> protect data -> ask help.", "Verify source; do not share sensitive info; ask trusted adults when unsure.", "Short action rules are easier to follow."),
      item("How to reply when a classmate asks you to open a suspicious link?", "Polite refusal + safe alternative.", "I won’t open it now; let’s verify through an official channel with teacher help.", "Safety habits must work under social pressure."),
    ],
  },
};

module.exports = { zh, en };
