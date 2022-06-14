# 字符串匹配相关的几个问题

### 第一类：数字为距离
!> **敲黑板** 这里穷举问题多数都是子串切割问题，
1. [Facebook真题. 有效单词缩写](#有效单词缩写) 
> 力扣的408题，需要plus会员。简单说就是看是否为一个单词的有效单词缩写，比如说substitution可以缩写为s10n, sub4u4,12, su3ilu2on等，而s010n或者s55n就不是有效缩写。
```java
  public boolean matchTwoStrings(String s, String p){
    int i=0, j=0, rem=0;

    for(;j<p.length();j++){
      char p0 = p.charAt(j);
      //System.out.println(p0);
      if(Character.isDigit(p0)){
        rem = rem*10 + Integer.parseInt(String.valueOf(p0));
      }
      else {
        if(i+rem>s.length()-1) return false;
        char s0 = s.charAt(i+rem);
        //System.out.println(s0);
        if(s0 != p0) return false;

        i += (rem+1);
        rem=0;
      }
    }

    return i==s.length()-rem;
  }
```
> 递归写法：
```java

public boolean matchTwoStrings(String s, String p){
    return matchTwoStrings(s, 0, 0, p, 0);
}

private boolean matchTwoStrings(String s, int i, int rem, String p, int j){
    //System.out.println(i+" "+j);
    //base case 
    if(j==p.length()) return i==s.length()-rem;

    char p0 = p.charAt(j);
    //System.out.println("p: "+p0);
    if(Character.isDigit(p0)){
        rem = rem*10 + Integer.parseInt(String.valueOf(p0));
        return matchTwoStrings(s, i, rem, p, j+1);
    }
    else {
        if(i+rem>s.length()-1) return false;
        char s0 = s.charAt(i+rem);
        //System.out.println("s:"+s0);
        if(s0 != p0) return false;

        return matchTwoStrings(s, i+rem+1, 0, p, j+1);
    }
}
```
> 现在看看这种两个指针更巧妙地思路：i和j分别指向s和p，然后根据条件跳跃着往后移；
```java
public boolean validWordAbbreviation(String s, String p){
  int i=0, j=0;
  while(i<s.length() && j<p.length()){
    if(s.charAt(i)==p.charAt(j)){
      i++;
      j++;
      continue;
    }

    //这里处理s010n不是substitution缩写
    if(p.charAt(j)<='0' || p.charAt(j)>'9') return false;

    int start = j;
    while(j<p.length() && p.charAt(j) >= '0' && p.charAt(j) <= '9')
      ++j;
    int num = Integer.valueOf(p.substring(start, j));
    i += num;
  }

  return i==s.length() && j==p.length();
}
``

1. [领扣575. 字符串解码](#字符串解码) https://www.lintcode.com/problem/575

### 匹配两个字符串 



