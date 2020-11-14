## What and how should we promisify in your NodeJS layer


#### Promisify your MySQL communications
```
const mysqlConn = mysql.createConnection({
                  host: 'yourMySQLHost',
                  user: 'yourUserName',
                  password: 'yourPassword',
                  database: 'yourDB'
          });
const promiseMysqlQuery = promisify(mysqlConn.query).bind(mysqlConn);

async function fetchDataFromGate3Mysql(promiseMysqlQuery, sqlStatement) {

    //console.log(sqlStatement);
    let jsonResultSet = [];

    await promiseMysqlQuery({sql: sqlStatement}) //{sql: 'SELECT COUNT(*) AS count FROM big_table', timeout: 60000}
        .then((results, fields) => {

            //slice the array with 30k incr
            let from = 0;
            let jsonResultSlice = [];
            do {
                //reset
                jsonResultSlice = [];
                let stringResultSlice = JSON.stringify(results.slice(from, from+30000));
                jsonResultSlice = JSON.parse(stringResultSlice);

                jsonResultSet = jsonResultSet.concat(jsonResultSlice);
                from+=30000;
            }
            while (jsonResultSlice.length > 0);

        })
        .catch(err => {
            console.error(err)
        });

    console.log('>> length of result: ', jsonResultSet.length);
    return jsonResultSet;
}
```

