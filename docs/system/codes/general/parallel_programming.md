## How to better utilize your CPU compute resources -- parallel programming 


####  Threads to the rescue?
One of the goals for modern programming paradigm is to increase the utilization of CPU.

However, one of the common pattern in our programs 
is that we spend a lot time to communicate to our dependencies, like disk I/O, network I/O etc. (*Honestly, this also applies to our human society structure to certain extent*) 

<p>This is one of the reasons all operating systems today embeds a scheduler which would suspend a thread that is waiting for I/O to allow other threads to get work done.</p>

**Is threading good enough? Isn't too low level? hmm...**

And then [green threads](https://en.wikipedia.org/wiki/Green_threads) came into play where it emulates multithreaded environments without relying on any native OS abilities. 
**Well, is this still too low level**?

<p>Gradually, language designers came up with higher level of abstraction to do this.</p>

* low-level state machines (e.g., mio in Rust)
* callbacks + event loop (e.g., NodeJS or Ajax)
* Promises (e.g., Javascript, Java Future etc.) 
* async/await (e.g., introduced by C#, and now in ES6, Python 3.4+ etc.)

**Disclaim:** I think golang changes the concurrency coding into a different landscape today, language primitives like goroutine and channel makes parallel programming in a very different flavor comparing with other languages. I will use a different post to cover golang concurrency model.

I would like to leverage this post to cover how async await works, by using a real-life example of how Project Managers usually work.

#### Scenario:
Imagine yourself as a software Project Manager, and you just got a new project to deliver a solution in your existing Enterprise Resource Planning system, which will enable users to digitize their expense approval process.

```
function process_duration(duration) {
  return new Promise(r => setTimeout(r, duration*1000));
}

wait_for_spec = async () => {
  await process_duration(10); // simulate 10 days process time
  return "done!";
}

wait_for_timeline_review = async () => {
  await process_duration(14); // simulate 14 days process time
  return "done!";
}

wait_for_hardware = async () => {
  await process_duration(30); // simulate 30 days process time
  return "done!";
}

wait_for_security_review = async () => {
  await process_duration(10); // simulate 10 days process time
  return "done!";
}

wait_for_implementation = async () => {
  await process_duration(60); // simulate 60 days process time
  return "done!";
}
```

In the initial phase, the project manager could not do much except for coordinating the architects, UX designers, Business Analyst, and End Users (most of the times, they are business stakeholders as well) to draft out an initial solution spec.

Once the initial solution spec is out, this is when project managers would try to parallelize the communication process with project dependencies.

One way to do this would be doing all these sequentially:
```
async function wantTobeFired() {
  await wait_for_spec(); // Wait for 10 days  
  await wait_for_timeline_review(); // Wait for 14 days 
  await wait_for_security_review(); // Wait for 10 days
  await wait_for_hardware(); // Wait for 30 days
  await wait_for_implementation(); // Wait for 60 days
  return "done!";
}
```
This would lead to 124 days to deliver that desired solution.

In real-life, the project managers would take a risk to start communicating to dependencies (e.g., PMO office for timeline and resource review, IT Department for security review and hardware purchasing, and of course the implementation team) simultaneously, which would lead to a similar pattern like below:

```
async function realLife() {
  await wait_for_spec(); // Wait for 10 days  
  let timelineReview = wait_for_timeline_review(); // Wait for 14 days 
  let securityReview =  wait_for_security_review(); // Wait for 10 days
  let hardwareOrder =  wait_for_hardware(); // Wait for 30 days
  let implementation =  wait_for_implementation(); // Wait for 60 days
  
  await timelineReview; 
  await securityReview; 
  await hardwareOrder; 
  await implementation; 
  
  return "done!";
}
``` 
This would usually lead to 70 days to deliver that desired solution.
