# 如何快速上手react

### React刷了一遍又一遍
> 希望用这篇帖子，以后直接温习（希望控制在两个小时之内）就能快速再上手React

### 关于props和state
> 1. 你开发的Javascript或者JSX的code是怎么嵌入到html里的？这是很巧妙: `ReactDOM.render(<App />, document.getElementById('root'))`；也就是说你的html（react里default是public folder里的index.html文件，里面会有个div叫root，`<div id='root'> </div>`）里有个
>       - 当你需要用React在一些传统的server side rendering的框架下，比如说C#/.Net，SpringMVC等等，技巧跟这个很像：在你的server side的template定义一个**div**，给个unique的id，然后写个类似于index.js的文件来做`ReactDOM.render(<App />, document.getElementById('root'))`;
> 1. 怎么让那你的自己开发的Component能被别的componeng引用？`export default ComponentABC`；
> 1. 每个component**最最最**重要的hookpoint就是`render()`，这个method理论是要return一个html的component；
> 1. 每个`render()`method理论上都是返回了一个html的div，所以你写多了，你肯定会需要把javascript里的一些已有的variable，function之类的嵌入到返回的html里。这个嵌入是怎么做的呢？这里你脑子里可以把React想象成一个template engine，像Thymeleaf、freemaker、mustache之类的，当然了更久远一点你可以想象到JSP。**做法**就是用`{varname}`，或者`{onClick=this.handleClick}`等；
> 1. 既然每个React的Component都是一个customized的html tag, 那么在config这个tag的时候一定是可以传入property（html的所有component都有property）的对吧，那么怎么在ReactJS里access这些props呢？你想的没错 -> 就是约定俗成的`this.props`;
> 1. 每个React的Component都是一个html tag, 所以react component对于（对外）互动html的最粗暴地方式就是props，当时这些肯定不够，你为你写多了React，你就会发现你写的Component多数都是stateful的，比如说一个你开发的某个grid用来展示表格数据，他肯定需要把后端pull回来的数据暂时缓存到某地儿对吧？这就是`this.state`的概念；
> 1. 这个`this.state`就是个json object，里面肯定有很多key，当你需要某个key的时候，可以用ES6的destructuring: `let {key1Val} = this.state`；
>
>
>
>
>
>
>
>
>
>
>

