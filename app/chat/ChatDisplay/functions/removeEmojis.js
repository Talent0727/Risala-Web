export default function removeEmojis(str = ""){
    var emojiRE = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    return str.replace(emojiRE, '')
}