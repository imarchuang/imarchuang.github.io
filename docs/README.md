# imarchuang.github.io

## General Philosophy
* Can we make cdata with an efficient key-value pairing system?
* Why [kubernetes] adopts implicit/dynamic grouping whereever possible?

## Product Pattern 

* Bring you legacy to your new platform OR embed your new platform to your legacy?
* iFrame your legacy so that you can have a hook layer!
* What happens when you stop digging your big-ball-of-mud?
* x-y axis architecutre? API Gateway as x-axis, and Data Catalog as y-axis
* [Pro-Monolithic] Should Authorization Scope be distributed via a JWT token?
* Leveraging Firewall rules concepts in your products constraint policy configuration?
* Why do we need a shared-service team (aka, Team X)? Is share-nothing only existing in Utopian?
* Why cherography is prefered over orchestration in your distributed micro-services architecture?
* What exactly a BFF layer bring to your distributed micro-services architecture?
* Can we offer a person with TWO users from TWO different authentication providers with a SSO-like experience?
* What can a Anti-Corruption Layer bring you? FormIO-Shadow, GSuite-Shadow etc.
* Why Federated Authorization is such a hard beast to resolve?
* Is there such a thing called Operational (OLTP) + Analytics (OLAP) Data solution?
* Why do you want to marry your operations (Content Administrators) to your analytics (Content Viewers)
to the same product in your organization?
* I am not sure how many organizations are really adopting Chaos Monkey...
* What is the better/faster way of supporing your product in IE?

## System Pattern

* Why API Gateway is needed? 
* Does token introspection really belong to the API Gateway layer?
* Is API Gateway tripper equal to Back-For-Front layer?
* Is graphQL a generic Back-For-Frontend solution? 
* Object-Oriented Design Pattern at-scale: Port-Adaptor (aka, Hexagon) Domain Service and Anti-Corruption-Layer
* Why do we need a [glue] service in your micro-frontend architecture? Isn't it an anti-micro pattern???
* Can I make my API gateway layer a little bit more intelligent? e.g., talking to a database directly.
* Can I make my workflow engine as a centralized process coordinator? Doesn't it smell like a ESB?
* Should your micro-service to micro-service traffic be introspected by your ingress controller?
* Where is your sweet spot of defining boundaries across domains in DDD? How do you cut value streams within your domain?
* What can a service mesh bring to your architecture?
    * Security
    * Traceability (Distributed Tracing)
    * Traffic Routing (Circuit Breakers)
* Why is it so hard to have a 90% test automated in your delivery pipeline?    

## Distributed Systems
* Open Tracing with Datadog
* 2-PC, 3-PC and TCC, why not Saga?

## Distributed Building Blocks
* What content should I put into CDN as an architect?
* When should I put a cache-aside buffer using Redis for my database?
* Using Zookeeper vs Redis are your distributed lock provider
* Best rate limiter?
* Criteria when you need to adopt a managed serverless backend/Database (e.g., Mongo Atlas)
    * Security (e.g., SSO, User Auditing, PCI Compliant, encryption @Rest + In-Transit etc);
    * Recovery & Backup (e.g., Point-in-time recovery, collection/table based recover vs vm-snapshot); 
    * Scalability (dynamic scaler on storage as well as compute, horizontal scaling vs vertical scaling etc);
    * Out-of-box monitoring analytics
    * Support & Professional Services
    * Peripheral Integrations with BI toolings, CDC to others, indexing plugins etc.
* How long should our webpack build run?
* Is store-procedure or mongo pipeline a bad practices to have some of my business logic? 

## DevOps
* Do you have a agile-driven CI/CD pipeline?

## Data Analytics & Warehousing
* Is a ElasticSearch Cluster good enough as your enterprise global indexer?
* Should I use lambda data architecture or kappa daga architecture? 
* Why EL-T over ELT?
* Why do we need to segregate semi-structured data from structured data?
* Should SQL be a universal protocol for your organization to expose data to your BI tool(s)?


