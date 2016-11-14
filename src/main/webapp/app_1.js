$(document).ready(function(){
  $response = $('#responseField');

  function predict() {
    var changed_field = $(this).parents("form")["context"]["id"];
    var changed_value = $(this).parents("form")["context"]["value"];
    // console.log(changed_field);
    var data = {};

    $('input').each(function(){
      var $field = $(this);
      // console.log($field.attr('data-column'));
      data[$field.attr('data-column')] = $field.val();
    });

    $('select').each(function(){
      var $field = $(this);
      data[$field.attr('data-column')] = $field.val();
    });

    function testAlternates() {
      // console.log(this);
      var data = {};

      $('input').each(function(){
        var $field = $(this);
        data[$field.attr('data-column')] = $field.val();
      });

      $('select').each(function(){
        var $field = $(this);
        data[$field.attr('data-column')] = $field.val();
      });

      var rates = [];

      // data[changed_field] = changed_value * 2;

      // find the point at which the loan will be approved
      // replace with binary search later

      var found = false;
      var loanLimit = 100000;

              // d3 build chart

        var svg = d3.select("svg"),
          width = +svg.attr("width"),
         height = +svg.attr("height"),
        padding = 50;

        var loanAmountScale = d3.scaleLinear()
          .domain([0, loanLimit])
          .range([0, width - 2*padding]);

        var interestRateScale = d3.scaleLinear()
          .domain([12, 16])
          .range([height - 2*padding, 0]);

        svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + (padding) + ", " + padding + ")")
        .call(d3.axisLeft(interestRateScale));

        svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate("+(padding)+"," + (height - padding) + ")")
        .call(d3.axisBottom(loanAmountScale));  

        console.log(rates);

        var line = d3.line()
          .x(function(d) { return loanAmountScale(parseInt(d["amount"])); })
          .y(function(d) { return interestRateScale(d["rate"]); });

        var updateLineChart = function(input_rates) {

          svg.append("path")
            .datum(input_rates)
            .attr("class", function(d) { return "graphline"; } )
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("transform", "translate("+padding+"," + (padding) + ")")
            .attr("d", line);
        }

        var addScatterPlot = function(input_point) {

          // console.log(input_point[0])

          svg.selectAll("circle")
            .data(input_point).enter()
            .append("circle")
            .attr("cx", function(d) { console.log(d); return loanAmountScale(d["amount"]); })
            .attr("cy", function(d) { return interestRateScale(d["rate"]); })
            .attr("r", 5)
            .attr("fill", "black")
            .attr("transform", "translate("+padding+"," + (padding) + ")");
        }

        var getApproval = function(n) {

          data["loan_amnt"] = n;

          var xhr_alternate = $.getJSON('/predict', data)
            .done(function(data){
              rates.push({"amount": n, "rate": data.interestRate});
              updateLineChart(rates);
              addScatterPlot([{"amount": n, "rate": data.interestRate}]);
              // console.log(n);
              if(data.label === '1') {
                // $optimal = $('#optimalField');
                // $optimal.text("Try decreasing your loan amount to: $" + n);
              } else {
                if (!found) {
                  found = true; 
                  $optimal = $('#optimalField');
                  $optimal.text("Try decreasing your loan amount to: $" + (n));
                }
              }
            })
            .fail(function(error){
              console.error(error.responseText ? error.responseText : error);
              console.log('(Invalid input)');
            })
        }

        for (var initial_value = loanLimit; initial_value/1000 > 0; initial_value = initial_value - 1000) {
          getApproval(initial_value);
          
        }

    } // end of testAlternates

    var xhr = $.getJSON('/predict', data)
      .done(function(data){
        // console.log(data);
        if (data.label === '1') {
          $response.text('Declined!');
        } else {
          $response.text("Approved at " + data.interestRate.toFixed(2) + '%');
          $optimal = $('#optimalField');
          $optimal.text("");
        }
        if (changed_field == "loanAmountField" && data.label === '1') {

          $optimal = $('#optimalField');
          $optimal.text("Try decreasing your loan amount to: $");

          testAlternates();
        }
      })
      .fail(function(error){
        console.error(error.responseText ? error.responseText : error);
        $response.text('(Invalid input)');
      })
  }

  var updatePrediction = _.debounce(predict, 250);

  $('input').each(function(){
    $(this).keydown(updatePrediction);
  });

  $('select').each(function(){
    $(this).change(updatePrediction);
  });

  $("form").bind("keypress", function (e) {
    if (e.keyCode == 13) {
      return false;
    }
  });

  updatePrediction();

});

