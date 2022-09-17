# Python是真的Dynamic Languange

> 如果你的背景是static typed的language出身，比如说Java，你一定读过好多Design Pattern的设计**美学**对吧？但我告诉你，这些设计美学在面对Python这门语言的时候似乎就显得没那么重要了，我这里告诉你主要是有三个原因：
>1. Python确确实实的把function当做了一等公民，它真的就是一个object，所以Python里的任何东西都是object，包括函数function。
>1. Python里有个说法叫[duck-typing](#鸭子呱呱呱)，就是说如果某个object走起来叫起来都像鸭子，那么这个object就可以称之为鸭子；
>1. Python里还有个说法叫monkey-patching，意思就是说在Runtime里你可以把某个object原来的属性property完全改成另一个东东，这里的属性property中当然也包含函数function（毕竟也是个object嘛）；
>

## 鸭子呱呱呱
>举个简单例子先说明一下Python里的duck-typing：
```python
class Car:
    def walk(self):
        print(f'我是一台车，可以走')
    def quack(self):
        print(f'我是一台车，可以学鸭叫')

class Duck:
    def walk(self):
        print(f'我是一只鸭，可以走')
    def quack(self):
        print(f'我是一只鸭，可以叫')

# 演示一下怎么使用
objs = [Car, Duck]
for obj in objs:
    obj().walk()
    obj().quack()
```
>你体会到了没有，就是说你不需要像Java里那样先定义一个Interface，然后再有两个class去implement这个Interface。Python里就是这样简单粗暴，只要是你定义的某个对象Object具有某种属性或者方法，你就可以直接去使用，也就是说没有编译compile这个环节，所以你看不到所谓的**类型不匹配的错误**情形，而是Runtime时候会告诉你某个属性存不存在。也就是说啊，在Python里的Object并不关注这个object的类型，而是更关注这个object是怎么使用的。
>
>面向对象更多只是一种工程实践标准，Python里也算是“半”支持了，那我们看看Python里比较标准的**多态**实现吧：
```python
from abc import ABCMeta, abstractmethod
class Payment(metaclass=ABCMeta):   # metaclass 元类  metaclass = ABCMeta表示Payment类是一个规范类
    def __init__(self,name,money):
        self.money=money
        self.name=name

    @abstractmethod      # @abstractmethod表示下面一行中的pay方法是一个必须在子类中实现的方法
    def pay(self,*args,**kwargs):
        pass

class AliPay(Payment):
    def pay(self):
        # 支付宝提供了一个网络上的联系渠道
        print('%s通过支付宝消费了%s元'%(self.name,self.money))

class WeChatPay(Payment):
    def pay(self):
        # 微信提供了一个网络上的联系渠道
        print('%s通过微信消费了%s元'%(self.name,self.money))

class Order(object):
    def account(self, pay_obj):
        pay_obj.pay()

wechat_pay_obj = WeChatPay("wang",100)
ali_pay_obj = AliPay("zhang",200)

order = Order()
order.account(wechat_pay_obj)
order.account(ali_pay_obj)
```
>从上述例子可见，在调用order对象的account()方法时，程序并不关心为该方法传入的参数对象pay_obj是谁，只要求此参数对象pay_obj包含pay()方法即可，而调用者传入的参数对象类型pay_obj是子类对象还是其他类对象，对Python来说无所谓

>其实Python好多包好的数据结构都是通过这种**隐性协议**来实现的，最经典的例子就是如何实现**序列**。你只需要实现两个方法：`__len__` 和 `__getitem__`, 只要你的class里实现了这两个方法，恭喜你，你客制化的数据机构已经具备**序列**的属性了，比如说你现在就可以这样使用你的class了：
```python
import collections
Card = collections.namedtuple('Card', ['rank', 'suit'])
class MyClass:
    ranks = [str(n) for n in range(2,11)]
    suits = 'spades diamonds clubs hearts'.split()

    def __init__(self):
        self.cards = [Card(rank, suit) for suit in self.suits
                                       for rank in self.ranks]

    def __len__(self):
        return len(self.cards)

    def __getitem__(self, position):
        return self.cards[position]

#你可以这么使用你的class了
deck = MyClass()
sorted(deck)
random.shuffle(deck)
...
```
>Python中，通过对内置特殊函数的实现（前后双_函数），从而获得Python原生的支持，其中对一元中缀表达式的覆盖，对常规加法操作、乘法操作等的覆盖，皆是鸭子类型的表现形式。
>
>! 这里我想延伸一下，Go作为静态语言，它其实“半”实现了类似这种duck-typing的编程风格，你知道go里是怎么做到的吗？


## 猴子打补丁
>说完鸭子，我们来说说猴子吧。
>
>
>
>