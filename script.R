## Set your working directory
# setwd("/Users/tomk/0xdata/ws/app-consumer-loan")

library(h2o)
h2o.init(nthreads = -1)

print("Import approved and rejected loan requests...")
loans  <- h2o.importFile(path = "data/loan.csv")
loans$bad_loan <- as.factor(loans$bad_loan)

rand  <- h2o.runif(loans, seed = 1234567)
train <- loans[rand$rnd <= 0.8, ]
valid <- loans[rand$rnd > 0.8, ]

myY = "bad_loan"
myX = c("loan_amnt", "longest_credit_length", "revol_util", "emp_length",
        "home_ownership", "annual_inc", "purpose", "addr_state", "dti",
        "delinq_2yrs", "total_acc", "verification_status", "term")

model <- h2o.gbm(x = myX, y = myY,
                 training_frame = train, validation_frame = valid,
                 score_each_iteration = T,
                 ntrees = 100, max_depth = 5, learn_rate = 0.05,
                 model_id = "BadLoanModel")
print(model)

# Download generated POJO for model
if (! file.exists("tmp")) {
  dir.create("tmp")
}
h2o.download_pojo(model, path = "tmp")

myY = "int_rate"
myX = c("loan_amnt", "longest_credit_length", "revol_util", "emp_length",
        "home_ownership", "annual_inc", "purpose", "addr_state", "dti",
        "delinq_2yrs", "total_acc", "verification_status", "term")

model <- h2o.gbm(x = myX, y = myY,
                 training_frame = train, validation_frame = valid,
                 score_each_iteration = T, 
                 ntrees = 100, max_depth = 5, learn_rate = 0.05,
                 model_id = "InterestRateModel")
print(model)

# Download generated POJO for model
if (! file.exists("tmp")) {
  dir.create("tmp")
}
h2o.download_pojo(model, path = "tmp")
