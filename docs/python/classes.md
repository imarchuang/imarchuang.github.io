# Python里的面向对象编程

>Python和JS都是是动态语言，所以*严格意义*上不能完全符合面向对象OOD的语义。体现在以下几个方面：
>1. Python里没有所谓的protect或者private这种玩意，只能从编程规则上进行类似的操作；
>1. 动态语言嘛，并没有严格的继承**inheritance**，但是从语法上可以实现类似的操作；但是在实际运行中一定是code generation之类的操作，Javascript也是如此；
>1. operator overloading在Python里的操作还是很有趣的；
>

## 说说命名空间NameSpace
> 像是Java或者C#里，他们的scope定义层级会更复杂一些（也意味着规则更难上手一些），比如说，你在某个MyClass定义一个method，如果你不用public去修饰的话，这个method是只能被class所在的**package**（说白了就是个folder，folder里还有可能包含subfolder）里的其他class（也必然包括自己）access的，Java里的package说白了就是folder directory，看你在文件系统的第几级决定你所在的package；另外呢，Java和C#里都提供了`public`, `protected`和`private`这些修饰词来显式的决定谁能access你创建的东西；Java里有个概念叫做default access，也就是说如果你没用`public`, `protected`和`private`这些修饰词的话，你的method或者member variable是具备default access权限的，即同一个package里的其他的class可以access这些没有explict声明权限的东东的。不过呢，这里必须**强调一点**：如果你有个package在com.imarchuang，然后呢你还有一些package比如说com.imarchuang.domain之类的，Java会把这两个com.imarchuang和com.imarchuang.domain完全当做两个不同的package来处理，也就是com.imarchuang下的class是没有权限access com.imarchuang.domain里的default access的东东的。
>
> Python吧对谁能access你创建的东西这事儿呢，是十分的宽松，也可以说几乎没有限制，不过呢python community也确实是遵循约定缩成法则的。基本上就是一个原则叫做NameSpace，这个NameSpace呢是有层级概念的，也就说你能看到你所在空间里的变量，也能看到比你所在空间更大的空间的*共享*变量。
>
>**LEGB**, 也就是说`locals` -->> `enclosing function` -->> `globals` -->> `__builtins__`，这些命名空间也很好理解：
>1. **local**: 这是Python里最小的空间单元，使用于function或者method，你可以想象成村子里的一间房子。它是函数本身的namespace，只记录当前函数内的对象；在这个空间里，你的变量（可以是状态，也可以是内嵌函数）在你执行完函数之后会**自动销毁**；
>1. **enclosing function**: 函数可以嵌套函数嘛，这个空间就是当前函数的enclosing函数内所记录的对象或者变量；
>1. **globals**: Python模块(Module，也就是一个文件file.py)的namespace，每个Module模块都有自己的namespace，记录模块内的class，function等，这里你可以想象global空间是个村庄；
>       * global attribute `__name__`包含了这个Module模块的名字，比如说如果你直接run某个*.py的文件，`__main__`就是模块名字；这就是为什么有时候你会做一个python文件的尾部看到一串`if __name__ == '__main__'`的代码，就相当于给每个文件都赋予了script的功能，也就是说你可以直接用指令行允许`python file_abc.py`，当然了也有人把一些unit test直接写成script，虽然理论上可行，只不过不是很production ready而已。
>1. **`__builtins__`**: Python内置的namespace，在Python解释器启动的时候创建，有很多内置函数；比如说input，range，或者数据类型比如说int，float，str等；这就是Python用上帝之手赋予所有村庄的功能；
>1. **class**: 这个吧，当你从一个class里实例一个对象时候，class里定义的attributes都会被添加到实例对象上，当需要accesss这个实例对象的attribute时候，先从他的直属class命名空间里找，然后在从直属class的parent命名空间里找；Python允许你在实例对象上继续添加attributes，所以init完了，并非所有属性就都有了；
>
```python
z = 'global z'
def print_vars():
    y = 'local y in print_vars'
    print(y)
    print(z)

# print 来自于`__builtins__`命名空间
print_vars()
# 1. print_vars会在global命名空间里被找到
# 2. 然后遇到print函数，这会从`__builtins__`命名空间找到
# 3. 然后发现print函数需要y，这会从`local`命名空间找到
# 4. 然后又遇到print函数，这会从`__builtins__`命名空间找到
# 5. 然后发现print函数需要z，这会从`global`命名空间找到

```

