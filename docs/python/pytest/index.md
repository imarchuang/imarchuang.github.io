# 关于pytest和mock的结合

> 啥都不说，先来BB
> 从一个开发者的角度，说一下我觉得一个好用的Test Framework都有哪些重要的组成部分
> 1. 测试cases的组织：可以分层式的组织test cases，比如说，by module, by class, 或者by某个directory或者file，然后test case的执行可以按照某个层次来执行，比如说执行单个test case，执行整个test class等等，最灵活的当然是用regex来选择要执行的test cases
> 1. 测试结果的展示：从最上层的测试fail/pass的stats，到drill down某个test case为什么fail了，这个过程必须要smooth
> 1. 
>
>
