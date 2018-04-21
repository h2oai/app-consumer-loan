import h2o
h2o.init()

print("Import approved and rejected loan requests...")
loans = h2o.import_file(path = "data/loan.csv")
loans["bad_loan"] = loans["bad_loan"].asfactor()

rand  = loans.runif(seed = 1234567)
train = loans[rand <= 0.8]
valid = loans[rand > 0.8]

myY = "bad_loan"
myX = ["loan_amnt", "longest_credit_length", "revol_util", "emp_length",
       "home_ownership", "annual_inc", "purpose", "addr_state", "dti",
       "delinq_2yrs", "total_acc", "verification_status", "term"]

from h2o.estimators.gbm import H2OGradientBoostingEstimator
model = H2OGradientBoostingEstimator(score_each_iteration = True,
                                     ntrees = 100,
                                     max_depth = 5,
                                     learn_rate = 0.05,
                                     model_id = "BadLoanModel")
model.train(x = myX, y = myY, training_frame = train, validation_frame = valid)
print(model)

# Download generated POJO for model
import os
if not os.path.exists("tmp"):
    os.makedirs("tmp")
model.download_pojo(path = "tmp")

myY = "int_rate"
myX = ["loan_amnt", "longest_credit_length", "revol_util", "emp_length",
       "home_ownership", "annual_inc", "purpose", "addr_state", "dti",
       "delinq_2yrs", "total_acc", "verification_status", "term"]

model = H2OGradientBoostingEstimator(score_each_iteration = True,
                                     ntrees = 100,
                                     max_depth = 5,
                                     learn_rate = 0.05,
                                     model_id = "InterestRateModel")
model.train(x = myX, y = myY, training_frame = train, validation_frame = valid)
print(model)

# Download generated POJO for model
model.download_pojo(path = "tmp")
