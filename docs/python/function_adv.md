# 你懂python的function吗

> 我先告诉你，nested function和high order function不是一回事！nested function是说你在一个function里嵌套在另一个function里，而high order function是说这个function里的某一个或者多个paramter是function类型。这两种风格在Python里各有用途：
>1. **nested function**可以让你实现closure，其实这个说法不太对，应该说nested function就是closure，是Python自带的功能；
>1. **high order function**可以让你实现decorator模式，这也是Python原生提供的一种便利；

## Nested Function
>举个最简单例子，然后顺便说明一下Python里的**命名空间**(NameSpace)：
```python
def print_enclosing(msg):
    # This is the outer enclosing function
    def printer():
        # This is the nested function
        print(msg)
    
    printer()
# 演示一下怎么使用
print_enclosing("Hello")
# Output: Hello
```
>这里的`print_enclosing`就是所谓的enclosing函数，然后这个enclosing函数里定义了一个`printer()`函数，并直接执行这个函数。这里你看到，在这个nested`printer()`函数可以直接access它的enclosing函数的输入参数，当然这里只是一个读操作，如果你需要修改这个变量，你就需要用到`nonlocal`这个keyword了。
>
>这么说吧，对于变量（指向object，当然包括function型）的读操作，Python是按照这个顺序来检索的：**LEGB**，也就是说`locals` -->> `enclosing function` -->> `globals` -->> `__builtins__`，这些命名空间也很好理解：
>1. local: 函数本身的namespace，只记录当前函数内的对象；
>1. enclosing function: 当前函数的enclosing函数内所记录的对象；
>1. globals: python模块的namespace，每个模块都有自己的namespace，记录模块内的class，function等；
>1. `__builtins__`: python内置的namespace，在python解释器启动的时候创建，有很多内置函数；
>现在我们修改一下上面的例子，看看**closure**是怎么实现的：
```python
def print_enclosing(msg):
    # This is the outer enclosing function
    def printer():
        # This is the nested function
        print(msg)
    
    return printer
# 演示一下怎么使用
another = print_enclosing("Hello")
another()
# Output: Hello
```
> 你细品一下，这次这个`print_enclosing`enclosing函数没有直接执行这个`printer`函数，而且返回这个`printer`函数，这就是python里原生的一个功能了 -> 这个返回printer函数是带state的，这就是实现closure的关键，当你执行`another = print_enclosing("Hello")`，这个“Hello”就会以state的形式存在返回的printer函数里，所以但你执行`anoteher()`时，这个state是存在函数里的。
>? 那么啥时候用Closure这么好的概念呢？其实本质上还是**复用性**的工程实践，因为从pure function (stateless function)角度说，有state其实是不利于可读性的，但是当这些state并不难理解的时候，**复用性**可能就更重要了。比如说下面这个例子，会让某个函数更具有可复制性且语义更加清晰：
```python
def make_multiplier_of(n):
    def multiplier(x):
        return x * n
    return multiplier
# Multiplier of 3
times3 = make_multiplier_of(3)
# Multiplier of 5
times5 = make_multiplier_of(5)
# Output: 27
print(times3(9))
# Output: 15
print(times5(3))
# Output: 30
print(times5(times3(2)))
```
>
>

## High Order Function
>说完了Closure，我们就看看Python里它的最常见的应用场景**Decorator**吧：
```python
def prettify(func):
    def inner():
        print('I got decorated!')
        func()
    return inner
def ordinary():
    print('I am ordinary')
>>> ordinary()
I am ordinary
>>> # let's decorate this ordinary function
>>> pretty = prettify(ordinary)
>>> pretty()
I got decorated
I am ordinary
#下面两种写法是一模一样的：
def ordinary():
    print("I am ordinary")
ordinary = make_pretty(ordinary)

@make_pretty
def ordinary():
    print("I am ordinary")
```
>
>说白了，Decorator就是在不改变原来Function代码的前提下在Pre和Post两个切点上进行逻辑上的装饰。
>那么如果有参数呢？这就是Closure的用武之地了。
>
```python
def smart_divide(func):
    def inner(a, b):
        print("I am going to divide", a, "and", b)
        if b == 0:
            print("Whoops! cannot divide")
            return

        return func(a, b)
    return inner
@smart_divide
def divide(a, b):
    print(a/b)
>>> divide(2,5)
I am going to divide 2 and 5
0.4
>>> divide(2,0)
I am going to divide 2 and 0
Whoops! cannot divide
```
> 那你是不是觉得每次都得知道要decorate的函数的输入参数，这样太局限了吧，没错，但是Python是Dynamic的语言嘛，解决方案就是`function(*args, **kwargs)`，示例如下：
```python
def works_for_all(func):
    def inner(*args, **kwargs):
        print("I can decorate any function")
        return func(*args, **kwargs)
    return inner
```
>

### Production环境里的decorators
>
> 举几个生产环境里的usecase，手把手的演示怎么用`functools.wraps`
>
>
>
>
>

>
> 只用于function：
```python
from functools import wraps

def run_three_times(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        for i in range(3):
            fn(*args, **kwargs)

    return wrapper

@run_three_times
def calculate_it(a,b):
    print(f"input: {a} {b}")
```

>
> 需要额外的configs：
> 
```python
from functools import wraps

def run_n_times(n):
    def inner(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for i in range(n):
                fn(*args, **kwargs)

        return wrapper

    return inner

@run_n_times(n=5)
def calculate_it(a,b):
    print(f"input: {a} {b}")
```

>
> 用于function和class method:
```python
import inspect
from functools import wraps

def require_full_admin_role(function):
    @wraps(function)
    def wrapper_class_method(self, request, *args, **kwargs):
        admin_role: RoleWithCompany = parseFullAdminRole(request)
        kwargs["role"] = admin_role
        return function(self, request, *args, **kwargs)

    @wraps(function)
    def wrapper(request, *args, **kwargs):
        admin_role: RoleWithCompany = parseFullAdminRole(request)
        kwargs["role"] = admin_role
        return function(request, *args, **kwargs)

    sig = inspect.signature(function)
    if head(sig.parameters) == "request":
        return wrapper
    return wrapper_class_method
```
