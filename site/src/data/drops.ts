export interface Drop {
  title: string;
  href: `/drops/${string}/`;
  description: string;
  kind: "交互实验" | "视觉图解" | "学习工具";
}

export const drops: readonly Drop[] = [
  {
    title: "AI-native 产品版图",
    href: "/drops/ai-native-product-map/",
    description: "六层地图：知识工作空间、coding agent、垂直 Agent、execution/runtime、控制面、训练。",
    kind: "视觉图解",
  },
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
] as const;
