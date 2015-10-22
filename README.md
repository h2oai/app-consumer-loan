# H2O generated POJO model WebApp Example

This example shows a generated Java POJO being called using a REST API from a JavaScript Web application.

## Pieces at work

### Processes

(Front-end)   

1.  Web browser

(Back-end)   

1.  Jetty servlet container

> Note:  Not to be confused with the H2O embedded web port (default 54321) which is also powered by Jetty.

## Files

(Front-end)   

1.  JavaScript program

(Back-end)   

1.  POJO java code
1.  genmodel.jar
1.  Servlet code
1.  web.xml deployment descriptor


## Steps to run

##### Step 1: Create the gradle wrapper to get a stable version of gradle.

```
$ gradle wrapper
```

##### Step 2: Install H2O's R package if you don't have it yet.

<http://h2o-release.s3.amazonaws.com/h2o/rel-slater/5/index.html#R>

##### Step 3: Build the project (Unix only for now).

```
$ make clean
$ make
```

##### Step 4: Deploy the .war file in a Jetty servlet container.

```
$ ./gradlew jettyRunWar
```

##### Step 5: Visit the webapp in a browser.

<http://localhost:8080/>


## Underneath the hood

Make a prediction with curl and get a JSON response.

```
$ curl "localhost:8080/predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=VERIFIED+-+income&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10"
{
  // Bad loan prediction.
  "labelIndex" : 0,
  "label" : "0",
  "classProbabilities" : [
    0.8684845397547953,
    0.13151546024520466
  ],

  // If the loan is offered (not predicted bad), the interest rate.
  interestRate : 12.441467160517762
}
```

```
$ curl "localhost:8080/predict?loan_amnt=10000&term=36+months&emp_length=5&home_ownership=RENT&annual_inc=60000&verification_status=blahblah&purpose=debt_consolidation&addr_state=FL&dti=3&delinq_2yrs=0&revol_util=35&total_acc=4&longest_credit_length=10"
[... HTTP error response simplified below ...]
Unknown categorical level (verification_status,blahblah)
```

## Data

The original data can be downloaded at <https://www.lendingclub.com/info/download-data.action> and it is all the data from 2007 to June 30, 2015.  This does not incorporate the declined loan data set which does not have the same feature set.  Note that some munging was done to distill the data to what is in this git repository.

## References

The starting point for this example was taken from the gradle distribution.  It shows how to do basic war and jetty plugin operations.

1. <https://services.gradle.org/distributions/gradle-2.7-all.zip>
2. unzip gradle-2.7-all
3. cd gradle-2.7/samples/webApplication/customized

