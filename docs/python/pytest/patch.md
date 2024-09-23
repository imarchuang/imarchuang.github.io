# mock.patch的核心原理是啥

### patch的原理
> 当你用`with mock.patch("requests.Session")`, 它背后其实是run了一个`setattr(...)`的code，所以呢，他跟你怎么import是密切相关的。
> 
>
>

### patch的各种用法

#### 用annotation
```

```

#### 原始的context manager用法
```
patcher = patch("requests.Session")
mock = patcher.start()
# 执行你对mock object的各种骚操作
mock.return_value.get.return_value.json.return_value = {'name': 'Secret User'}
patcher.stop() 
```