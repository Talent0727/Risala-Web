import removeEmojis from "./removeEmojis";

export default function messageStyler(index, array, sender, senderTime){
    var previousMatch = false;
    var nextMatch = false;

    if(index !== 0 && array[index + 1]){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && !array[index - 1].time_separator && isPreviousEmoji !== ""){
            previousMatch = true;
        }

        if(sender === nextSender && senderTime === nextSenderTime && !array[index + 1].time_separator && isNextEmoji !== ""){
            nextMatch = true;
        }
    } else if(index !== 0){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && !array[index - 1].time_separator && isPreviousEmoji !== ""){
            previousMatch = true;
        }
    } else if(index === 0 && array[index + 1]){
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null
        
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        if(sender === nextSender && senderTime === nextSenderTime && !array[index + 1].time_separator && isNextEmoji !== ""){
            nextMatch = true;
        }
    }

    return [previousMatch, nextMatch]
}