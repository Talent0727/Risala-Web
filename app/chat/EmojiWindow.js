import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../features/chat";

export default function EmojiWindow({emojiSelect, settings, tempEmoji, setTempEmoji}){
    const dispatch = useDispatch();
    const emoji = useSelector((state) => state.chatReducer.value.emoji)
    const [state, setState] = useState('Smileys')
    const [isListening, setIsListening] = useState(false)

    useEffect(() => {
        const chat = document.querySelector('.chat')
        if(emoji && !isListening){
            setIsListening(true)
            chat.addEventListener('click', emojiWindowClick)
        } else if(emoji && isListening){
            chat.removeEventListener('click', emojiWindowClick)
        }

        return(() => {
            if(emoji && isListening){
                chat.removeEventListener('click', emojiWindowClick)
            }
        })
    }, [emoji])

    function emojiWindowClick(e){
        const navbarPopup = document.querySelector('.emoji-window')
        if(navbarPopup){
            if(!navbarPopup.contains(e.target)){
                dispatch(chatReducer({emoji: false}))
            }
        }
    }

    useEffect(() => {
        if(settings && settings === true){
            console.log(settings)
        }

    }, [settings])

    function getEmoji(e){
        setTempEmoji(e.target.textContent)
    }

    //Category selection, populates window depending on the category of emoji that
    //is currently selected
    function select(e){
        if(e.currentTarget.classList[0] === "not-selected"){
            var selected = document.querySelector('.selected')
            selected.classList.remove('selected')
            selected.classList.add('not-selected')
        
            e.currentTarget.classList.remove('not-seelcted')
            e.currentTarget.classList.add('selected')

            setState(e.currentTarget.getAttribute('data-index'))
        }
    }

    return(
        <div className="emoji-window">
            {
                state === "Smileys" &&
                <>
                    <div className="emoji-navbar">
                        <p className="emoji-header">Smiley & People</p>
                    </div>
                    <div className="emoji-window-main">
                        {
                            smileys.map((e, i) => {
                                return(
                                    <div 
                                        className={'emoji'}
                                        onClick={settings ? getEmoji : emojiSelect}
                                        key={i}
                                    >
                                        {e}
                                    </div> 
                                )
                            })
                        }
                    </div>
                </>
            }
            {
                state === "Activity" &&
                <>
                    <div className="emoji-navbar">
                        <p className="emoji-header">Activity</p>
                    </div>
                    <div className="emoji-window-main">
                    {
                        activities.map((e, i) => {
                            return(
                                <div 
                                    className={'emoji'}
                                    onClick={settings ? getEmoji : emojiSelect}
                                    key={i}
                                >
                                    {e}
                                </div> 
                            )
                        })
                    }
                    </div>
                </>
            }
            {
                state === "Animals" &&
                <>
                    <div className="emoji-navbar">
                        <p className="emoji-header">Animals</p>
                    </div>
                    <div className="emoji-window-main">
                        <Animals emojiSelect={settings === true ? getEmoji : emojiSelect}/>
                    </div>
                </>
            }
            {
                state === "Food" &&
                <>
                    <div className="emoji-navbar">
                        <p className="emoji-header">Food</p>
                    </div>
                    <div className="emoji-window-main">
                    {
                        food.map((e, i) => {
                            return(
                                <div 
                                    className={'emoji'}
                                    onClick={settings ? getEmoji : emojiSelect}
                                    key={i}
                                >
                                    {e}
                                </div> 
                            )
                        })
                    }
                    </div>
                </>
            }
            {
                state === "Symbols" &&
                <>
                    <div className="emoji-navbar">
                        <p className="emoji-header">Smiley & People</p>
                    </div>
                    <div className="emoji-window-main">
                        {
                            symbols.map((e, i) => {
                                return(
                                    <div 
                                        className={'emoji'}
                                        onClick={settings ? getEmoji : emojiSelect}
                                        key={i}
                                    >
                                        {e}
                                    </div> 
                                )
                            })
                        }
                    </div>
                </>
            }
            {
                state === "Travel" &&
                <>
                    <div className="emoji-navbar">
                    <p className="emoji-header">Travel & Places</p>
                    </div>
                    <div className="emoji-window-main">
                        {
                            travel.map((e, i) => {
                                return(
                                    <div 
                                        className={'emoji'}
                                        onClick={settings ? getEmoji : emojiSelect}
                                        key={i}
                                    >
                                        {e}
                                    </div> 
                                )
                            })
                        }
                    </div>
                </>
            }
            {
                state === "Objects" &&
                <>
                    <div className="emoji-navbar">
                    <p className="emoji-header">Objects</p>
                    </div>
                    <div className="emoji-window-main">
                        {
                            objects.map((e, i) => {
                                return(
                                    <div 
                                        className={'emoji'}
                                        onClick={settings ? getEmoji : emojiSelect}
                                        key={i}
                                    >
                                        {e}
                                    </div> 
                                )
                            })
                        }
                    </div>
                </>
            }
            {
                state === "Flags" &&
                <>
                    <div className="emoji-navbar">
                    <p className="emoji-header">Flags</p>
                    </div>
                    <div className="emoji-window-main">
                        {
                            flags.map((e, i) => {
                                return(
                                    <div 
                                        className={'emoji'}
                                        onClick={settings ? getEmoji : emojiSelect}
                                        key={i}
                                    >
                                        {e}
                                    </div> 
                                )
                            })
                        }
                    </div>
                </>
            }
            <div className="emoji-navigate">
                <ul className="emoji-ul">
                    <li 
                        className="selected"
                        onClick={select}
                        data-index={'Smileys'}
                    >
                        <i className="material-icons">emoji_emotions</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Animals'}
                    >
                        <i className="material-icons">pets</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Food'}
                    >
                        <i className="material-icons">restaurant</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Activity'}
                    >
                        <i className="material-icons">sports_baseball</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Transport'}
                    ></li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Travel'}
                    >
                        <i className="material-icons">time_to_leave</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Objects'}
                    >
                        <i className="material-icons">emoji_objects</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Symbols'}
                    >
                        <i className="material-icons">emoji_symbols</i>
                    </li>
                    <li 
                        className="not-selected" 
                        onClick={select} 
                        data-index={'Flags'}
                    >
                        <i className="material-icons">flag</i>
                    </li>
                </ul>
            </div>
        </div>
    )
}

