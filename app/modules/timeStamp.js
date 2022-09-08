import getCurrentTime from "./time";

export function timeStamp(value, bool, day_separator){
    var day = value.substring(8, 10)
    var month = value.substring(5, 7)
    var year = value.substring(0, 4)

    var month_string;

    switch (value.substring(5, 7)){
        case '01':
            month_string = "Jan";
            break;
        case '02':
            month_string = "Feb";
            break;
        case '03':
            month_string = "Mar";
            break;
        case '04':
            month_string = "Apr";
            break;
        case '05':
            month_string = "May";
            break;
        case '06':
            month_string = "Jun";
            break;
        case '07':
            month_string = 'Jul';
            break;
        case '08':
            month_string = 'Aug';
            break;
        case '09':
            month_string = "Sep";
            break;
        case '10':
            month_string = "Oct";
            break;
        case '11':
            month_string = "Nov";
            break;
        case '12':
            month_string = "Dec";
            break;
    }

    var hour_minute = value.substring(11, 16)
    var day_time = `${value.substring(8,10)} ${month_string}`

    var day2 = getCurrentTime().substring(8, 10)
    var month2 = getCurrentTime().substring(5, 7)
    var year2 = getCurrentTime().substring(0, 4)

    if(bool === true){
        return hour_minute
    } else if(bool === false && (day_separator === undefined || day_separator === false)){
        if(year === year2){
            if(month === month2){
                if(day === day2){
                    return hour_minute
                }
                return day_time
            } else {
                if(day === day2){
                    return hour_minute
                }
                return day_time
            }
        } else {
            //Year does not match
            return `${day}/${month}/${year}`
        }
    } else if(bool === false && day_separator === true){
        return day_time
    }
}