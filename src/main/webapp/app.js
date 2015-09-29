$(document).ready(function(){
  $response = $('#responseField');

  function predict() {
    var data = {};

    $('input').each(function(){
      var $field = $(this);
      data[$field.attr('data-column')] = $field.val();
    });

    $('select').each(function(){
      var $field = $(this);
      data[$field.attr('data-column')] = $field.val();
    });

    var xhr = $.getJSON('/predict', data)
      .done(function(data){
        console.log(data);
        if(data.label === '1') {
          $response.text(data.interestRate.toFixed(2) + '%');
        } else {
          $response.text('Declined!');
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

  updatePrediction();

});

