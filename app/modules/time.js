export default function getCurrentTime(delay){

    var date = new Date();
    var year = date.getFullYear();
    var month = leadingZeroFixer(date.getMonth() + 1);
    var day = leadingZeroFixer(date.getDate())
    var hours = leadingZeroFixer(date.getHours());
    var minutes = leadingZeroFixer(date.getMinutes());
    if(delay){
        var seconds = leadingZeroFixer(date.getSeconds() + 2);
    } else {
        var seconds = leadingZeroFixer(date.getSeconds());
    }
    

    function leadingZeroFixer(value){
        if(value < 10){
            var leadingZero = `0${value}`;
            return leadingZero;
        }
        else{
            return value;
        }
    }

    var fullDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return fullDate;
}