## 简单示例
```python
from decimal import Decimal
# 每个class都有一下两种形式的属性，一种叫做Property，一种叫做method
class Account:
    """Account class for maintaining a bank account balance"""

    # constructor 叫做 __init__
    # Python里不用this这个关键词，而是叫做self
    def __init__(self, name, balance):
        if balance < Decimal('0.00'):
            raise ValueError('Initial balance must be >= 0.00.')
        # 这里就是隐式的定义了这个object的property
        self.name = name
        self.balance = balance

    def desposit(self, amount):
        """Deposit money to the account"""
        if balance < Decimal('0.00'):
            raise ValueError('amount must be >= 0.00.')
        self.balance += amount

# Python里不用new这个关键词
account1 = Account('John Green', Decimal('50.00'))
print(account1.name)

# 调用class里的method
account1.deposite(Deciamal('25.53'))
```
## 所谓的Scoping或者封装(encapsulation)应该怎么做
>答案是Python里没有所谓的access control，就是说不存在public, protect或者private等关键字。
>
>那你应该怎么控制谁能access你的attributes呢？答案是你做不到，那就只能按照**约定俗称**的工程法则来进行规范了，最简单的工程法则就是用Naming Convention来进行规范。比如说，如果一个attribute它的名字是underscore“_”开始的话，那说明这个class的作者希望只能这个class来对这个attribute进行读写操作。
>
>一个underscore“_”不够，那么我要是用两个underscore“_”命名一个attribute呢？比如说你的class里定义了一个叫做`__private_data`的attribute，那么Python是否做些啥来保护这个attribute呢？答案是肯定的，Python做了一个叫做mangling的动作，乃就是将两个underscore“_”命名的attribute呢进行重命名，咋个重命名规则呢？很粗暴，那就是延长这个attribute的名字，比如说你的class叫做MyClass，那么这个`__private_data`的attribute就会被重命名为`_MyClass__private_data`，这样你就可以直接想起他attribute一样对`_MyClass__private_data`进行读写操作了，但是MyClass的作者确实不想你直接对`_MyClass__private_data`进行读写操作。
>
>说实话，Python确实不能够完全实现OOD里的所谓封装的概念，但是这个封装真的有那么重要吗？现在说说自己的感受吧。OOD里一个class很大程度上代表了一个现实里的一种物体，这个object对象呢，通常需要两种属性来描述这个现实世界的物体，也就是说状态(properties)和操作(可以是让外界操作自己状态的接口API，亦可以是跟外界物体交互的接口API)。在比较大的工程里，你会看到OOD里描述的实际物体呢，实际上都是比较复杂的物体，举个例子啊，比如说你的一个class描述的是ASML的光刻机，这个class那应该是复杂的。计算机世界呢，所有的概念都是对于相关物体的抽象，这个抽象呢就类似于一个容器，容器里存了各种一系列**强相关**属性，然后这个容器也提供了各种接口好让你知道容器里的属性状态是长啥样的并进行相关增删查改操作。**当你的脑子把一些强相关的东西封装成一个容器的之后呢**，你总是希望**控制**这个容器，你通常会希望你，你在调用这个容器接口的*之前*和*之后*做点啥，从最简单的记录自己调用过这个容器的接口，到检查自己的数据是否可以调用这个容器的接口，或者到自己希望调用这个容器接口之前呢加上自己的**管理法则**...
>
>还有一个工程规范，那就是Python本身并不存在Constant的概念，当你想表达类似Constant的概念的时候你，那你就吧你的变量名字全用大写字母，LoL

