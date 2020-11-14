## 1000 miles overview of Looker 


### Kubernetes Key Design Principles
1. In-Database architecture
2. Looker ML purposes in a nutshell:
    * It defines the table metadata
    * It defines the relationships
    * It defines the metric calculation
2. Looker ML table and views modeling
    * model files --> database views
    * view files --> database tables (one file, one table)
2. Looker ML calculation modeling     
    * dimensions (per row calculation)
    * measures (aggregations over the table)
    * --> measures can be turned into `Materialized View`
3. Looker provide SQL Trigger(schedule) capability
    * It can be used to generate Materialized views, or even transform data and write it back    
2. API-driven extensibility 