function Animals({emojiSelect}){
    return(
        <>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F435;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F412;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A7;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F436;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F415;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9AE;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F415;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F429;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F99D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F431;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F408;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F408;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F981;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F405;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F406;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F434;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40E;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F984;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F993;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9AC;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42E;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F402;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F403;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F404;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F437;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F416;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F417;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F411;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F410;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F999;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F992;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F418;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A3;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F99B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F401;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F400;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F439;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F430;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F407;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9AB;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F994;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F987;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F428;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A5;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A6;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A8;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F998;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A1;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F43E;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F983;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F414;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F413;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F423;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F424;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F425;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F426;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F427;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F54A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F985;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F986;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A2;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F989;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A4;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB6;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A9;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F99A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F99C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F438;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F422;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98E;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F432;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F409;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F995;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F996;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F433;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F42C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9AD;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F420;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F421;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F988;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F419;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41A;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB8;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F40C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F98B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41B;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41C;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41D;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB2;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F41E;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F997;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB3;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F577;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F578;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F982;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F99F;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB0;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1FAB1;</div>
            <div className={'emoji'} onClick={emojiSelect}>&#x1F9A0;</div>
        </>
    )
}

const smileys = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😇', '😉', '😊',  '🙂',  '🙃',  '😋', '😌', '😍', '🥰', '😘','😗', '😙',  '😚',  '🤪',  '😜',  '😝',  '😛',  '🤑',  '😎',  '🤓', '🧐',  '🤠',  '🥳',  '🤡',  '😏',  '😶', '😐', '😑',  '😒',  '🙄',  '🤨',  '🤔',  '🤫',  '🤭', '🤗', '🤥',  '😳',  '😞',  '😟',  '😤',  '😠',  '😡',  '🤬',  '😔',  '😕',  '🙁', '😬',  '🥺',  '😣',  '😖',  '😫',  '😩',  '🥱',  '😪', '😮',  '😱',  '😨',  '😰',  '😥',  '😓',  '😯',  '😦',  '😧',  '😢',  '😭',  '🤤',  '🤩',  '😵', '🥴',  '😲',  '🤯', '🤐',  '😷',  '🤕',  '🤒',  '🤮',  '🤢',  '🤧',  '🥵',  '🥶',  '😶',  '😴',  '💤',  '😈',  '👿',  '👹',  '👺',  '💩',  '👻', '💀', '👽',  '🤖',  '🎃',  '😺',  '😸',  '😹',  '😻',  '😼',  '😽',  '🙀',  '😿',  '😾',  '👐',  '🤲',  '🙌',  '👏',  '🙏',  '🤝',  '👍',  '👎',  '👊',  '✊',  '🤛',  '🤜',  '🤞',  '✌',  '🤘',  '🤟',  '👌',   '🤏',  '👈',  '👉',  '👆',  '👇',  '☝',  '✋',  '🤚',  '🖐',  '🖖',  '👋',  '🤙', '💪',  '🦾',  '🖕', '✍',  '🤳',  '💅',  '🦵',  '🦿',  '🦶',  '👄', '🦷',  '👅',  '👂',  '🦻',  '👃', '👀',  '🧠', '🦴',  '👤',  '👥',  '🗣', '👶',  '👧',  '🧒',  '👦',  '👩',  '🧑',  '👨',  '👩‍🦱',  '🧑',  '👨‍🦱',  '👩‍🦰',  '🧑',  '👨‍🦰',  '👱‍♀️',  '👱',  '👱‍♂️',  '👩‍🦳',  '🧑',  '👨‍🦳',  '👩‍🦲',  '🧑',  '👨‍🦲',  '🧔',  '👵',  '🧓',  '👴',  '👲',  '👳‍♀️',  '👳',  '👳‍♂️',  '🧕',  '👼',  '👸', '🤴',  '👰', '🤵',  '🙇‍♀️',  '🙇',  '💁‍♀️',  '💁‍♂️',  '🙅‍♀️',  '🙅',  '🙅‍♂️',  '🙆‍♀️',  '🙆‍♂️', '🤷',  '🤷‍♂️',  '🙋‍♀️', '🙋‍♂️',  '🤦‍♀️', '🤦‍♂️',  '🧏‍♀️', '🧏‍♂️',  '🙎‍♀️',  '🙎',  '🙎‍♂️',  '🙍‍♀️', '🙍‍♂️', '💇',  '💇‍♂️',  '💆‍♀️', '💆‍♂️',  '🤰', '🤱', '🧎‍♀️',  '🧎',  '🧎‍♂️',  '🧍‍♀️',  '🧍',  '🧍‍♂️',  '💃',  '🕺',  '👫',  '👭',  '👬',  '🧑‍🤝‍🧑',  '👩‍❤️‍👨',  '👩‍❤️‍👩', '👨‍❤️‍👨',  '👩‍❤️‍💋‍👨',  '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨',  '❤',  '🧡',  '💛',  '💚',  '💙',  '💜',  '🤎',  '🖤',  '🤍',  '💔',  '❣',  '💕',  '💞',  '💓',  '💗',  '💖', '💘', '💝', '💟']
const food = ['🍏',  '🍎',  '🍐',  '🍊', '🍋',  '🍌',  '🍉',  '🍇',  '🍓', '🍈', '🍒',  '🍑', '🥭', '🍍', '🥥',  '🥝',  '🍅',  '🥑', '🍆',  '🌶', '🥒',  '🥬',  '🥦',  '🧄',  '🧅',  '🌽',  '🥕',  '🥗',  '🥔',  '🍠',  '🌰',  '🥜', '🍯',  '🍞',  '🥐',  '🥖', '🥨',  '🥯',  '🥞',  '🧇',  '🧀',  '🍗',  '🍖',  '🥩',  '🍤',  '🥚',  '🍳',  '🥓',  '🍔',  '🍟',  '🌭',  '🍕',  '🍝',  '🥪',  '🌮',  '🌯', '🥙',  '🧆',  '🍜',  '🥘',  '🍲', '🥫', '🧂',  '🧈',  '🍥',  '🍣',  '🍱',  '🍛',  '🍙',  '🍚',  '🍘',  '🥟',  '🍢',  '🍡',  '🍧',  '🍨',  '🍦',  '🍰',  '🎂',  '🧁',  '🥧',  '🍮',  '🍭',  '🍬',  '🍫',  '🍿',  '🍩',  '🍪',  '🥠',  '🥮',  '☕',  '🍵', '🥣',  '🍼',  '🥤', '🧃',  '🧉',  '🥛', '🍺',  '🍻',  '🍷',  '🥂',  '🥃',  '🍸',  '🍹',  '🍾',  '🍶',  '🧊',  '🥄', '🍴', '🍽', '🥢', '🥡']
const activities = ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🥏', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🥍', '🥌', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '⛸', '🎿', '🛷', '⛷', '🏂', '🏋️‍♀️', '🏋', '🏋️‍♂️', '🤺', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹', '⛹️‍♂️', '🤾‍♀️', '🤾', '🤾‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🏌️‍♀️', '🏌', '🏌️‍♂️', '🧘‍♀️', '🧘', '🧘‍♂️', '🧖‍♀️', '🧖', '🧖‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🏇', '🚴‍♀️', '🚴', '🚴‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🎽', '🎖', '🏅', '🥇', '🥈', '🥉', '🏆', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '🧩', '♟', '🎯', '🎳', '🪀', '🪁', '🎮', '👾', '🎰', '👮‍♀️', '👮', '👮‍♂️', '👩‍🚒', '👨‍🚒', '👷‍♀️', '👷', '👷‍♂️', '👩‍🏭', '👨‍🏭', '👩‍🔧', '👨‍🔧', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎤', '👨‍🎤', '👩‍🎨', '👨‍🎨', '👩‍🏫', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🔬', '👨‍🔬', '👩‍🚀', '👨‍🚀', '👩‍⚕️', '👨‍⚕️', '👩‍⚖️', '👨‍⚖️', '👩‍✈️',  '👨‍✈️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵', '🕵️‍♂️', '🤶', '🧑‍🎄', '🎅', '🕴️‍♀️', '🕴', '🦸‍♀️', '🦸', '🦸‍♂️', '🦹‍♀️', '🦹', '🦹‍♂️', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🚶‍♀️', '🚶', '🚶‍♂️', '👩‍🦯',  '👨‍🦯', '🏃‍♀️', '🏃', '🏃‍♂️', '👩‍🦼', '👨‍🦼', '👩‍🦽',  '👨‍🦽', '👯‍♀️', '👯', '👯‍♂️', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👦‍👦', '👩‍👧‍👧', '👨‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👦‍👦', '👨‍👧‍👧']
const symbols = ['☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛', '⚕', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '🉑', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '⛔', '📛', '🚫', '❌', '⭕', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '💯', '🔅', '🔆', '🔱', '⚜', '〽', '⚠', '🚸', '🔰', '♻', '🈯', '💹', '❇', '✳', '❎', '✅', '💠', '🌀', '➿', '🌐', '♾', 'Ⓜ', '🏧', '🚾', '♿', '🅿', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚰', '🛗', '🚹', '♂', '🚺', '♀', '⚧', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '🔟', '🔢', '▶', '⏸', '⏯', '⏹', '⏺', '⏏', '⏭', '⏮', '⏩', '⏪', '🔀', '🔁', '🔂', '◀', '🔼', '🔽', '⏫', '⏬', '➡', '⬅', '⬆', '⬇', '↗', '↘', '↙', '↖', '↕', '↔', '🔄', '↪', '↩', '🔃', '⤴', '⤵', '#⃣', '*⃣', 'ℹ', '🔤', '🔡', '🔠', '🔣', '🎵', '🎶', '〰', '➰', '✔', '➕', '➖', '➗', '✖', '🟰', '💲', '💱', '©', '®', '™', '🔚', '🔙', '🔛', '🔝', '🔜', '☑', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼', '◻', '◾', '◽', '▪', '▫', '🔸', '🔹', '🔶', '🔷', '🔺', '🔻', '🔲', '🔳', '🔈', '🔉', '🔊', '🔇', '📣', '📢', '🔔', '🔕', '🃏', '🀄', '♠', '♣', '♥', '♦', '🎴', '🗨', '💭', '🗯', '💬', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
const flags = ['🇦🇫','🇦🇽','🇦🇱','🇩🇿','🇦🇸','🇦🇩','🇦🇴','🇦🇮','🇦🇶','🇦🇬','🇦🇷','🇦🇲','🇦🇼','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇲','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇻','🇧🇷','🇮🇴','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇧🇶','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇽','🇨🇨','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇰','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇼','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇬🇶','🇪🇷','🇪🇪','🇸🇿','🇪🇹','🇫🇰','🇫🇴','🇫🇯','🇫🇮','🇫🇷','🇬🇫','🇵🇫','🇹🇫','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇮','🇬🇷','🇬🇱','🇬🇩','🇬🇵','🇬🇺','🇬🇹','🇬🇬','🇬🇳','🇬🇼','🇬🇾','🇭🇹','🇭🇲','🇭🇳','🇭🇰','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇪','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇰🇵','🇰🇷','🇽🇰','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇴','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭','🇲🇶','🇲🇷','🇲🇺','🇾🇹','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇸','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇷','🇳🇵','🇳🇱','🇳🇨','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇳🇺','🇳🇫','🇲🇰','🇲🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇳','🇵🇱','🇵🇹','🇵🇷','🇶🇦','🇷🇪','🇷🇴','🇷🇺','🇷🇼','🇧🇱','🇸🇭','🇰🇳','🇱🇨','🇲🇫','🇵🇲','🇻🇨','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇽','🇸🇰','🇸🇮','🇸🇧','🇸🇴','🇿🇦','🇬🇸','🇸🇸','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇯','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇰','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇹🇨','🇹🇻','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇲','🇺🇾','🇺🇿','🇻🇺','🇻🇦','🇻🇪','🇻🇳','🇻🇬','🇻🇮','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇼🇫','🇪🇭','🇾🇪','🇿🇲','🇿🇼']
const travel = ['🚣','🗾','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🛝','🎡','🎢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎️','🏍️','🛵','🛺','🚲','🛴','🚏','🛣️','🛤️','⛽','🛞','🚨','🚥','🚦','🚧','⚓','🛟','⛵','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🪐','🌠','🌌','⛱️','🎆','🎇','🎑','💴','💵','💶','💷','🗿','🛂','🛃','🛄','🛅']
const objects = ['💌','⏱️','⏲️','🕳️','💣','🛀','🛌','🔪','🏺','🗺️','🧭','🧱','💈','🦽','🦼','🛢️','🛎️','🧳','⌛','⏳','⌚','⏰','🕰️','🌡️','⛱️','🧨','🎈','🎉','🎊','🎎','🎏','🎐','🧧','🎀','🎁','🤿','🪀','🪁','🔮','🪄','🧿','🪬','🕹️','🧸','🪅','🪆','🖼️','🧵','🪡','🧶','🪢','🛍️','📿','💎','📯','🎙️','🎚️','🎛️','📻','🪕','📱','📲','☎️','📞','📟','📠','🔋','🔌','💻','🖥️','🖨️',' ','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','🎞️','📽️','📺','📷','📸','📹','📼','🔍','🔎','🕯️','💡','🔦','🏮','🪔','📔','📕','📖','📗','📘','📙','📚','📓','📒','📃','📜','📄','📰','🗞️','📑','🔖','🏷️','💰','🪙','💴','💵','💶','💷','💸','💳','🧾','✉️','📧','📨','📩','📤','📥','📦','📫','📪','📬','📭','📮','🗳️','✏️','✒️','🖋️','🖊️','🖌️','🖍️','📝','📁','📂','🗂️','📅','📆','🗒️','🗓️','📇','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🔫','🪃','🛡️','🪚','🔧','🪛','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','🪝','🧰','🧲','🪜','⚗️','🧪','🧫','🧬','🔬','🔭','📡','💉','🩸','💊','🩹','🩼','🩺','🚪','🪞','🪟','🛏️','🛋️','🪑','🚽','🪠','🚿','🛁','🪤','🪒','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🪥','🧽','🧯','🛒','🚬','⚰️','🪦','⚱️','🗿','🪧','🪪','🚰']