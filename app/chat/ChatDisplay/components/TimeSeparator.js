import React from "react";
import useLocale from "../../../hooks/useLocale";

export default function TimeSeparator({value, current_id}){
    const locale = useLocale()

    var month_string = undefined;
    if(locale === "en"){
        switch (value.timestamp.substring(5,7)){
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
    } else {
        switch (value.timestamp.substring(5,7)){
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
                month_string = "Maj";
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
                month_string = "Okt";
                break;
            case '11':
                month_string = "Nov";
                break;
            case '12':
                month_string = "Dec";
                break;
        }
    }

    //Actual timeseparator
    return(
        <>
            <li 
                className="separator" 
                message_id={value.message_id} 
                current-id={current_id}
            >
                {value.timestamp.substring(8,10) + ' ' + month_string}
            </li>
        </>
    )
}