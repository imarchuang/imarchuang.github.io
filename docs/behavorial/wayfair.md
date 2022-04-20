# Wayfair电面Behavorial重点注意事项

## Wayfair电面模板

> 电面面试官是hiring manager，因为面试的是senior的岗位，要重点注意一下面试领域：
> 1. 体现cross-functional的经历；
> 1. 体现能够drive architectural decsion的经历，并保证production readiness；
> 1. 体现能够influence业务端stakeholder的能力；
> 1. 跟多个practice的合作，比如说PM, Business Partner, Product SME等；
> 1. 重点体现自己收集需求并转化需求为technical delivery priorities，而且要把epic切的够小，能达到可管理的deliverable units；
> 1. 体现自己决断过程中用怎样的方法论进行取舍trade-off；
> 1. 回答过程中需要注意答案要够简洁，用I不用We，明确定义自己在执行过程中所担当的角色和责任，并适时的追问面试官需不需要更多的details；

### 可能面试题
1. [印象最深的成功的project](#印象最深的成功的project)
1. [为什么想换工作](#Why-Wayfair)
1. [怎么handle conflict](#Handle-Conflict)

### 印象最深的成功的project
`walk me through a technically complex project that you have completed`

!> **思路** 建议用STAR的模板组织语言，建议用IPR项目的经历作答。

> **Situation**: 
> 1. `Time-to-Market` is a pain based on the feedback and voice tone from the business stakeholders; This painpoint is usually refected in TWO major formats: **1**. The feature enhancement request or new feature release takes quite significant amount of time comparing with what I used to experience. **2**. The time to respond and tackle a production issue/bug takes longer time than what I expected, and somewhat chaotic in terms of the process of `who to engage`, `what to triage and fix` and `when to communicate` etc. Even worse, sometimes changes to fix one issue, causes a series of other issues in a few days, which detoriate our trust with biz stakeholders a lot more.
> 1. After learning and studying the situation with teams (including Business Analysts team, QA team, IT Ops team etc.) and our business stakeholders, I quickly realized that these factors are the culprits in the process:
>    1. **Tech View** There are 2 major `Monolithic` home-grown ERP system we are dealing with, one is running on a very legacy platform IBM AS400, and the other is running a legacy JavaEE MVC framework as their backbone;
>    1. **Process View** The lifecycle of a development and deployment is `very very waterfall`, BAs collect requirements from biz stakeholders, and translate them into some documentation and pass it down to the development team, and upon development completion, manual QA team performs necessary regression and functional testing, then hand it over to IT Ops team to perform some magic to deployment to our on-prem data-center (tiny one), and IT Ops follows a tedious ITIL changement management framework to finally sign off the deployment;
>    1. **People View** In the lifecycle, development team who is in charge of actually coding and integration work are actually `outsourced` to an external consulting firm, which comprises of ~25 developers + 1 PM. The structure of this business-to-business coopration model restrict us to provide very rigid requirement docs and clear QA procedures to them, in order to avoid unnecessary contractial dispute situations. 

> **Actions**: 
> 1. For the purpose of convincing my CIO, I started advertising the need of building a new platform which leverages Domain Driven Design principles to slice and dice the features and components out from those 2 big monolithics, and build them as small testable and deployable units based on cloud-native technologies, so that the cognizant load to understand the components required from developers and QAs can be reduced. People tend to call this strategy as micro-services movement, which to me it is a bit overloaded term now.
> 1. Works with the CIO (who is my direct supervisor) to start communicating the situations and the benefits of adopting agile mehodology and practices to build a brand-new cloud native platform to our Executive leaders. And fortunate to me, it was not super hard sell the ideas to executive leaders, as on their business side, which is to manage the construction project, they have started implement some methodolgy called `LEAN construction`, which is principly similar to agile practices.
> 1. Stop digging the big-ball-of-mud, which is the TWO monithic applications. Prefer data-fix over code-fix.
> 1. Gradually cut the contract with that `external consulting` firm.
> 1. Reform the team to build the team based on agile POD concept, 2 frontend devs + 2 backend devs + 1 PO + 1 QA. Also form a DevOps team as a shared capability to break the wall between Developers and IT Ops.
> 1. Propose my first MVP to the CIO, who is also the chief Product Owner that time.

> **Results**: 
> 1. From Business Stakeholder side:
>    1. Signifant amout of fields which used to be manually filled by the PM & Sup, are now auto-filled by pulling data from the ERP systems.
>    1. Multiple users concurrently work on the docuemtns, which saves a lot of time of PM to consolidate the data into one spreadsheet.
>    1. Reviews, comments and approvals are centralized by the application, which greatly reduce the lifecycle of each review doc. And hence, historical trends can be aggregated without relying on the PM himself/herself.
> 1. From the side of warming-up the agile team:


### Why Wayfair
!> **思路** 说说在目前公司的职位职责如何不fit到自己的长期职业规划，并延伸到Wayfair如何能满足满足到自己的职业规划，顺势提到自己能给Wayfair带来什么。

> I've been with the current enterprise for about 4 years now. For the first 2+ years, my job responsibilities are focusing on re-architecturing and building a green-field cloud-native SaaS platform as an ERP solution geared specifically towards construction industry. I learned immensely over that period, especially on the field of vairous Cloud technologies and how Domain Driven Design and Containerization tactics could help you build a more scalable process and solution. About 1 and half years ago, I was promoted to be an Enterprise Architect, in which I was mainly switched to focus on strategizing cooporate's overall technology roadmap and aligning the technology roadmap with the high-level business value stream priorities. 
>
> As an enterprise architect, I indeed get exposed more variety of different kind of technologies, e.g., digital twin, drones in construction site, IoT during construction phase, virtual design in construction (VDC) etc. I do appreciate the fact that it broaders my technology knowledge in terms of breath, however, I release that I am moving away more and more from the technical depth into certain technologies that I am interested. For instance, I am fewer and fewer time spending on hands-on coding tasks.
>
> As my long term career goal, I would still like to pursue in the technical expert route in certain technologies. As such, I would say that it's time for me to graduate from XXXX, and switching back to a more hands-on role. In addition, due to the fact of "innovation lab" sorta scenario within my current employer, I think I have pretty much reached the top of the career path here. I would like to move to a big platform, and starting with a very hands-on role in a big tech firm. I think Wayfair definitely can offer me that kind of BIG platform, where I could feel more fulfilling and impactful by seeing the products/platforms that I am working on brings values and good experiences to a huge number of end users.

### Handle Conflict
!> **思路** 说说当时关于MySQL vs MongoDB的debate。

> When I successfully convinced the executive leadership team that a new cloud-native SaaS platform is required, I made a decision to leverage MongoDB as our primary database backend for the new platform for the following reasons:
> 1. At the early stage of the new platform, the schema of is very like to evolve, aka, changes occur frequently. MongoDB's semi-schemaless fact could greatly reduce the burden of a schema change process. In addition, MongoDB provides a very developer friendly process in terms of administrative tasks like indexing, migrating data etc., as I would like a more developer centric approach in the new platform development.
> 1. I also anticipated a descrepency between the new platform's schema and the legacy monolithic application schema for the same domain. As an initial migration of data from legacy systems is definitely needed. For instance, the `alias` field in the legacy application's company domain might be decided **not to migrate** at the begining, but this decision might change along the way of new platform development.
>
> However, the 