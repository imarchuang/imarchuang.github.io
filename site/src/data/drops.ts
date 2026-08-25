export interface Drop {
  title: string;
  href: `/drops/${string}/`;
  description: string;
  kind: "交互实验" | "视觉图解" | "学习工具";
}

export const drops: readonly Drop[] = [
  {
    title: "Kafka Consumer Group Region Affinity",
    href: "/drops/kafka-consumer-group-region-affinity/",
    description: "把跨区域消费组的架构方案与取舍变成可比较的视觉模型。",
    kind: "视觉图解",
  },
  {
    title: "Orbit Sketch",
    href: "/drops/orbit-sketch/",
    description: "一个跟随指针运动的轨道画布，探索运动、反馈与空间感。",
    kind: "交互实验",
  },
  {
    title: "五年级数学章节课件",
    href: "/drops/grade-5-math-chapter-decks-2026-fall/",
    description: "把九章数学内容组织成适合一对一辅导的可下载学习材料。",
    kind: "学习工具",
  },
] as const;
