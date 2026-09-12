#!/usr/bin/env python3
"""Generate stepwise algo-lab frames from Marc's note examples."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path("/Users/marc.huang/workspace_gh/imarchuang.github.io/docs/drops/algo-lab/notes.js")
NOTES: dict[str, dict] = {}


def add(slug: str, title: str, frames: list[dict]) -> None:
    NOTES[slug] = {"title": title, "frames": frames}


def tiles(caption: str, rows: list[tuple[str, list, dict | None]], badge: str | None = None) -> dict:
    f: dict = {
        "caption": caption,
        "rows": [{"label": lab, "items": [str(x) for x in items], "cls": cls or {}} for lab, items, cls in rows],
    }
    if badge:
        f["badge"] = badge
    return f


def grid_frame(caption: str, head: list, body: list, badge: str | None = None) -> dict:
    f = {"caption": caption, "grid": {"head": head, "body": body}}
    if badge:
        f["badge"] = badge
    return f


def cls_at(n: int, **marks: str) -> dict:
    d = {}
    for i, c in marks.items():
        d[int(i)] = c
    return d


# --- generators ---

def prefix_sum():
    a = [1, 2, 3, 4]
    pre = [0]
    frames = [tiles("前缀和：空间换时间。pre[i] = a[0]+…+a[i-1]，区间和变成两次取值。", [("a", a, None), ("pre", pre, None)])]
    s = 0
    for i, x in enumerate(a):
        s += x
        pre.append(s)
        frames.append(tiles(f"扫到 a[{i}]={x}，pre[{i+1}]={s}。", [("a", a, {i: "cur"}), ("pre", pre, {i + 1: "on"})]))
    frames.append(tiles("问 a[1]+a[2] 即 [1,3) → pre[3]-pre[1] = 6-1 = 5。", [("a", a, {1: "on", 2: "on"}), ("pre", pre, {1: "cur", 3: "cur"})], "sum=5"))
    return frames


def binary_search():
    a = [1, 3, 5, 7, 9]
    target = 7
    lo, hi = 0, len(a) - 1
    frames = [tiles("左右都闭：while(left<=right)。找 7。", [("a", a, None)], f"target={target}")]
    while lo <= hi:
        mid = (lo + hi) // 2
        marks = {i: "skip" for i in range(len(a)) if i < lo or i > hi}
        marks[lo] = "cur"
        marks[hi] = "cur"
        marks[mid] = "on"
        if a[mid] == target:
            frames.append(tiles(f"mid={mid}, a[mid]={a[mid]} == 7，命中。循环外不必再猜。", [("a", a, marks)], "return 3"))
            break
        if a[mid] < target:
            frames.append(tiles(f"a[mid]={a[mid]} < 7，丢左半，left=mid+1。", [("a", a, marks)]))
            lo = mid + 1
        else:
            frames.append(tiles(f"a[mid]={a[mid]} > 7，丢右半，right=mid-1。", [("a", a, marks)]))
            hi = mid - 1
    return frames


def bin_answer():
    piles = [3, 6, 7, 11]
    h = 8
    def hours(k):
        return sum((p + k - 1) // k for p in piles)
    lo, hi = 1, max(piles)
    frames = [tiles("二分答案：吃香蕉。速度 k 越大，小时数越小。在 k 上二分，f(k)=吃完所需小时。", [("piles", piles, None)], f"H={h}")]
    best = hi
    while lo <= hi:
        k = (lo + hi) // 2
        t = hours(k)
        ok = t <= h
        frames.append(tiles(f"试 k={k}，需要 {t} 小时。{'≤H 可行，收缩右边界' if ok else '>H 太慢，提高 k'}。", [("piles", piles, None)], f"k={k} hours={t}"))
        if ok:
            best = k
            hi = k - 1
        else:
            lo = k + 1
    frames.append(tiles("最小可行速度。", [("piles", piles, None)], f"answer k={best}"))
    return frames


def two_sum_inward():
    a = [1, 2, 3, 4, 6]
    t = 6
    i, j = 0, len(a) - 1
    frames = [tiles("相向双指针：有序数组 twoSum。和太大减右，太小加左。", [("a", a, {0: "cur", 4: "cur"})], f"target={t}")]
    while i < j:
        s = a[i] + a[j]
        marks = {i: "cur", j: "cur"}
        if s == t:
            frames.append(tiles(f"{a[i]}+{a[j]}={s}，命中。", [("a", a, {**marks, i: "on", j: "on"})]))
            break
        if s < t:
            frames.append(tiles(f"{a[i]}+{a[j]}={s} < 6，i++。", [("a", a, marks)]))
            i += 1
        else:
            frames.append(tiles(f"{a[i]}+{a[j]}={s} > 6，j--。", [("a", a, marks)]))
            j -= 1
    return frames


def sliding_unique():
    s = list("abcabcbb")
    left = 0
    seen = {}
    best = 0
    frames = [tiles("无重复最长子串。窗口 [left,right] 左闭右开扩张；撞见重复就把 left 推过上次出现。", [("s", s, None)])]
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
        cls = {i: ("on" if left <= i <= right else "skip") for i in range(len(s))}
        cls[right] = "cur"
        frames.append(tiles(f"right={right} 纳入 '{ch}'，窗口 [{left},{right}] 长度 {right-left+1}。", [("s", s, cls)], f"best={best}"))
    return frames


def fast_slow():
    a = [0, 1, 0, 3, 12]
    slow = 0
    frames = [tiles("同向快慢指针：把 0 移到末尾。慢指针写非零，快指针扫描。", [("a", a, None)])]
    arr = a[:]
    for fast, x in enumerate(arr):
        cls = {fast: "cur", slow: "on"}
        frames.append(tiles(f"fast={fast} 看到 {x}。{'非零，写入 slow 然后 slow++' if x != 0 else '是 0，slow 不动'}。", [("a", arr, cls)]))
        if x != 0:
            arr[slow], arr[fast] = arr[fast], arr[slow]
            slow += 1
    frames.append(tiles("非零已压到左边。", [("a", arr, {i: "on" for i in range(slow)})]))
    return frames


def merge_sort_frames():
    a = [4, 1, 3, 2]
    frames = [tiles("归并是后序：先切两半，回来再合并。像二叉树后序。", [("a", a, None)])]
    frames.append(tiles("切开 [4,1] | [3,2]。", [("a", a, {0: "on", 1: "on"}), ("右", [3, 2], None)]))
    frames.append(tiles("左半再切 4 | 1，后序合并成 [1,4]。", [("左", [1, 4], {0: "on", 1: "on"})]))
    frames.append(tiles("右半合并成 [2,3]。", [("右", [2, 3], {0: "on", 1: "on"})]))
    frames.append(tiles("最后合并 [1,4] 与 [2,3] → [1,2,3,4]。", [("a", [1, 2, 3, 4], {i: "on" for i in range(4)})]))
    return frames


def quicksort_frames():
    a = [4, 1, 3, 2]
    frames = [tiles("快排是前序：先分区，再递归两边。像前序遍历。", [("a", a, {0: "cur"})], "pivot=4")]
    frames.append(tiles("分区后枢轴就位：左边都 < 4。", [("a", [1, 3, 2, 4], {3: "on"})]))
    frames.append(tiles("再处理左边 [1,3,2]… 最终有序。", [("a", [1, 2, 3, 4], {i: "on" for i in range(4)})]))
    return frames


def quickselect_frames():
    a = [3, 2, 1, 5, 6, 4]
    k = 2
    frames = [tiles("快选：只要第 k 大/小所在那一侧。这里找第 2 小（0-index k=1 → 值 2）。", [("a", a, None)], "k-th")]
    frames.append(tiles("以 3 分区，3 落到下标 2。目标在左半。", [("a", [2, 1, 3, 5, 6, 4], {2: "on"})]))
    frames.append(tiles("左半再分区得到 2。不需要排完整数组。", [("a", [1, 2, 3, 5, 6, 4], {1: "on"})], "answer=2"))
    return frames


def islands():
    g = [
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"],
    ]
    R, C = len(g), len(g[0])
    seen = [[False] * C for _ in range(R)]
    frames = []

    def body(hi=None):
        rows = []
        for r in range(R):
            cells = [{"v": str(r), "cls": ""}]
            for c in range(C):
                cls = ""
                if seen[r][c] and g[r][c] == "1":
                    cls = "hi"
                if hi == (r, c):
                    cls = "scan"
                cells.append({"v": g[r][c], "cls": cls})
            rows.append(cells)
        return rows

    head = ["r\\c"] + [str(c) for c in range(C)]
    frames.append(grid_frame("Flood fill：1 是陆地。每碰到一块未访问陆地就 DFS/BFS 灌水，岛屿数 +1。", head, body()))
    count = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= R or c >= C or seen[r][c] or g[r][c] == "0":
            return
        seen[r][c] = True
        frames.append(grid_frame(f"灌到 ({r},{c})。", head, body((r, c))))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc)

    for r in range(R):
        for c in range(C):
            if g[r][c] == "1" and not seen[r][c]:
                count += 1
                frames.append(grid_frame(f"新岛 #{count}，从 ({r},{c}) 出发。", head, body((r, c)), f"islands={count}"))
                dfs(r, c)
    frames.append(grid_frame("三块不相连陆地。", head, body(), "islands=3"))
    return frames


def union_find():
    n = 5
    p = list(range(n))
    frames = [tiles("10 个点的缩小版：5 个点各自为根。find 返回祖师爷，union 把两棵树接起来。", [("id", list(range(n)), None), ("parent", p[:], None)])]

    def find(x):
        while p[x] != x:
            x = p[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        frames.append(tiles(f"union({a},{b})：根 {ra} 与 {rb}。", [("id", list(range(n)), {a: "cur", b: "cur"}), ("parent", p[:], {ra: "on", rb: "on"})]))
        if ra != rb:
            p[ra] = rb
            frames.append(tiles(f"挂 {ra} → {rb}。连通分量少 1。", [("parent", p[:], {ra: "on"})]))

    for a, b in ((0, 1), (1, 2), (3, 4)):
        union(a, b)
    frames.append(tiles("两组：{0,1,2} 和 {3,4}。问 0 与 2 是否同派：find 相同。", [("parent", p[:], None)], "2 components"))
    return frames


def knapsack():
    w = [1, 2, 3]
    W = 3
    n = len(w)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    head = ["i\\j"] + [str(j) for j in range(W + 1)]

    def body(hi=None):
        rows = []
        for i in range(n + 1):
            row = [{"v": str(i)}]
            for j in range(W + 1):
                cls = "hi" if hi == (i, j) else ""
                row.append({"v": dp[i][j], "cls": cls})
            rows.append(row)
        return rows

    frames = [grid_frame("0/1 背包。物品 1,2,3kg，容量 3。dp[i][j]=前 i 件、容量 j 时最大重量。", head, body())]
    for i in range(1, n + 1):
        wi = w[i - 1]
        for j in range(W + 1):
            dp[i][j] = dp[i - 1][j]
            if j >= wi:
                dp[i][j] = max(dp[i][j], dp[i - 1][j - wi] + wi)
            frames.append(grid_frame(f"物品 {wi}kg。j={j}：不装={dp[i-1][j]}" + (f" 或装={dp[i-1][j-wi]+wi}" if j >= wi else "（装不下）"), head, body((i, j))))
    frames.append(grid_frame("dp[3][3]=3，能装满；组合可以是 1+2 或 3。", head, body(), "can fill"))
    return frames


def lcs():
    s, t = "abcde", "ace"
    n, m = len(s), len(t)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    head = [" "] + ["ε"] + list(t)

    def body(hi=None):
        rows = []
        left = ["ε"] + list(s)
        for i in range(n + 1):
            row = [{"v": left[i]}]
            for j in range(m + 1):
                cls = "hi" if hi == (i, j) else ""
                row.append({"v": dp[i][j], "cls": cls})
            rows.append(row)
        return rows

    frames = [grid_frame("双子序：LCS。i、j 从左往右。相等则对角 +1，否则取上/左最大。", head, body())]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                cap = f"s[{i-1}]='{s[i-1]}' == t[{j-1}]，两个都留下：{dp[i][j]}"
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                cap = f"'{s[i-1]}'≠'{t[j-1]}'，跳其中一个：{dp[i][j]}"
            frames.append(grid_frame(cap, head, body((i, j))))
    frames.append(grid_frame("LCS 长度 3，即 ace。", head, body(), "LCS=3"))
    return frames


def unique_paths():
    R, C = 3, 3
    dp = [[0] * C for _ in range(R)]
    for i in range(R):
        dp[i][0] = 1
    for j in range(C):
        dp[0][j] = 1
    head = ["r\\c"] + [str(j) for j in range(C)]

    def body(hi=None):
        rows = []
        for i in range(R):
            row = [{"v": str(i)}]
            for j in range(C):
                cls = "hi" if hi == (i, j) else ""
                row.append({"v": dp[i][j] or "", "cls": cls})
            rows.append(row)
        return rows

    frames = [grid_frame("坐标型：只能右或下。到达 (i,j) = 上 + 左。", head, body())]
    for i in range(1, R):
        for j in range(1, C):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
            frames.append(grid_frame(f"dp[{i}][{j}] = {dp[i-1][j]}+{dp[i][j-1]} = {dp[i][j]}", head, body((i, j))))
    frames.append(grid_frame("3×3 网格路径数。", head, body(), "6 paths"))
    return frames


def stock():
    p = [7, 1, 5, 3, 6, 4]
    mn = p[0]
    best = 0
    frames = [tiles("股票 I：维护遍历至今的最低价，用当天价减它。", [("price", p, {0: "cur"})], "min=7")]
    for i, x in enumerate(p):
        mn = min(mn, x)
        best = max(best, x - mn)
        frames.append(tiles(f"day {i} 价 {x}。min={mn}，利润 {x-mn}。", [("price", p, {i: "cur"})], f"best={best}"))
    return frames


def lis_greedy():
    a = [1, 6, 10, 2, 8]
    tails = []
    frames = [tiles("LIS 的 O(n log n)：tails[len]=该长度递增子序的最小结尾。新数用二分插入。", [("a", a, None)])]
    for i, x in enumerate(a):
        lo, hi = 0, len(tails)
        while lo < hi:
            mid = (lo + hi) // 2
            if tails[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(x)
            act = "接在更长"
        else:
            tails[lo] = x
            act = f"替换 tails[{lo}]"
        frames.append(tiles(f"a[{i}]={x}，{act}。", [("a", a, {i: "cur"}), ("tails", tails, {lo: "on"})], f"LIS≥{len(tails)}"))
    return frames


def game():
    a = [3, 9, 1, 2]
    frames = [tiles("博弈：不是贪当前最大，而是让对手下一手最小。两端取。", [("piles", a, {0: "cur", 3: "cur"})])]
    frames.append(tiles("若先手先拿 3，对手能拿 9。先手应拿 2，把 9 留给自己后手节奏。", [("piles", a, {3: "on"})], "think min-max"))
    frames.append(tiles("区间 DP：dp[i][j]=从 i..j 先手相对优势。两端转移。", [("piles", a, None)]))
    return frames


def interval_dp():
    s = list("abba")
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    head = ["i\\j"] + list(s)

    def body():
        rows = []
        for i in range(n):
            row = [{"v": s[i]}]
            for j in range(n):
                v = "T" if dp[i][j] else ("·" if j >= i else "")
                cls = "hi" if dp[i][j] else ""
                row.append({"v": v, "cls": cls})
            rows.append(row)
        return rows

    frames = [grid_frame("区间型：回文子串。先长度 1，再 2，再更长。dp[i][j] 依赖 dp[i+1][j-1]。", head, body())]
    for i in range(n):
        dp[i][i] = True
    frames.append(grid_frame("单字符都是回文。", head, body()))
    for i in range(n - 1):
        dp[i][i + 1] = s[i] == s[i + 1]
    frames.append(grid_frame("长度 2：ab 否，bb 是，ba 否。", head, body()))
    for length in range(3, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = s[i] == s[j] and dp[i + 1][j - 1]
            frames.append(grid_frame(f"区间 [{i},{j}] '{''.join(s[i:j+1])}' → {dp[i][j]}", head, body()))
    return frames


def subsets():
    nums = [1, 2, 3]
    frames = []
    path: list[int] = []

    def bt(start):
        frames.append(tiles(
            f"记录 path={path}。每个节点都是一个子集。",
            [("nums", nums, {i: "on" if nums[i] in path else "skip" for i in range(3)}), ("path", path or ["∅"], None)],
        ))
        for i in range(start, len(nums)):
            path.append(nums[i])
            frames.append(tiles(f"选择 {nums[i]}。", [("nums", nums, {i: "cur"}), ("path", path[:], {len(path) - 1: "on"})]))
            bt(i + 1)
            path.pop()
            frames.append(tiles(f"撤销 {nums[i]}。", [("nums", nums, {i: "miss"}), ("path", path or ["∅"], None)]))

    bt(0)
    return frames[:24]


def topo():
    # 1->2->3, 4->2->5
    indeg = {1: 0, 2: 2, 3: 1, 4: 0, 5: 1}
    adj = {1: [2], 2: [3, 5], 3: [], 4: [2], 5: []}
    q = [n for n, d in indeg.items() if d == 0]
    order = []
    frames = [tiles("Kahn：入度为 0 入队。图 1→2→3 与 4→2→5。", [("queue", q, None), ("indeg", [indeg[i] for i in range(1, 6)], None)])]
    while q:
        u = q.pop(0)
        order.append(u)
        frames.append(tiles(f"弹出 {u}，写入结果。", [("order", order, {len(order) - 1: "on"}), ("queue", q or ["∅"], None)]))
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
            frames.append(tiles(f"{u} 的边去掉，{v} 入度 {indeg[v]}。", [("queue", q or ["∅"], None), ("indeg2-5", [indeg[i] for i in range(2, 6)], None)]))
    frames.append(tiles("若结果长度 < 节点数，则有环。", [("order", order, {i: "on" for i in range(len(order))})], "valid topo"))
    return frames


def bfs_levels():
    frames = [
        {"caption": "层序：队列里当前层全部弹出，孩子入队。depth++ 像做选择。", "tree": "    1\n   / \\\n  2   3\n / \\   \\\n4   5   6", "badge": "queue=[1]"},
        {"caption": "弹出 1，入队 2,3。一层结束。", "tree": "    1\n   / \\\n  2   3\n / \\   \\\n4   5   6", "badge": "level0=[1]  queue=[2,3]"},
        {"caption": "弹出 2,3，入队 4,5,6。", "tree": "    1\n   / \\\n  2   3\n / \\   \\\n4   5   6", "badge": "level1=[2,3]"},
        {"caption": "最后一层叶子。", "tree": "    1\n   / \\\n  2   3\n / \\   \\\n4   5   6", "badge": "level2=[4,5,6]"},
    ]
    return frames


def bfs_short():
    g = [
        [0, 0, 0],
        [1, 1, 0],
        [0, 0, 0],
    ]
    # 0 walkable 1 wall, start 0,0 end 2,2
    from collections import deque
    R, C = 3, 3
    q = deque([(0, 0, 0)])
    seen = {(0, 0)}
    head = ["r\\c", "0", "1", "2"]

    def body(cur=None):
        rows = []
        for r in range(R):
            row = [{"v": str(r)}]
            for c in range(C):
                v = "#" if g[r][c] == 1 else "."
                cls = ""
                if (r, c) in seen and g[r][c] == 0:
                    cls = "hi"
                if cur == (r, c):
                    cls = "scan"
                row.append({"v": v, "cls": cls})
            rows.append(row)
        return rows

    frames = [grid_frame("网格最短路：障碍是墙。BFS 第一步距离就是最短。", head, body((0, 0)))]
    while q:
        r, c, d = q.popleft()
        frames.append(grid_frame(f"访问 ({r},{c}) dist={d}。", head, body((r, c)), f"dist={d}"))
        if (r, c) == (2, 2):
            frames.append(grid_frame("到达终点。", head, body((r, c)), f"shortest={d}"))
            break
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                q.append((nr, nc, d + 1))
    return frames


def mono_stack():
    h = [2, 1, 5, 6, 2, 3]
    st: list[int] = []
    nge = [-1] * len(h)
    frames = [tiles("单调栈：维持下标栈里高度递增/递减，找下一个更矮/更高。", [("h", h, None)])]
    for i, x in enumerate(h):
        while st and h[st[-1]] > x:
            j = st.pop()
            nge[j] = i
            frames.append(tiles(f"h[{i}]={x} 比栈顶 h[{j}]={h[j]} 更矮，弹出 {j}，右边界={i}。", [("h", h, {i: "cur", j: "miss"}), ("stack", st, None)]))
        st.append(i)
        frames.append(tiles(f"下标 {i} 入栈。", [("h", h, {i: "on"}), ("stack", st, {len(st) - 1: "on"})]))
    frames.append(tiles("每个柱子的右边界已知，可算最大矩形。", [("h", h, None), ("R", nge, None)]))
    return frames


def parens():
    s = list("()())")
    st = []
    frames = [tiles("合法性：遇 ( 入栈，遇 ) 弹栈。弹空则非法。", [("s", s, None)])]
    ok = True
    for i, ch in enumerate(s):
        if ch == "(":
            st.append(i)
            frames.append(tiles(f"'{ch}' 入栈。", [("s", s, {i: "on"}), ("stack", st, None)]))
        else:
            if not st:
                ok = False
                frames.append(tiles(f"下标 {i} 的 ) 没有匹配。", [("s", s, {i: "miss"})], "invalid"))
                break
            st.pop()
            frames.append(tiles(f"')' 匹配并弹出。", [("s", s, {i: "on"}), ("stack", st or ["∅"], None)]))
    if ok and st:
        frames.append(tiles("栈非空，有未关闭的 (。", [("stack", st, None)], "invalid"))
    elif ok:
        frames.append(tiles("全部匹配。", [("s", s, {i: "on" for i in range(len(s))})], "valid"))
    return frames


def reverse_list():
    frames = [
        tiles("反转链表：三个指针 prev、cur、next。", [("list", ["1→", "2→", "3→", "4"], None)], "prev=null cur=1"),
        tiles("切断 1→2，改成 1→null，前进。", [("list", ["1", "  2→", "3→", "4"], {0: "on"})], "prev=1 cur=2"),
        tiles("2→1，继续。", [("list", ["2→1", "  3→", "4"], {0: "on"})]),
        tiles("3→2→1。", [("list", ["3→2→1", "  4"], {0: "on"})]),
        tiles("4→3→2→1。", [("list", ["4→3→2→1"], {0: "on"})], "done"),
    ]
    return frames


def merge_intervals():
    iv = ["[1,3]", "[2,6]", "[8,10]", "[15,18]"]
    frames = [tiles("先按起点排序，能合并就伸右端。", [("iv", iv, None)])]
    frames.append(tiles("[1,3] 与 [2,6] 重叠 → [1,6]。", [("iv", ["[1,6]", "[8,10]", "[15,18]"], {0: "on"})]))
    frames.append(tiles("[8,10] 不接上，新开一段。", [("iv", ["[1,6]", "[8,10]", "[15,18]"], {1: "cur"})]))
    frames.append(tiles("扫描线同理：左端 +1 覆盖，右端 -1。", [("iv", ["[1,6]", "[8,10]", "[15,18]"], {i: "on" for i in range(3)})]))
    return frames


def anagram():
    a, b = list("anagram"), list("nagaram")
    frames = [tiles("异位词：计数相同。扫 a ++，扫 b --，全 0 则是。", [("a", a, None), ("b", b, None)])]
    cnt = {}
    for i, ch in enumerate(a):
        cnt[ch] = cnt.get(ch, 0) + 1
        frames.append(tiles(f"+1 '{ch}'", [("a", a, {i: "cur"})], str(cnt)))
    for i, ch in enumerate(b):
        cnt[ch] = cnt.get(ch, 0) - 1
        frames.append(tiles(f"-1 '{ch}'", [("b", b, {i: "cur"})], str(cnt)))
    frames.append(tiles("全 0 → 互为异位词。", [("a", a, {i: "on" for i in range(len(a))})], "true"))
    return frames


def palindrome():
    s = list("babad")
    frames = [tiles("中心扩展：每个下标当中心向两边扩。子串必须 consecutive。", [("s", s, {2: "cur"})])]
    frames.append(tiles("中心 'b'（下标 2），左右都是 a → aba。", [("s", s, {1: "on", 2: "on", 3: "on"})], "aba"))
    frames.append(tiles("偶中心在 1|2：ab 不相等，扩不动。", [("s", s, {1: "miss", 2: "miss"})]))
    return frames


def bipartite():
    frames = [
        tiles("二分图：BFS 染色。邻接点必须异色。", [("nodes", [1, 2, 3, 4], None)], "edges 1-2,1-4,2-3"),
        tiles("1 涂色 A。", [("nodes", [1, 2, 3, 4], {0: "on"})], "1=A"),
        tiles("邻居 2、4 涂色 B。", [("nodes", [1, 2, 3, 4], {1: "cur", 3: "cur"})], "2=B 4=B"),
        tiles("2 的邻居 3 涂色 A。无冲突。", [("nodes", [1, 2, 3, 4], {2: "on"})], "bipartite"),
    ]
    return frames


def bst():
    frames = [
        {"caption": "BST：左 < 根 < 右。搜索每次丢掉一半。", "tree": "    4\n   / \\\n  2   6\n / \\   \\\n1   3   7", "badge": "find 3"},
        {"caption": "3<4 走左。", "tree": "    4\n   / \\\n  2   6\n / \\   \\\n1   3   7", "badge": "→2"},
        {"caption": "3>2 走右，命中。", "tree": "    4\n   / \\\n  2   6\n / \\   \\\n1   3   7", "badge": "found"},
    ]
    return frames


def tree_post():
    frames = [
        {"caption": "后序：左右子树答案回来后再处理根。分治的最优子结构在这里。", "tree": "  1\n / \\\n2   3", "badge": "order: 2,3,1"},
        {"caption": "例如直径：左高+右高在根处汇总。", "tree": "  1\n / \\\n2   3", "badge": "postorder merge"},
    ]
    return frames


def reconstruct():
    frames = [
        {"caption": "前序第一个是根；中序里根左边是左子树。", "tree": "pre:  [3,9,20,15,7]\nin:   [9,3,15,20,7]", "badge": "root=3"},
        {"caption": "左子树中序 [9]，右 [15,20,7]。", "tree": "    3\n   / \\\n  9  20\n     / \\\n   15   7"},
    ]
    return frames


def fib_memo():
    frames = [
        {"caption": "记忆化：没有显式撤销。状态当参数往下传，也当 memo 下标。", "tree": "fib(4)\n ├ fib(3)\n │  ├ fib(2)\n │  └ fib(1)\n └ fib(2)  ← 命中 memo", "badge": "memo[2] reused"},
        {"caption": "这就是 DP 的递归形态。填表则是把同一 DAG 改成循环。", "tree": "dp[i]=dp[i-1]+dp[i-2]"},
    ]
    return frames


def rob():
    a = [2, 7, 9, 3, 1]
    dp0, dp1 = 0, 0
    frames = [tiles("打家劫舍：相邻不能都偷。dp = max(不偷, 偷+隔一家)。", [("nums", a, None)])]
    prev2 = prev1 = 0
    for i, x in enumerate(a):
        cur = max(prev1, prev2 + x)
        frames.append(tiles(f"房子 {x}：不偷={prev1}，偷={prev2}+{x}={prev2+x} → {cur}。", [("nums", a, {i: "cur"})], f"dp={cur}"))
        prev2, prev1 = prev1, cur
    return frames


def nsum():
    a = [1, 2, 3, 4, 5]
    frames = [tiles("3Sum：固定一个数，剩余变 twoSum 相向指针。注意跳过重复。", [("a", a, {0: "on"})], "fix 1, twoSum 6")]
    frames.append(tiles("l=2,r=5 → 2+5=7>6，r--。", [("a", a, {1: "cur", 4: "cur"})]))
    frames.append(tiles("2+4=6，记录 [1,2,4]。", [("a", a, {0: "on", 1: "on", 3: "on"})]))
    return frames


def sweep():
    frames = [
        tiles("扫描线：区间变事件。左端 +1，右端 -1，扫过覆盖数。", [("pts", ["1+", "3+", "4-", "6-", "8+", "10-"], None)]),
        tiles("扫到 1 覆盖 1，到 3 覆盖 2（重叠）。", [("cover", [0, 1, 2, 1, 0, 1, 0], {2: "on"})], "max overlap=2"),
    ]
    return frames


def expr():
    frames = [
        tiles("中缀转后缀：数字直接出，运算符进栈，遇更高优先级先弹。", [("expr", list("1+2*3"), None)]),
        tiles("1 输出；+ 入栈；2 输出；* 比 + 高，入栈。", [("out", ["1", "2"], None), ("op", ["+", "*"], None)]),
        tiles("3 输出；弹 * 再弹 +。后缀 1 2 3 * +。", [("out", ["1", "2", "3", "*", "+"], {i: "on" for i in range(5)})]),
    ]
    return frames


def match_abbr():
    w, abbr = list("substitution"), list("s10n")
    frames = [tiles("缩写：字母必须对上，数字表示跳过的长度。s10n 跳过 10 个中间字符。", [("word", w, {0: "on", 12: "on"}), ("abbr", abbr, None)])]
    frames.append(tiles("s 对齐 word[0]；10 跳到最后前一格；n 对齐末字母。", [("word", w, {0: "on", 11: "cur"})], "valid"))
    frames.append(tiles("s010n 非法：前导零。s55n 跳过长度对不上。", [("abbr", list("s010n"), {2: "miss"})], "invalid"))
    return frames


def recursion_hanoi():
    frames = [
        {"caption": "递归把问题一切两半。汉诺塔：n-1 挪开，最大盘过去，n-1 再跟上。", "tree": "H(3,A→C)\n ├ H(2,A→B)\n ├ move A→C\n └ H(2,B→C)"},
        {"caption": "和二叉树一样：递是前序职责，归是后序职责。", "tree": "call  ↓\nreturn ↑"},
    ]
    return frames


def bfs_vs_dfs():
    frames = [
        {"caption": "DFS 一条路走到底再回头；BFS 按距离一圈圈铺开。", "tree": "DFS stack vs BFS queue"},
        tiles("同一图：BFS 先访问近的。最短路必须 BFS（无权）。", [("orderBFS", [0, 1, 2, 3], {0: "on"}), ("orderDFS", [0, 1, 3, 2], None)]),
    ]
    return frames


def matrix_dfs():
    g = [["A", "B"], ["C", "D"]]
    frames = [tiles("矩阵 DFS：四方向。做选择=走进格子，撤销=走回。", [("r0", g[0], {0: "cur"}), ("r1", g[1], None)])]
    frames.append(tiles("从 A 到 B、到 C。visited 防止走回头。", [("r0", g[0], {0: "on", 1: "on"}), ("r1", g[1], {0: "on"})]))
    return frames


def presum_diffk():
    a = [2, 1, 3, 4]
    k = 2
    frames = [tiles("差为 k 的 pair。一边扫一边把值放进 set：问 x-k / x+k 在不在。", [("a", a, None)], "k=2")]
    seen = []
    hits = 0
    for i, x in enumerate(a):
        got = (x - k in seen) or (x + k in seen)
        if x - k in seen or x + k in seen:
            hits += 1
        seen.append(x)
        frames.append(tiles(f"看 {x}。set={seen[:-1] or '∅'}。{'成对 +1' if got else '还没有伴侣'}。", [("a", a, {i: "cur"})], f"pairs={hits}"))
    frames.append(tiles("两对：[1,3]、[2,4]。", [("a", a, {i: "on" for i in range(4)})], "2"))
    return frames


def deque_js():
    frames = [
        tiles("JS 数组就是双端队列：push/pop 当栈，shift/push 当队列。", [("arr", [1, 2, 3], None)]),
        tiles("栈：push 4 / pop → LIFO。", [("arr", [1, 2, 3, 4], {3: "on"})], "pop→4"),
        tiles("队列：shift 掉 1 → FIFO。", [("arr", [2, 3, 4], {0: "miss"})], "front was 1"),
    ]
    return frames


def n2_opt():
    a = [1, 2, 3, 1]
    frames = [tiles("O(n²) 找重复：双重循环。优化成一边扫一边用 set。", [("a", a, None)])]
    seen = set()
    for i, x in enumerate(a):
        if x in seen:
            frames.append(tiles(f"a[{i}]={x} 已在 set → 找到重复。从 n² 到 n。", [("a", a, {0: "on", i: "miss"})], "duplicate 1"))
            break
        seen.add(x)
        frames.append(tiles(f"把 {x} 放进 set。", [("a", a, {i: "cur"})], str(seen)))
    return frames


def greedy_jump():
    a = [2, 3, 1, 1, 4]
    far = 0
    frames = [tiles("贪心跳跃：维护当前能到的最远下标。", [("a", a, None)])]
    for i, x in enumerate(a):
        if i > far:
            frames.append(tiles("到不了这里。", [("a", a, {i: "miss"})], "false"))
            return frames
        far = max(far, i + x)
        cls = {j: "on" if j <= far else "" for j in range(len(a))}
        cls[i] = "cur"
        frames.append(tiles(f"从 {i} 跳 {x}，最远={far}。", [("a", a, cls)], f"far={far}"))
    frames.append(tiles("最远盖过终点。", [("a", a, {i: "on" for i in range(5)})], "true"))
    return frames


def family():
    frames = [
        {"caption": "家族图：人是点，亲缘是边。本质还是图遍历。", "tree": "  祖\n / \\\n父  叔\n|\n我"},
        tiles("求最近公共祖先：两边上浮到交点。和二叉树 LCA 一样。", [("path我", ["我", "父", "祖"], None), ("path叔", ["叔", "祖"], {1: "on"})], "LCA=祖"),
    ]
    return frames


def iterative():
    frames = [
        {"caption": "递归转迭代：自己维护栈，模拟系统调用栈。", "tree": "stack=[root]\nwhile stack:\n  pop, visit, push children"},
        tiles("前序：先压右再压左，弹出顺序就是根左右。", [("stack", ["1"], {0: "cur"})]),
        tiles("弹出 1，压 3、2。", [("stack", ["3", "2"], {1: "on"})]),
        tiles("弹出 2…", [("out", [1, 2], {1: "on"})]),
    ]
    return frames


def decision_dp():
    a = [1, 2, 3]
    frames = [tiles("单子序决策：每个元素取或不取（跳或不跳）。背包、打家劫舍、LIS 都是这个骨架。", [("a", a, None)])]
    frames.append(tiles("i=0 取 1。", [("a", a, {0: "on"})], "take"))
    frames.append(tiles("i=1 不取 2。", [("a", a, {0: "on", 1: "skip"})], "skip"))
    frames.append(tiles("i=2 取 3。子集 [1,3]。", [("a", a, {0: "on", 2: "on"})]))
    return frames


def unknown_dp():
    frames = [
        tiles("经验型：先写出暴力，再发现重叠子问题，套 memo。", [("fib", [0, 1, 1, 2, 3, 5], {5: "on"})]),
        tiles("没有固定题型名时，仍然是：状态、选择、转移。", [("dp", ["state", "choice", "trans"], {i: "on" for i in range(3)})]),
    ]
    return frames


def index_hub(title_cap, items):
    return [
        tiles(title_cap, [("topics", items, {0: "cur"})]),
        tiles("右侧切场景看具体运动；原文一行没改，只多了这块演示。", [("topics", items, {i: "on" for i in range(len(items))})]),
    ]


# register
add("dfs-narytree", "隐式多叉树", [
    {"caption": "选择列表的每个元素是一个孩子：回溯树是隐式多叉树，不必真建树。", "tree": "[1,2,3]\n ├ +1 → [1]\n │   ├ +2 → [1,2]\n │   └ +3 → [1,3]\n ├ +2 → [2]\n └ +3 → [3]"},
    tiles("for 循环就是在当前层长出多个分叉。", [("level", ["1", "2", "3"], {0: "cur"})]),
])
add("index", "刷刷刷", index_hub("算法笔记总览：每篇标题下嵌同一套步进演示。", ["tree", "graph", "dfs", "bfs", "dp", "binsearch", "2ptr"]))
add("coding-index", "刷刷刷", NOTES["index"]["frames"])
add("array-index", "数组题的小技巧", prefix_sum())
add("bfs-index", "宽度搜索", index_hub("BFS 三件套：层序、最短路、拓扑。", ["levels", "shortest", "topsort"]))
add("bfs-levels", "二叉树的层级遍历", bfs_levels())
add("bfs-shortest", "用 BFS 找最短路径", bfs_short())
add("bfs-topsort", "什么是拓扑排序", topo())
add("bfs-bfs_adv", "隐式图的 BFS", [
    tiles("隐式图：节点不预先建好，状态即节点。例如单词变换、棋盘。", [("state", ["hit", "hot", "dot", "dog"], None)]),
    tiles("从 hit 一次改一个字母 → hot，再 → dot → dog。BFS 层数=最少步。", [("path", ["hit", "hot", "dot", "dog"], {i: "on" for i in range(4)})], "steps=3"),
])
add("bfs-mst", "最小生成树", [
    tiles("Kruskal：边按权排序，并查集不构成环就接入。", [("edges", ["1-2:1", "2-3:2", "1-3:9"], {0: "on"})]),
    tiles("1-2、2-3 接入；1-3 同集合，丢弃。", [("mst", ["1-2", "2-3"], {0: "on", 1: "on"})], "weight=3"),
])
add("binsearch-index", "二分法的四种境界", binary_search())
add("binsearch-template", "二分模板", binary_search())
add("binsearch-binanswer", "二分答案", bin_answer())
add("classic-anagram", "关于异位词", anagram())
add("classic-barchart", "数组长得像柱状图", mono_stack())
add("classic-expr", "表达式相关", expr())
add("classic-freqused", "javascript 常用技巧", deque_js())
add("classic-freqused_java", "java 常用技巧", deque_js())
add("classic-intervals", "关于区间问题", merge_intervals())
add("classic-islands", "岛屿问题", islands())
add("classic-lan_sum", "语言技巧", deque_js())
add("classic-linkedlist", "关于链表", reverse_list())
add("classic-match", "字符串匹配", match_abbr())
add("classic-monoq", "单调栈问题", mono_stack())
add("classic-n2_tolower", "多项式暴力的优化", n2_opt())
add("classic-parentheses", "关于括号", parens())
add("classic-recursion", "关于递归", recursion_hanoi())
add("classic-strings", "关于字符串", palindrome())
add("classic-sweep", "扫描线问题", sweep())
add("datastructure-index", "数据结构题", presum_diffk())
add("design-index", "设计/二分备忘", binary_search())
add("design-presum", "前缀和", prefix_sum())
add("design-stack", "栈", parens())
add("design-trie", "Trie", [
    tiles("Trie：沿字符往下走。apple 与 app 共享 a-p-p。", [("path", list("apple"), {i: "on" for i in range(3)})], "prefix app"),
    tiles("检索：缺边即失败。", [("q", list("apx"), {2: "miss"})], "not found"),
])
add("design-unionfind", "并查集", union_find())
add("dfs-backtracking", "回溯与子集", subsets())
add("dfs-backtracking_vs_dfs", "回溯 vs DFS", [
    {"caption": "DFS 关心访完图；回溯关心 path 里的选择，所以要撤销。", "tree": "DFS: mark visited\nBT:  choose / unchoose"},
    tiles("同一棵树：回溯在每个节点都记一份 path。", [("path", [1, 2], {1: "on"})]),
])
add("dfs-divcon", "分治暴力穷举", [
    {"caption": "分治：切成子问题，合并答案。单词拆分：前缀是词，后缀递归。", "tree": "catsanddog\n ├ cats | anddog\n └ cat | sanddog"},
    tiles("和归并一样：后序位置合并。", [("parts", ["cats", "and", "dog"], {i: "on" for i in range(3)})]),
])
add("dfs-index", "深度搜索", bfs_vs_dfs())
add("dfs-traversal", "矩阵的遍历", matrix_dfs())
add("dp-decision", "决策类动规", decision_dp())
add("dp-gametheory", "博弈类动规", game())
add("dp-greedy", "贪心与 LIS", lis_greedy())
add("dp-index", "动态规划纲领", fib_memo())
add("dp-indices", "坐标型动规", unique_paths())
add("dp-indices_adv", "非典型坐标型", unique_paths())
add("dp-interval", "区间型动规", interval_dp())
add("dp-knapsack", "背包型动规", knapsack())
add("dp-stock", "股票买卖", stock())
add("dp-subsequence", "双子序型动规", lcs())
add("dp-unknown", "经验型动规", unknown_dp())
add("graph-bipartite", "二分图", bipartite())
add("graph-family", "家族关系图谱", family())
add("graph-index", "图论基础", [
    tiles("图：点 + 边。遍历不是 DFS 就是 BFS，连通性用并查集。", [("V", [1, 2, 3], None), ("E", ["1-2", "2-3"], None)]),
])
add("graph-unionfind", "并查集 Union-Find", union_find())
add("memo-index", "记忆化搜索", fib_memo())
add("tree-bst", "BST 操作", bst())
add("tree-bst_hard", "BST 非常规题", bst())
add("tree-classic", "二叉树经典题", [
    {"caption": "最近公共祖先：若 p、q 分居左右，根就是 LCA。", "tree": "    3\n   / \\\n  5   1\n / \\\n6   2", "badge": "LCA(6,2)=5"},
])
add("tree-index", "关于二叉树", tree_post())
add("tree-iterative", "递归转迭代", iterative())
add("tree-postorder", "后序遍历题型", tree_post())
add("tree-reconstruct", "二叉树的构建", reconstruct())
add("tree-traversal", "遍历法与分治法", [
    {"caption": "遍历法：走到节点就干活（前序）。分治法：左右答案回来再干活（后序）。", "tree": "traverse: pre\ndivide:   post"},
    tiles("同一题两种写法，信息流向相反。", [("pre", ["根", "左", "右"], {0: "on"}), ("post", ["左", "右", "根"], {2: "on"})]),
])
add("twopointer-forward", "同向型双指针", fast_slow())
add("twopointer-index", "双指针", two_sum_inward())
add("twopointer-nsum", "nSum 类", nsum())
add("twopointer-quickselect", "快排快选", quickselect_frames())
add("twopointer-sliding", "滑动窗口老猛男", sliding_unique())
add("twopointer-sort", "归并和快排", merge_sort_frames() + quicksort_frames())
add("classic-subsequence", "子序概论（总览）", [
    tiles("子序列保序可跳格。更细的 bitmask / 矩阵 / DP 见本篇已嵌入的专项演示。", [("s", list("abbacd"), {0: "on", 1: "on", 5: "on"})], "abd"),
])

# jump game lives with greedy
NOTES["dp-greedy"]["frames"] = lis_greedy() + greedy_jump()[:4]

text = "window.ALGO_NOTES = " + json.dumps(NOTES, ensure_ascii=False, separators=(",", ":")) + ";\n"
OUT.write_text(text, encoding="utf-8")
print(f"wrote {OUT} notes={len(NOTES)} bytes={OUT.stat().st_size}")
