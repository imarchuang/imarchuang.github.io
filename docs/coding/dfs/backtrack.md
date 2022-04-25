# 回溯算法

#### **回溯模板**

#### **文章列表**
> 1. [关于子集](./)

#### **刷题列表**
> 1. [Karat面试真题 - 矩阵内单词查找](#矩阵内单词查找)


### 矩阵内单词查找
[Karat面试真题 - 矩阵内单词查找]()
> **题目描述** 这题其实是leetcode上[这题](https://leetcode.com/problems/word-search-ii/)的简单版
>
> After catching your classroom students cheating before, you realize your students are getting craftier and hiding words in 2D grids of letters. The word may start anywhere in the grid, and consecutive letters can be either **immediately below** or **immediately to the right** of the previous letter.
>
> Given a grid and a word, write a function that returns the location of the word in the grid as a list of coordinates. If there are multiple matches, return any one.
> 
> Complexity analysis variables:
> 
> 1. r = number of rows
> 1. c = number of columns
> 1. w = length of the word
```js
grid1 = [
    ['c', 'c', 't', 'n', 'a', 'x'],  
    ['c', 'c', 'a', 't', 'n', 't'],  
    ['a', 'c', 'n', 'n', 't', 't'],  
    ['t', 'n', 'i', 'i', 'p', 'p'],  
    ['a', 'o', 'o', 'o', 'a', 'a'],
    ['s', 'a', 'a', 'a', 'o', 'o'],
    ['k', 'a', 'i', 'o', 'k', 'i'],
]

word1 = "catnip"
word2 = "cccc"
word3 = "s"
word4 = "ant"
word5 = "aoi"
word6 = "ki"
word7 = "aaoo"
word8 = "ooo"

grid2 = [['a']]
word9 = "a"

find_word_location(grid1, word1) => [ (1, 1), (1, 2), (1, 3), (2, 3), (3, 3), (3, 4) ]
find_word_location(grid1, word2) =>
       [(0, 0), (1, 0), (1, 1), (2, 1)]
    OR [(0, 0), (0, 1), (1, 1), (2, 1)]
find_word_location(grid1, word3) => [(5, 0)]
find_word_location(grid1, word4) => [(0, 4), (1, 4), (2, 4)] OR [(0, 4), (1, 4), (1, 5)]
find_word_location(grid1, word5) => [(4, 5), (5, 5), (6, 5)]
find_word_location(grid1, word6) => [(6, 4), (6, 5)]
find_word_location(grid1, word7) => [(5, 2), (5, 3), (5, 4), (5, 5)]
find_word_location(grid1, word8) => [(4, 1), (4, 2), (4, 3)]
find_word_location(grid2, word9) => [(0, 0)]
```

!> **思路** 很典型的回溯算法，其实也是图的遍历问题。这题有两个地方要注意：1. 只能向下向右走，所以就不需要维护visited矩阵了，因为不可能走回头路的(类似二叉树了)；2. 题目保证给出的word肯定会出现在矩阵里至少一次。这题吧，我在面试的时候使用了回溯框架（`做选择`和`撤销选择`都放在了for循环内），但是面试后琢磨琢磨还是用图的遍历框架比较清晰(for循环内`加入节点`和`撤销节点`)；这里就把两种解法都展示一下：

``` js
const grid1 = [
  ['c', 'c', 't', 'n', 'a', 'x'],
  ['c', 'c', 'a', 't', 'n', 't'],
  ['a', 'c', 'n', 'n', 't', 't'],
  ['t', 'n', 'i', 'i', 'p', 'p'],
  ['a', 'o', 'o', 'o', 'a', 'a'],
  ['s', 'a', 'a', 'a', 'o', 'o'],
  ['k', 'a', 'i', 'o', 'k', 'i']
];
const word1 = "catnip";
const word2 = "cccc";
const word3 = "s";
const word4 = "ant";
const word5 = "aoi";
const word6 = "ki";
const word7 = "aaoo";
const word8 = "ooo"; 

const grid2 = [['a']];
const word9 = "a";
```

```js
/* 用回溯框架试试 */
var DIRS = [[1,0],[0,1]];
var path = []; // 这里直接吧path设成了global variable
const find_word_location = (grid, word) => {
  let m=grid.length, n=grid[0].length;
  for(let i=0; i<m; i++){
    for(let j=0; j<n; j++){
      path = [];
      let found = traverse([], grid, i, j, word);
      if(found) return path;
    }
  }
}

const traverse = (wordPath, grid, i, j, word) => {
  let m=grid.length, n=grid[0].length;
  //base case
  if(wordPath.join('') == word) {
    console.log(wordPath);
    return true;
  }

  if(!word.startsWith(wordPath.join(''))) {
    return false;
  }

  if(wordPath.length>word.length) {
    return false;
  }

  //console.log(wordPath);

  for(const dir of DIRS) {

    let x=i+dir[0];
    let y=j+dir[1];
    //console.log(i, j, x, y);

    if(x<0 || y<0 || x>=m || y>=n) continue;

    path.push([i,j]);
    wordPath.push(grid[i][j]);
    
    if(traverse(wordPath, grid, x, y, word)){
      return true;
    };

    path.pop();
    wordPath.pop();

  }

  return false;
}

console.log(find_word_location(grid1, word1));
```

```js
/* 用回溯框架试试 */
var DIRS = [[1,0],[0,1]];
var path = []; // 这里直接吧path设成了global variable
const find_word_location = (grid, word) => {
  let m=grid.length, n=grid[0].length;
  for(let i=0; i<m; i++){
    for(let j=0; j<n; j++){
      path = [];
      let found = traverse([], grid, i, j, word);
      if(found) return path;
    }
  }
}

const traverse = (wordPath, grid, i, j, word) => {
  let m=grid.length, n=grid[0].length;

  wordPath.push(grid[i][j]);
  path.push([i,j]);

  if(wordPath.join('') == word) {
    console.log(wordPath);
    return true;
  }

  for(const dir of DIRS){
    let x=i+dir[0];
    let y=j+dir[1];

    if(x<0 || y<0 || x>=m || y>=n) continue;

    if(wordPath.length>word.length) break;

    if(!word.startsWith(wordPath.join(''))) break;

    if(traverse(wordPath, grid, x, y, word)) return true;
  }

  wordPath.pop();
  path.pop();

  return false;

}
```