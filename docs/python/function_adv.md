# Descriptor Protocol

## Python食物链:: Attribute Lookup Chain
> **敲黑板** 这部分内容非常重要，也是能深入理解并合理使用Descriptor的前提！
>1. 王者中的王者, 当你习惯性的用dot operator去access实例上的某个attribute时候，而且attribute本身是**Data Descriptor**，最最最先被调用的方法就是attribute本身的 __get__ 方法，这个被调用的前提这个attribute本身是**Data Descriptor**，简单来说就是如果某个class你实现了**descriptor protocol**中的.__set__() or .__delete__()方法，那这个class的实例被用作别的对象上的attribute时候呢，这个attribute就可以称之为**Data Descriptor**；
>1. 如果上一步没找到呢，那就去实例object本身的 __dict__ property上去检索这个以attribute名字为key的值，__dict__ property本身是个dictionary；
>1. 如果上一步没找到呢，而且attribute本身是**Non-Data Descriptor**，then 那就去调用descriptor上的 __get__ 方法以返回结果。这步能被调用的前提这个attribute本身是**Non-Data Descriptor**，简单来说就是如果某个class你实现且只实现了**descriptor protocol**中的.__get__()方法；
>1. 如果上一步没找到呢，那就去实例object本身的class也就是type上的 __dict__ property上去检索这个以attribute名字为key的值，class也或者type上的__dict__ property本身是个dictionary；
>1. 如果上一步没找到呢，那就去实例object本身class的**母parent class**上的 __dict__ property上去检索这个以attribute名字为key的值；
>1. 如果上一步没找到呢，那就递归式的去实例object本身class的**母母母... grand grand grand parent class**上的 __dict__ property上去检索这个以attribute名字为key的值；
>1. 如果最后就是没找到呢，对不起，只能返回AttributeError exception了；
>
>

## Python Descriptor
> Python有个东东叫做Descriptor，就是说如果你的class/object实现了**descriptor protocol**里的任意一个方法，那就可以称之为Descriptor了。**descriptor protocol**有四个methods的签名，分别是`__get__(self, obj, type=None)`, `__set__(self, obj, value)`, `__delete__(self, obj)`, 和`__set_name__(self, owner, name)`.
>1. 如果你创建了一个Descriptor，并把这个Descriptor用作其他对象object的attribute，那么当你的对象object access这个`descriptor attribute`的时候呢，他的行为准则是比较特殊的。下面就看看有哪些特殊之处：
>       * **`__get__(self, obj, type=None)`**: 这个函数签名里，`self`指的是descriptor本身实例instance，obj是指这个Descriptor所附着的对象object实例，type指的是descriptor所附着的object实例的type；
>       * **`__set__(self, obj)`**: 这个函数签名里，`self`指的是descriptor本身实例instance，obj是指这个Descriptor所附着的对象object实例。这里你不能access附着对象object的type了，所以你只能在某个具体实例上调用`.__set__()`，实例的cls是不具备这功能的；
>
> 你品出来了没？这个Descriptor附着到某个object上之后呢，它本身呢就**bind**到对象上了，当你你用dot operator`obj1.descriptor_attribute`access它的时候呢，恭喜你，你有了所谓的hook点了，这个hook点呢对descriptor所**bind**的object也是有上帝视角的。
>1. `@property`是一个典型的实现了descriptor protocol的函数，它实际的签名是长这样的：`property(fget=None, fset=None, fdel=None, doc=None) -> object`
>

>举个最简单例子，来说说Descriptor的规则：
```python
class VerboseAttribute():
    def __get__(self, obj, type=None) -> object:
        print('accessing the attribute to get the value')
        return 42
        
    def __set__(self, obj, value) -> None:
        print('accessing the attribute to set the value')
        raise AttributeError('Cannot change the value')


class Foo():
    attribute1 = VerboseAttribute()

# 演示一下怎么使用
my_foo_obj = Foo()
x = my_foo_obj.attribute1
print(x)
#accessing the attribute to get the value
#42
```


> **敲黑板** Python里的descriptors是**只实例一次**的！意思就是说某个class的所有实例对象都share一个共享的descriptor实例！
```python
# descriptors2.py
class OneDigitNumericValue():
    def __init__(self):
        self.value = 0
    def __get__(self, obj, type=None) -> object:
        return self.value
    def __set__(self, obj, value) -> None:
        if value > 9 or value < 0 or int(value) != value:
            raise AttributeError("The value is invalid")
        self.value = value

class Foo():
    number = OneDigitNumericValue()

my_foo_object = Foo()
my_second_foo_object = Foo()

my_foo_object.number = 3
print(my_foo_object.number)
print(my_second_foo_object.number)

my_third_foo_object = Foo()
print(my_third_foo_object.number)
```