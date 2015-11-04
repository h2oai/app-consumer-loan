package org.gradle;

import java.io.*;
import java.util.Map;

import javax.servlet.http.*;
import javax.servlet.*;

import hex.genmodel.easy.prediction.BinomialModelPrediction;
import hex.genmodel.easy.prediction.RegressionModelPrediction;
import hex.genmodel.easy.*;

public class PredictServlet extends HttpServlet {
  // Set to true for demo mode (to print the predictions to stdout).
  // Set to false to get better throughput.
  static final boolean VERBOSE = true;

  static EasyPredictModelWrapper badLoanModel;
  static EasyPredictModelWrapper interestRateModel;

  static {
    BadLoanModel rawBadLoanModel = new BadLoanModel();
    badLoanModel = new EasyPredictModelWrapper(rawBadLoanModel);

    InterestRateModel rawInterestRateModel = new InterestRateModel();
    interestRateModel = new EasyPredictModelWrapper(rawInterestRateModel);
  }

  @SuppressWarnings("unchecked")
  private void fillRowDataFromHttpRequest(HttpServletRequest request, RowData row) {
    Map<String, String[]> parameterMap;
    parameterMap = request.getParameterMap();
    if (VERBOSE) System.out.println();
    for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
      String key = entry.getKey();
      String[] values = entry.getValue();
      for (String value : values) {
        if (VERBOSE) System.out.println("Key: " + key + " Value: " + value);
        if (value.length() > 0) {
          row.put(key, value);
        }
      }
    }
  }

  private BinomialModelPrediction predictBadLoan (RowData row) throws Exception {
    return badLoanModel.predictBinomial(row);
  }

  private RegressionModelPrediction predictInterestRate (RowData row) throws Exception {
    return interestRateModel.predictRegression(row);
  }

  private String createJsonResponse(BinomialModelPrediction p, RegressionModelPrediction p2) {
    StringBuilder sb = new StringBuilder();
    sb.append("{\n");
    sb.append("  \"labelIndex\" : ").append(p.labelIndex).append(",\n");
    sb.append("  \"label\" : \"").append(p.label).append("\",\n");
    sb.append("  \"classProbabilities\" : ").append("[\n");
    for (int i = 0; i < p.classProbabilities.length; i++) {
      double d = p.classProbabilities[i];
      if (Double.isNaN(d)) {
        throw new RuntimeException("Probability is NaN");
      }
      else if (Double.isInfinite(d)) {
        throw new RuntimeException("Probability is infinite");
      }

      sb.append("    ").append(d);
      if (i != (p.classProbabilities.length - 1)) {
        sb.append(",");
      }
      sb.append("\n");
    }
    sb.append("  ],\n");
    sb.append("\n");
    sb.append("  \"interestRate\" : ").append(p2.value).append("\n");
    sb.append("}\n");

    return sb.toString();
  }

  public void doGet (HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    RowData row = new RowData();
    fillRowDataFromHttpRequest(request, row);

    try {
      BinomialModelPrediction p = predictBadLoan(row);
      RegressionModelPrediction p2 = predictInterestRate(row);
      String s = createJsonResponse(p, p2);

      // Emit the prediction to the servlet response.
      response.getWriter().write(s);
      response.setStatus(HttpServletResponse.SC_OK);

      if (VERBOSE) System.out.println("prediction(bad loan)     : " + p.classProbabilities[1]);
      if (VERBOSE) System.out.println("prediction(interest rate): " + p2.value);
    }
    catch (Exception e) {
      // Prediction failed.
      System.out.println(e.getMessage());
      response.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, e.getMessage());
    }
  }
}
