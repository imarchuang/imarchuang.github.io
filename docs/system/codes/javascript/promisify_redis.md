## What and how should we use to promisify your Redis Communications
##### This post briefly summarizes a few ways where you can leverage libraries to promisify your communication to Redis, so that you can make use of `async-await` pattern better to get yourself out of `callback` hell.
- check [code snippets](#decoration-with-bluebird) for [bluebird](https://github.com/petkaantonov/bluebird) 
- check [code snippets](#decoration-with-util) for native [util](https://github.com/browserify/node-util) 
- check [code snippets](#decoration-with-async-redis) for [async-redis](https://github.com/moaxaca/async-redis)

### Promisify your Redis communications

#### **Decoration with `bluebird`**
```
const redisClient       = (require('redis')).createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOSTNAME,
  {
      auth_pass: process.env.REDIS_PASSWORD
      //tls: process.env.REDIS_PASSWORD && {servername: process.env.REDIS_HOSTNAME}
});

const client = require('bluebird').promisifyAll(redisClient);
```
* Sample code for `get` your express session data from Redis:
    ```
    getSession = async (sessionId) => {
    
        let session = await client.getAsync('sess:'+sessionId);
        session = JSON.parse(session)
    
        return session;
    }
    ```
* Sample code for `get` your express session data from Redis (with chaining):
    ```
    getSession = async (sessionId) => {
    
       return client.getAsync('sess:'+sessionId)
              .then((session, err) => err ? Promise.reject(`on ${sessionId}: ${err}`) : Promise.resolve(JSON.parse(session))) 
    }
    ```    
* Sample code for `set` your express session data from Redis:
    ```
    createSession = async (sessionId) => {
    
        let mySession = {"dummy_field1": "dummy_value1", "dummy_field2": "dummy_value2"} ;
        
        return client.setAsync('sess:'+sessionId, JSON.stringify(mySession))
              .then((res, err) => err ? Promise.reject(`on ${sessionId}: ${err}`) : Promise.resolve(res))
    }
    ```    

#### **Decoration with `util`**
```
const redisClient       = (require('redis')).createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOSTNAME,
  {
      auth_pass: process.env.REDIS_PASSWORD
      //tls: process.env.REDIS_PASSWORD && {servername: process.env.REDIS_HOSTNAME}
  }
);
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(redisClient);
const setAsync = promisify(client.set).bind(redisClient);
```
* Sample code for `get` your express session data from Redis:
    ```
    getSession = async (sessionId) => {
    
        let session = await getAsync('sess:'+sessionId);
        session = JSON.parse(session)
    
        return session;
    }
    ```
* Sample code for `get` your express session data from Redis: 
    ```
    getSession = async (sessionId) => {
    
       return getAsync('sess:'+sessionId)
              .then((session, err) => err ? Promise.reject(`on ${sessionId}: ${err}`) : Promise.resolve(JSON.parse(session))) 
    }
    ```    
* Sample code for `set` your express session data from Redis:
    ```
    createSession = async (sessionId) => {
        
        let mySession = {"dummy_field1": "dummy_value1", "dummy_field2": "dummy_value2"} ;
            
        return setAsync('sess:'+sessionId, JSON.stringify(mySession))
               .then((res, err) => err ? Promise.reject(`on ${sessionId}: ${err}`) : Promise.resolve(res))
    }
    ```   
* **Notes**: If you are looking for a easier way to promisify `all` redis communication with util, you might want to refer to neat library [redis-promisify](https://github.com/zenxds/redis-promisify), and below is the essential code snippet.
    ```
const util = require('util')
const redis = require("redis")
const redisCommands = require('redis-commands')
promisify(redis.RedisClient.prototype, redisCommands.list)
promisify(redis.Multi.prototype, ['exec', 'execAtomic'])
function promisify(obj, methods) {
  methods.forEach((method) => {
    if (obj[method])
      obj[method + 'Async'] = util.promisify(obj[method])
  })
}
module.exports = redis    
    ```

####  **Decoration with `async-redis`**<a name="asyncredis"></a>
```
const redisClient = (require('redis')).createClient(
  process.env.REDIS_PORT,
  process.env.REDIS_HOSTNAME,
  {
      auth_pass: process.env.REDIS_PASSWORD
      //tls: process.env.REDIS_PASSWORD && {servername: process.env.REDIS_HOSTNAME}
  }
);

const client = require("async-redis").decorate(redisClient);
client.on("error", function (err) {
  log.error("Error in connecting to Redis" + err);
});
```
* Sample code for `get` your express session data from Redis:
    ```
    getSession = async (sessionId) => {
    
        let session = await client.get('sess:'+sessionId);
        session = JSON.parse(session)
    
        return session;
    }
    ```
* Sample code for `set` your express session data from Redis:
    ```
    createSession = async (sessionId) => {
        
        let mySession = {"dummy_field1": "dummy_value1", "dummy_field2": "dummy_value2"} ;
            
        await client.set('sess:'+sessionId, JSON.stringify(mySession));
    }
    ``` 

**Caution** : Please adopt one of the above in your project, otherwise it might bring some unexpected complications. I have personally tried mixing `async-redis` and `bluebird` to promisify redis comms, which leads to scenarios like `only native reids client works`.

