# Python和Javascript(ES6)都是Dynamic typing语言

> Python和JS作为动态形态语言的两大土豪，相似之处也是无处不在的。这篇帖子先说说Iterator和Generator，之后再找时间说说class，希望通过互相比较，找到动态语言的一些共性。


## Python Iterator
>Python里呢有个东西叫**iterator protocol**，就是像duck-typing里提到的，只要一个Python的object实现了`__iter__()`和`__next__()`这两个函数，你的object就实现**iterator protocol**了，也就是说你可以`for`循环你的objects，可以用list comprehension了，也可以用generator了。如果一个对象实现了**iterator protocol**，那么就称这个为**iterable**。
>1. `__iter__()`: 这个函数返回对象object本身；如果需要的话，你可以先做一些initialization；
>1. `__next__()`: 这个函数返回序列里的下一个item，当没有剩余的item时候，raise一个StopIteration；
>
>Python里很多内置的container都是iterable，比如list，tuple，string等。。。
>
>顺便提一下，Python里的前后双下划线(`'_'`)函数，比如说`__next__()`函数，那么你就可以就实现了这样叫这个函数：`next(obj)`，这里的obj是实现了`__next__()`函数的对象object。这个`next(obj)`会call实际的`__next__(self)`函数，也就是说`next(obj)`实际上就是`obj.__next__()`。
>
> 举个例子实际说明一下：
```python
class PowerTwo
    """
    Class to implement an iterator of powers of two
    """

    def __init__(self, max=0):
        self.max = max

    def __iter__(self):
        self.n - 0
        return self

    def __next__(self):
        if self.n <= self.max:
            result = 2 ** self.n
            self.n += 1
            return result
        else:
            raise StopIteration

# 演示一下怎么使用
# create an object
numbers = PowTwo(3)

# create an iterable from the object
i = iter(numbers)

# Using next to get to the next iterator element
print(next(i))
print(next(i))
print(next(i))
print(next(i))
print(next(i))

#实际应用中，你可能很少直接调用next函数，通常你会用for循环：
for element in Power(3):
    ....

#上面的for循环实际上Python会把它转成While循环:
# create an iterator object from that iterable
iter_obj = iter(PowTwo(3))

# infinite loop
while True:
    try:
        # get the next element:
        element = next(iter_obj)
        ....
    except StopIteration:
        # if StopIteration is raised, break from loop
        break;

# 有意思不？你写的for循环实际上个无限循环

```

## Javascript Iterator
>Javascript里呢，基本上跟Python是一样的，只不过呢它的工程化实践可以说跟成熟一点。跟Python里直接用双下划线(`'_'`)函数这么裸的协议来实现，Javascript里有个叫做**Symbol**的概念，这个**Symbol**呢，就把他自己和其他用户定义的property区分开来了。
>
```js
let array = [1,2,3];
let it = array[Symbol.iterator](); //这个it就是一个Iterator object

//这个iterator object上有个method叫做next
it.next(); //这里就会实际返回下一个item的object，这个object有两个property，一个叫做done：表示iterator还有没有下一个item；另一个叫做value：就是原来iterable中的value

//你自己让你的object成为一个iterable的方式就是在你的object上实现[Symbol.iterator]这个特殊的property，值是第一个函数，而且这个函数里要实现一个带next()函数的对象object：
let person = {
    name: 'Marc',
    hobbies: ['bball', 'coding'],
    [Symbol.iterator]: function() {
        let i = 0;
        let hobbies = this.hobbies;
        return {
            next: function() {
                let value = hobbies[i];
                i++;
                return {
                    done: i >= hobbies.length ? true : false,
                    value = value
                };
            }
        }      
    }
}

//这样你的person就是iterable了，你就可以用javascript里自带的for循环了
for(let hobby of person){
    console.log(hobby);
}

```
> 你体会一下，这是不是比Python更巧妙一点？Javascript用一个特殊的property`Symboal.iterator`来标记这个object是否为一个iterable，然后它的iterator本身实现了`next()`函数，这个next函数呢实际上返回item的值，也同时返回done这个flag来标记是否还有下一个item。

## Python Generator
>Python里的Generator是iterator的一个延伸，我们就看看直接看个简单例子吧：
```python
# A simple generator function
def my_gen():
    n = 1
    print('This is printed first')
    # Generator function contains yield statements
    yield

    n += 1
    print('This is printed second')
    yield n

    n += 1
    print('This is printed at last')
    yield n

# 演示一下怎么使用
>>> # It returns an object but does not start execution immediately.
>>> a = my_gen()

>>> # We can iterate through the items using next().
>>> next(a)
This is printed first
1
>>> # Once the function yields, the function is paused and the control is transferred to the caller.

>>> # Local variables and theirs states are remembered between successive calls.
>>> next(a)
This is printed second
2

>>> next(a)
This is printed at last
3

>>> # Finally, when the function terminates, StopIteration is raised automatically on further calls.
>>> next(a)
Traceback (most recent call last):
...
StopIteration
>>> next(a)
Traceback (most recent call last):
...
StopIteration

```
>上面的示例有个关键字叫做**yield**，这就是告诉Python，不要立即返回，而是当你在调用`__next__()`的时候在去eval。也就说用了这个**yield**关键字，它就自动的帮你实现了`__iter__()`和`__next__()`这两个函数，你的object就实现**iterator protocol**了，这不过这个iterable并不马上eval。
>
> 还有一个关键知识点，那就是上面示例里的变量`n`实际上是个**state**，所以当你多次调用`__next__()`函数时候，这个变量`n`的值是被一层一层传递下去的，这点不同于常规的函数，因为常规函数里的local variables是在函数执行完毕之后自动销毁的。
>
> 最后再说一个关键点，generator对象是**只能被循环一次**的。

> 就像iterator一样，实际应用中，你可能很少直接调用这么底层的`__next__()`函数，而是通常你会用for循环来调用generator对象。再说一点，你实践中定义的generator函数通常会有个for循环加终止条件。下面举例说明：
```python
# for循环调用generator对象
for item in my_gen():
    print(item)

# 定义generator对象
def rev_str(my_str):
    length = len(my_str)
    for i in range(length - 1, -1, -1):
        yield my_str[i]

# For loop to reverse the string
for char in rev_str("hello"):
    print(char)

```
> 就像用lambda可以定义匿名函数一样，有时候你可能需要定义一个匿名的generator函数，这就需要用到generator expression，示例如下：
```python
# Initialize the list
my_list = [1, 3, 6, 10]

# square each term using list comprehension
list_ = [x**2 for x in my_list]

# 那么怎么用generator expression呢？就是把中括号变成括号就行了
generator = (x**2 for x in my_list)

print(list_) # [1, 9, 36, 100]
print(generator) # <generator object <genexpr> at 0x7f5d4eb4bf50>

print(next(a))
print(next(a))
print(next(a))
print(next(a))
```
> 上面Iterator示例中，我们考到了如何自定义一个`PowTwo`的class，那么如果用Generator的话，长什么样呢？
```python
def PowTwoGen(max=0):
    n = 0
    while n < max:
        yield 2 ** n
        n += 1
```

## Javascript Generator
>Javascript里呢，Generator基本上跟Python是一样的，只不过呢它的工程化实践可以说跟成熟一点。跟Python里直接用双下划线(`'_'`)函数这么裸的协议来实现，Javascript里有个叫做**Symbol**的概念，这个**Symbol**呢，就把他自己和其他用户定义的property区分开来了。
>
```js
```