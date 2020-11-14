## What and how should we use to promisify your MongoDB Communications
**This post briefly summarizes a few code snippets of interacting with mongodb in a `async await` manner, so that you can make use of `async-await` pattern better to get yourself out of `callback` hell.**
* [Init a mongodb connection](#initialize-a-mongodb-connection) 
* [Read from mongodb](#read-write-records-efficiently ) 
* [Wrap into a util class](#wrapping-your-functions-into-a-util-class )

### Initialize a mongodb connection
```
const MongoClient = require('mongodb').MongoClient

async function connectToProdRadix(host, user, password){
    const connectionString = `mongodb://${user}:{password}@${host}:27017/admin`;

    let client = await MongoClient.connect(connectionString, {
        useNewUrlParser: true,
    });

    return client;
}

```

### Read-Write records efficiently 
* Sample code for `batch find` and process them with cursor:
    ```
        const studentDatabase = mongoClient.db('student');
        const READ_BATCH_SIZE = 10000;
        let filter = {$or: [
                {"student.middle_name": {$exists: true},
                 "student.prefered_name": {$exists: true} }
        let cursor = studentDatabase.collection('student').find(filter).batchSize(READ_BATCH_SIZE);
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    
            //DO your logic here... 
    
        } 
        ...
    ```
* Sample code for `batch find` and directly put to memory:    
    ```
     async function cacheResToArray() {
    
        let filter = { $where: "this.attended_classes.length > 6" };
        let studentCol = db.collection('student');

        let dataSet;
        await studentCol.find(filter).toArray().then(data => {
            //console.log(data);
            dataSet = data;
        });
    }
    ```
    * Or even simpler:
    ```
    let students = await client.collection('stduent').find({number: {$in: ["1001, "1002"]} },{projection:{"student_id":1}}).toArray();
    ```
* Sample code for `aggregate` and directly put to memory:    
    ```
     
     async function aggregateToArray() {
    
       let pipeline = [{
           $match: {"$or": [{"is_passed": true},
                   {"grade": {$gt: 60}}]}
           }, {
           $lookup: {
               from: "student",
               localField: "student_id",
               foreignField: "_id",
               as: "studentData"
           }
           }, {
           $unwind: "$studentData"
           }, {
           "$project": {
               "_id": 0,
               "grade": 1,
               "subject_name": 1,
               "printAddress": 1,
               "first_name": "$studentData.first_name",
               "last_name": "$studentData.last_name",
               "student_number": "$studentData.number"
           }}];
       let collection = client.collection('student');
       let dataSet;
       await collection.aggregate(pipeline).toArray().then(data => {
           //console.log(data);
           dataSet = data;
       );
    }
    ```    
* Sample code for `insertOne`:
    ```
    const studentDatabase = mongoClient.db('students');
    let studentRec = {"first_name": "John", "last_name": "Doe", "grade": 7};
    let student = await db.collection('student').insertOne(studentRec); 
    ...
    ```    
* Sample code for `insertMany`:
    ```
    const studentDatabase = mongoClient.db('students');
    let studentRecs = [{"first_name": "John", "last_name": "Doe", "grade": 7},
                       {"first_name": "Maria", "last_name": "Moe", "grade": 7};
    let student = await db.collection('student').insertMany(studentRecs); 
        ... 
    ```    

### Wrapping your functions into a Util class 
* e.g., `students.js`:

    ```
    const COLLECTIONS = {
        STUDENT_COLLECTION: "student",
        CLASS_COLLECTION: "class",
        EXAM_COLLECTION: "exam",
    }

    class StudentUtils {

        constructor(studentDbClient) {
            this.studentDbClient = studentDbClient;
            this.studentCollection = this.studentDbClient.collection(COLLECTIONS.STUDENT_COLLECTION);
            this.classCollection = this.studentDbClient.collection(COLLECTIONS.CLASS_COLLECTION);
            this.examCollection = this.studentDbClient.collection(COLLECTIONS.EXAM_COLLECTION);
        }

        //find the stduent by number
        findStudentByNumber(studentNumber) {

            let filter = {'number': studentNumber};

            return this.studentCollection.findOne(filter);

        }

        findStudentById(studentId) {
            let filter = {'_id': studentId};
            
            return this.studentCollection.findOne(filter);
        }

        insertStudent(studentData) {
            return this.studentCollection.insertOne(studentData);
        }

        insertClasses(classData) {
            return this.classCollection.insertMany(classData);
        }

        updateStudent(id, tobeSet) {
            return this.studentCollection.updateOne({
                _id: id
            }, {
                $set: tobeSet,
            });
        }

    }
    module.exports = StudentUtils;
    ```
