# 数组题的小技巧

**数组题太多了，涉及到各种算法类型，这篇就讲讲比较具有技巧性的一些数组题** 

### 前缀和数组

### 差分数组

### 数学知识点
[领扣1149 有效的正方形](https://www.lintcode.com/problem/1149)
> **思路** 正方形的特性：4个边长相等，2个对角线距离相等；
```java
public class Solution {
    /**
     * @param p1: the first point
     * @param p2: the second point
     * @param p3: the third point
     * @param p4: the fourth point
     * @return: whether the four points could construct a square
     */
    public boolean validSquare(int[] p1, int[] p2, int[] p3, int[] p4) {
        int[][] points = new int[][]{p1,p2,p3,p4};

        int[] res = new int[6];
        int cnt = 0;
        for(int i=0; i<3; i++){
          for(int j=i+1; j<4; j++){
            int dis = (points[i][0]-points[j][0])*(points[i][0]-points[j][0]) 
                      + (points[i][1]-points[j][1])*(points[i][1]-points[j][1]);
            res[cnt++] = dis;
          }
        }

        Arrays.sort(res);

        return (res[0]==res[3] && res[4]==res[5] && res[5]>res[0]);
    }
}
```