## Property的getter和setter
>
>
>
```python
class Timer:
    def __init__(self, hour=0, minute=0, second=0):
        # 如果你在这个class里没有吧hour定义成@property，那么这个attribute的名字就是hour
        # 如果你定义了hour是@property，那么Python会自动创建一个叫做_hour的attribute，但你执行self.hour=时，你其实就是调用了@hour.setter
        self.hour = hour # 0-23
        self.minute = minute # 0-59
        self.second = second # 0-59
        ...
    
    @property
    def hour(self, hour):
        return self._hour

    @hour.setter
    def hour(self, hour):
        if not (0<= hour <24):
            raise ValueError(f'Hour ({hour}) must be 0-23')
        self._hour = hour

    ...
```

## 继承
>
>
>
>
```python
class Parent:
    def __init__(self, p1, p2):
        ...

    def do_something(self):
        ...

class Child(Parent):
    def __init__(self, p1, p2, extra_prop):
        super().__init(p1, p2)
        self.extra_prop = extra_prop

    def do_something(self):
        super().do_something()
        # do something unique to child
        ...

issubclass(Child, Parent) # True
c = Child('p1', 'p2', 'extra')
isinstance(c, Child) # True
isinstance(c, Parent) # True

p = Parent('p1.1', 'p2.2')

l = [c, p]
for item in l:
    item.do_something()

```

## 多态
> 动态语言的一个最大好处就是duck-typing，

## operator overloading
>这个东西似乎只有Python支持，其他的dynamic语言比如说Javascript都不support，静态语言比如Java里也没有这玩意儿。
>
>举个例子，如果你要overload这个运算符`+`，那么在你的class里你只需要把`def __add__(self, right)`给override就好了，同理你只需要把`def __iadd__(self, right)`给override了就能用`+=`运算符在你的class上了。
>

## Named Tuple
>Tuple本质上是个array，因为你不可以随意的扩展或者缩小这个sequence。
>
>Name Tuple更像是一个纯数据container，本质上是一个Key-Value pairs组合。你应该很容易想到数据库里的Table概念，尤其是如果你是只读模式，不对数据进行修改，这个namedtuple可以说就非常好用了。即使你需要对namedtuple实例内的数据进行修改，那也不是不可以。因为**tuple本身虽然是imutable的**，但是别忘了tuple内的数据item是reference嘛，所以你依然可以对数据进行修改的。

```python
from collections import namedtuple

# 给一个名字，然后给一个栏位名字的list
Card = namedtuple('Card', ['face', 'suit'])

# 现在Card基本上就是一个class了，你可以实例对象出来
card = Card(face='Ace', suit='Spades')
# 实例card之后，namedtuple定义的栏位都可以直接当做类似property来读了
card.face # 'Ace' 
card.suit # 'Spades' 

# 给一个sequence，你可以很容易的转成namedtuple的实例
values = ['Queen', 'Hearts']
card._make(values)

# namedtuple实例可以转成OrderedDict
card._asdict()
# OrderedDict([('face', 'Queen'), ('suit', 'Hearts)])
```

## Data Class
>Python里的dataclass就是类似于Java里的lombok，就是一个code generation的框架。
>
>1. 你需要对所有的property指定数据类型
```python
from dataclasses import dataclass
from typing import ClassVar, List

@dataclass(order=True)
class Card:
    FACES: ClassVar[List[str]] = ['Ace', '2', '3'...]
    SUITS: ClassVar[List[str]] = ['Hearts', 'Diamonds', 'Clubs', 'Spades']

    face: str
    suit: str

    @property
    def image_name(self):
        """Return the Card's image file name"""
        return str(self).replace(' ', '_') + '.png'

    def __str__(self):
        return f'{self.face} of {self.suit}'

    def __format__(self, format)
        return f'{str(self):{format}}'

# 看看怎么用这个dataclass
c1 = Card(Card.FACES[0], Card.SUITS[3])
c1.face # 'Ace'
c1.suit # 'Spades'
c1.image_namme # 'Ace_of_Spades.png'

c1 = Card(face='Ace', suit='Spades')
c1 == c2 # True

c3 = Card(Card.FACES[0], Card.SUITS[0])
c1 == c3 # False

```