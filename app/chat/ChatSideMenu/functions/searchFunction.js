

export default function searchFunction(searchString, chats, USER_DATA){
    var chatMatches = []

    chats.forEach((conversation, index, array) => {
        // Get the ID
        let conversationID = conversation.id

        // Create the scoring object
        let searchObject = {
            id: conversation.id,
            score: 0
        }

        // Retrieve all names, nicknames and alias that are SEARCHABLE
        let nameArray = []

        // Members
        let members = conversation.members.filter(e => e.id !== USER_DATA.account_id)

        // Create an array for firstname, and lastname for each member (if applicable)
        if(members.length === 1){
            nameArray = [...nameArray, [members[0].firstname, members[0].lastname]]
        } else if(members.length > 1) {
            members.forEach((userObject) => {
                nameArray = [...nameArray, [userObject.firstname, userObject.lastname]]
            })
        }
        nameArray = Array.from(new Set(nameArray.map(JSON.stringify)), JSON.parse)

        // Alias
        let alias = conversation.alias ? conversation.alias : null

        // Nickname
        let nicknames = conversation.nicknames ? JSON.parse(conversation.nicknames) : null
        nicknames = nicknames ? nicknames.map(e => e.nickname) : null


        // Get the score
        var score = scoreMatcher(nameArray, alias, nicknames, searchString)

        // Was there a match? Then add it to chatMatches array
        if(score > 0){
            // Add a score key to the object, which we will sort the array on
            var newConversation = {...conversation, score: score}
            chatMatches = [...chatMatches, newConversation]
        }
    })

    chatMatches.sort((a, b) => a.score < b.score ? 1 : -1)
    return chatMatches
}

function scoreMatcher(nameArray, alias, nicknames, searchString){
    let score = 0;
    let searchStringWithSpace;

    // searchString has space
    if(searchString.indexOf(' ') >= 0){
        searchStringWithSpace = searchString.split(' ')
    }

    nameArray.forEach((name, index) => {
        name.forEach((subName, index) => {
            var nameScore = stringSearcher(subName, searchStringWithSpace ? searchStringWithSpace[index] : searchString)
            score = score + nameScore
        })
    })


    if(alias){
        // Has space
        if(alias.indexOf(' ') >= 0){
            let newAlias = alias.split(' ')
            newAlias.forEach((substring, index) => {
                var aliasScore = stringSearcher(substring, searchStringWithSpace ? searchStringWithSpace[index] : searchString)
                score = score + aliasScore
            })
        } else {
            var aliasScore = stringSearcher(alias, searchString)
            score = score + aliasScore
        }
    }

    if(nicknames){
        if(nicknames.indexOf(' ') >= 0){
            let newAlias = nicknames.split(' ')
            newAlias.forEach((substring, index) => {
                var nicknameScore = stringSearcher(substring, searchStringWithSpace ? searchStringWithSpace[index] : searchString)
                score = score + nicknameScore
            })
        } else if(nicknames.length > 1){
            nicknames.forEach((substring, index) => {
                var nicknameScore = stringSearcher(substring, searchStringWithSpace ? searchStringWithSpace[index] : searchString)
                score = score + nicknameScore
            })
        } else {
            var nicknameScore = stringSearcher(nicknames[0], searchString)
            score = score + nicknameScore
        }
    }

    return score
}

function stringSearcher(substring, searchSubstring){
    let score = 0;

    if(substring && searchSubstring){
        for (let i = 0; i < substring.length; i++) {
            if(substring[i] && searchSubstring[i]){
                if(substring[i].toLowerCase() === searchSubstring[i].toLowerCase()){
                    score++
                } else {
                    score --
                }
            }
        }
    }

    score = score < 0 ? 0 : score
    return score;
}