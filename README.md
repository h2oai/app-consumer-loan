# H2O generated POJO model WebApp Example

This example shows a generated Java POJO being called using a REST API from a JavaScript Web application.

The application simulates the experience of a consumer applying for a loan.  The consumer provides some information about themselves and is either offered a loan or denied.


## H2O World 2015 Presentation

The "Building a Smarter Application" presentation given at H2O World 2015 references this repo.

* <https://github.com/h2oai/h2o-world-2015-training/tree/master/tutorials/building-a-smarter-application>


## Pieces at work

### Processes

(Front-end)   

1.  Web browser

(Back-end)   

1.  Jetty servlet container

> Note:  Not to be confused with the H2O embedded web port (default 54321) which is also powered by Jetty.


## Files

(Offline)
* build.gradle
* data/loan.csv
* script.R

(Front-end)
* src/main/webapp/index.html
* src/main/webapp/app.js

(Back-end)
* src/main/java/org/gradle/PredictServlet.java
* lib/h2o-genmodel.jar (downloaded)
* src/main/java/org/gradle/BadLoanModel.java (generated)
* src/main/java/org/gradle/InterestRateModel.java (generated)


## Steps to run

##### Step 1: Create the gradle wrapper to get a stable version of gradle.

```
$ gradle wrapper
```

##### Step 2: Install H2O's R package if you don't have it yet.

<http://h2o-release.s3.amazonaws.com/h2o/rel-tibshirani/2/index.html#R>

##### Step 3: Build the project.

```
$ ./gradlew build
```

##### Step 4: Deploy the .war file in a Jetty servlet container.

```
$ ./gradlew jettyRunWar -x generateModels
```

(If you don't include the -x generateModels above, you will build the models again, which is time consuming.)

##### Step 5: Visit the webapp in a browser.

<http://localhost:8080/>


## Underneath the hood

Make a prediction with curl and get a JSON response.

```
$ curl "localhost:8080/predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=verified&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10"
{
  "labelIndex" : 0,
  "label" : "0",
  "classProbabilities" : [
    0.8581645524025798,
    0.14183544759742012
  ],

  "interestRate" : 12.079950220424134
}
```

Notes:

* classProbabilities[1] is .1418.  This is the probability of a bad loan.
* The threshold is the max-F1 calculated for the model, in this case approximately .20.
* A label of '1' means the loan is predicted bad.
* A label of '0' means the loan is not predicted bad.
* If the loan is not predicted bad, then use the interest rate prediction to suggest an offered rate to the loan applicant.


```
$ curl "localhost:8080/predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=blahblah&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10"
[... HTTP error response simplified below ...]
Unknown categorical level (verification_status,blahblah)
```


## Performance

1.  Set VERBOSE to false in src/main/java/org/gradle/PredictServlet.java

1.  ./gradlew jettyRunWar -x war

1.  Run apachebench as shown here:

```
$ ab -k -c 8 -n 10000 "localhost:8080/predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=VERIFIED+-+income&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10"
This is ApacheBench, Version 2.3 <$Revision: 655654 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking localhost (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        Jetty(6.1.25)
Server Hostname:        localhost
Server Port:            8080

Document Path:          /predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=VERIFIED+-+income&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10
Document Length:        160 bytes

Concurrency Level:      8
Time taken for tests:   3.151 seconds
Complete requests:      10000
Failed requests:        0
Write errors:           0
Keep-Alive requests:    10000
Total transferred:      2470247 bytes
HTML transferred:       1600160 bytes
Requests per second:    3173.23 [#/sec] (mean)
Time per request:       2.521 [ms] (mean)
Time per request:       0.315 [ms] (mean, across all concurrent requests)
Transfer rate:          765.49 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       0
Processing:     0    3  10.5      0      52
Waiting:        0    3  10.5      0      52
Total:          0    3  10.5      0      52

Percentage of the requests served within a certain time (ms)
  50%      0
  66%      0
  75%      0
  80%      0
  90%      0
  95%      1
  98%     51
  99%     51
 100%     52 (longest request)
```

On a Macbook Pro with a 2.7 GHz Intel Core i7 this run gives:

* throughput of 3173 requests / second
* latency of 2.52 milliseconds / request


## Data

The original data can be downloaded at <https://www.lendingclub.com/info/download-data.action> and it is all the data from 2007 to June 30, 2015.  This does not incorporate the declined loan data set which does not have the same feature set.  Note that some munging was done to distill the data to what is in this git repository.


## References

The starting point for this example was taken from the gradle distribution.  It shows how to do basic war and jetty plugin operations.

1. <https://services.gradle.org/distributions/gradle-2.7-all.zip>
2. unzip gradle-2.7-all
3. cd gradle-2.7/samples/webApplication/customized

