$(document).ready(function(){
  $response = $('#responseField');

     var svg = d3.select("svg"),
      width = +svg.attr("width"),
     height = +svg.attr("height"),
    padding = 50;

    var loanAmountScale = d3.scaleLinear()
    .domain([0, 10000])
    .range([0, width - 2*padding]);

    var interestRateScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - 2*padding, 0]);

    svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + (padding) + ", " + padding + ")")
    .call(d3.axisLeft(interestRateScale).tickFormat(function(d) { return parseInt(d*100)/100 + "%"; }));

    svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate("+(padding)+"," + (height - padding) + ")")
    .call(d3.axisBottom(loanAmountScale).tickFormat(d3.format("$,"))); 

    svg.append("text")
      .attr("x", width - padding)
      .attr("y", height - padding - 5)
      .attr("text-anchor", "end")
      .text("Loan Amount");

    svg.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", "translate(" + (padding+5) + "," + padding + ") rotate(90)")
      .text("Interest Rate");

    svg.append("line")
      .attr("x1", width/2)
      .attr("y1", padding)
      .attr("x2", width/2)
      .attr("y2", height - padding)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "5,5");

    svg.append("text")
      .attr("class", "askedLoanAmount")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", padding - 5)
      .attr("font-size", 12)
      .text("Asked For Loan Amount");

    // tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });

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

    function testAlternates(approvedFlag) {
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
      var loanLimit = data['loan_amnt']*2;


      dollarFormat = d3.format("$,");
      svg.selectAll(".askedLoanAmount")
        .text(dollarFormat(data['loan_amnt']))

        // d3 transition chart

        var rescale = function() {
            loanAmountScale.domain([0, loanLimit])  
            svg.select(".axis--x")
                    .transition().duration(750).ease(d3.easeLinear)
                    .call(d3.axisBottom(loanAmountScale).ticks(5).tickFormat(d3.format("$,"))); 
        }
        rescale();

        var line = d3.line()
          .x(function(d) { return loanAmountScale(parseInt(d["amount"])); })
          .y(function(d) { return interestRateScale(d["rate"]); });

        var addScatterPlot = function(input_rates, approvedFlag) {

          // console.log(input_rates);
          var min = _.min(input_rates, function(key) { return key["rate"]; })["rate"];
          var max = _.max(input_rates, function(key) { return key["rate"]; })["rate"];
          if (min == max) {
            interestRateScale.domain([min * 0.5, min * 1.5]);
          } else {
            interestRateScale.domain([min - (max - min) / 2, max + (max - min) / 2]);
          }
          // interestRateScale.domain([12, 16])
          var y_rescale = function() {
            svg.select(".axis--y")
                  .transition().duration(750).ease(d3.easeLinear)
                  .call(d3.axisLeft(interestRateScale).ticks(5).tickFormat(function(d) { return parseInt(d*100)/100 + "%"; })); 
          }
          y_rescale();
          // console.log(input_point[0])

          svg.selectAll(".approvedMaximumSvg")
            .remove();

          svg.selectAll(".redfilter")
            .remove();

          if (!approvedFlag) {
            $optimal = $('#optimalField')
            var approvedValues = _.filter(input_rates, function(key) { return key["approved"] === '0'});
            if (approvedValues.length > 0) {
              var approvedMaximum = _.max(approvedValues, function(key) { return key["amount"]; })["amount"];
                $optimal.text("Try decreasing the requested loan amount to: " + d3.format("$,")(approvedMaximum));

                svg.append("line")
                  .attr("x1", loanAmountScale(approvedMaximum) + padding)
                  .attr("y1", padding)
                  .attr("x2", loanAmountScale(approvedMaximum) + padding)
                  .attr("y2", height - padding)
                  .attr("stroke", "black")
                  .attr("stroke-dasharray", "5,5")
                  .attr("class", "approvedMaximumSvg");

                svg.append("text")
                  .attr("class", "approvedMaximumSvg")
                  .attr("text-anchor", "middle")
                  .attr("x", loanAmountScale(approvedMaximum) + padding)
                  .attr("y", padding - 5)
                  .attr("font-size", 12)
                  .text(d3.format("$,")(approvedMaximum));

            } else {
              // var approvedMaximum = 0;
              $optimal.text("You do not qualify for any amount with these parameters");
            }
            
          }


          var approvedValues = _.filter(input_rates, function(key) { return key["approved"] === '0'});
          var approvedMaximum = _.max(approvedValues, function(key) { return key["amount"]; })["amount"];
          svg.append("rect")
            .attr("x", loanAmountScale(approvedMaximum) + padding)
            .attr("y", padding)
            .attr("width", width - loanAmountScale(approvedMaximum) - 2*padding)
            .attr("height", height - 2*padding)
            .attr("fill", "red")
            .attr("opacity", 0.3)
            .attr("class", "redfilter");

          // vis.call(tip)

          svg.selectAll(".scatter-circle")
            .remove();

          svg.selectAll("circle")
            .data(_.filter(input_rates, function(key) { return key["approved"] === '0'; })).enter()
            .append("circle")
            .attr("class", "scatter-circle")
            .attr("cx", function(d) { return loanAmountScale(d["amount"]); })
            .attr("cy", function(d) { return interestRateScale(d["rate"]); })
            .attr("r", (width-2*padding)/200)
            .attr("fill", function(d) { if (d["approved"] === '1') { return "red"; } else { return "green"; } })
            .attr("transform", "translate(" + padding + "," + (padding) + ")")
            .on('mouseover', function(d) { 

                console.log(d["rate"]);
                svg.append("line")
                  .attr("x1", loanAmountScale(d["amount"]) + padding)
                  .attr("y1", interestRateScale(d["rate"]) + padding)
                  .attr("x2", loanAmountScale(d["amount"]) + padding)
                  .attr("y2", height - padding + 5)
                  .attr("class", "highlightBar")
                  .attr("stroke", "black");

                svg.append("line")
                  .attr("x1", padding - 5)
                  .attr("y1", interestRateScale(d["rate"]) + padding)
                  .attr("x2", loanAmountScale(d["amount"]) + padding)
                  .attr("y2", interestRateScale(d["rate"]) + padding)
                  .attr("class", "highlightBar")
                  .attr("stroke", "black");

                svg.append("circle")
                  .attr("cy", interestRateScale(d["rate"]) + padding)
                  .attr("cx", loanAmountScale(d["amount"]) + padding)
                  .attr("r", 5)
                  .attr("class", "highlightBar")
                  .attr("fill", "none")
                  .attr("stroke", "black");
            })
            .on('mouseout', function(d) {
              svg.selectAll(".highlightBar")
                .remove()
            });


        }

        var getApproval = function(n, approvedFlag) {

          // console.log("starting", n);
          data["loan_amnt"] = n;

          var xhr_alternate = $.getJSON('/predict', data)
            .done(function(data){
              rates.push({"amount": n, "rate": data.interestRate, "approved": data.label});
              // updateLineChart(rates);
              addScatterPlot(rates, approvedFlag);
              // console.log(n);
            })
            .fail(function(error){
              console.error(error.responseText ? error.responseText : error);
              console.log('(Invalid input)');
            })
        }

        var interval = loanLimit / 100;
        for (var initial_value = loanLimit; initial_value/interval > 0; initial_value = initial_value - interval) {
          getApproval(initial_value, approvedFlag);          
        }

    } // end of testAlternates

    var xhr = $.getJSON('/predict', data)
      .done(function(data){
        // console.log(data);

        testAlternates((data.label === '0'));
        if (data.label === '1') {
          $response.text('Declined!');
          var approvedFlag = false;
        } else {
          $response.text("Approved at " + data.interestRate.toFixed(2) + '%');
          $optimal = $('#optimalField');
          $optimal.text("");
          var approvedFlag = true;
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

