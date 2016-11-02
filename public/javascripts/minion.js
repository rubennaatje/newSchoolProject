/**
 * Created by ruben on 04-Oct-16.
 */
$(document).ready(function () {
    var priceList = {1:100,2:45,3:60,4:30,5:80};
    $('#ticketselect').change(function () {
        console.log(priceList[$('#ticketselect').val()]);
        $('#moneyy').html(priceList[$('#ticketselect').val()]);
        $('#ticketSoort').val($('#ticketselect').val());
    });


    $('#aantalTicketsInput').change(function () {
        var test = priceList[$('#ticketSoortInput').val()];
        var test2 = parseInt(test);
        var test3 = parseInt($('#aantalTicketsInput').val());
        var sum = test3 * test2;
        if($('#checkboxDinner').is( ":checked" )) {
            sum = sum + 3 * test3
        }
        if($('#checkboxLunch').is( ":checked" )) {
            sum = sum + 6 * test3
        }
        $('#moneyy').html(sum);
    });
    $('#memes').change(function () {
        var test = priceList[$('#ticketSoortInput').val()];
        var test2 = parseInt(test);
        var test3 = parseInt($('#aantalTicketsInput').val());
        var sum = test3 * test2;
        if($('#checkboxDinner').is( ":checked" )) {
            sum = sum + 3 * test3
        }
        if($('#checkboxLunch').is( ":checked" )) {
            sum = sum + 6 * test3
        }
        $('#moneyy').html(sum);
    });
    console.log(JSON.stringify(rijen));

    for (var i = 0; i < rijen.length; i++){
        var status = rijen[i].status;
        var naam = rijen[i].naam;
        var idRow = rijen[i].tijdZaalNummer.substring(0,2);
        var idColumn = rijen[i].tijdZaalNummer.substring(2,3);
        var usedTd = "#tr"+idRow + "> .td"+idColumn;
        if(status === 3) {
            $(usedTd).css("background-color", "red");
            $(usedTd).html("bezet door: " +naam);
        }
        else if(status === 2){
            $(usedTd).css("background-color", "orange");
            $(usedTd).html("onder voorbehoud door: " +naam);
        }

    }
});