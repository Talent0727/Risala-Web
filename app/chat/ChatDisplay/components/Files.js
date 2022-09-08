import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import fileSizeFormatter from '../../../modules/fileSizeFormatter'

export default function Files({ value, filePath, recieved, fileReply, reply }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)

    //Styled components for Aspect Ratios
    const oneToOne = { maxWidth: '200px', maxHeight: '200px'}
    const sixteenToNine = { maxWidth: '364px', maxHeigth: '201px'}
    const nineToSixteen = { maxWidth: '201px', maxHeigth: '364px'}

    function fileClick(e){
        dispatch(chatReducer({
            imageCarousel: {
                images: filesAndMedia.images,
                selected: e
            }
        }))
    }

    if(value.text === ""){
        return(
            <>
                {   (!fileReply && filePath) &&
                    filePath.map((value, index) => {
                        
                        var type = value.type.split('/')[0]
                        //The file is an image
                        if(type === "image" || type === "video"){

                            var style;
                            var width = value.dimensions[0]
                            var heigth = value.dimensions[1]
                            var aspectRatio = width/heigth
                    
                            if(aspectRatio > 1.7 && aspectRatio < 1.8){ //16:9
                                style = sixteenToNine
                            } else if(aspectRatio === 1){
                                style = oneToOne
                            } else {
                                style = nineToSixteen
                            }

                            if(type === "image"){
                                if(window.location.hostname === "localhost"){
                                    return(
                                        <>
                                            <figure 
                                                key={value.path + index + 'not-reply'}
                                                onClick={(() => { fileClick(value.path) })}
                                                style={style}
                                            >
                                                <img src={`../${value.path.substring(3)}`}/>
                                            </figure>
                                        </>
                                    )
                                } else {
                                    return(
                                        <>
                                            <figure 
                                                key={value.path + index + 'not-reply'} 
                                                style={style}
                                                onClick={(() => { fileClick(value.path) })}
                                            >
                                                <img src={`https://risala.codenoury.se/${value.path.substring(3)}`}/>
                                            </figure>
                                        </>
                                    )
                                }
                            } else {
                                if(window.location.hostname === "localhost"){
                                    return(
                                        <>
                                            <figure
                                                className="video" 
                                                key={value.path + index + 'not-reply'} 
                                                style={style}
                                                onClick={(() => { fileClick(value.path) })}
                                            >
                                                <video src={value.path} controls/>
                                            </figure>
                                        </>
                                    )
                                } else {
                                    return(
                                        <>
                                            <figure
                                                className="video" 
                                                key={value.path + index + 'not-reply'} 
                                                style={style}
                                                onClick={(() => { fileClick(value.path) })}
                                            >
                                                <video src={`https://risala.codenoury.se/${value.path.substring(3)}`} controls />
                                            </figure>
                                        </>
                                    )
                                }
                            }
                        } else {
                            
                            var fileSize = fileSizeFormatter(value.size, 2)

                            //The file is a file or a non-image, treat it as a file
                            if(window.location.hostname === "localhost"){
                                return(
                                    <>
                                        <a 
                                            className="file-wrapper" 
                                            href={`../${value.path.substring(3)}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title={value.path}
                                            key={value.path + index + 'not-reply'} 
                                        >
                                            <i className="material-icons">description</i>
                                            <div className="file-description">
                                                <span>{value.path.substring(21)}</span>
                                                <span>{fileSize}</span>
                                            </div>
                                        </a>
                                    </>
                                )
                            } else{
                                return(
                                    <>
                                        <a 
                                            className="file-wrapper" 
                                            href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                            target="_blank" rel="noopener noreferrer" 
                                            title={value.name}
                                            key={value.path + index + 'not-reply'} 
                                        >
                                            <i className="material-icons">description</i>
                                            <div className="file-description">
                                                <span>{value.path.substring(21)}</span>
                                                <span>{fileSize}</span>
                                            </div>
                                        </a>
                                    </>
                                )
                            }

                        }
                    })
                }
                {
                    (fileReply && filePath) &&
                    filePath.map((value, index) => {
                        try {
                            var fileObject = filesAndMedia.files.find(e => e.path === value)
                        } catch {
                            var fileObject = current.files.files.find(e => e.path === value)
                        }
                        var fileSize = fileSizeFormatter(fileObject.size, 2)
                        return(
                            fileObject &&
                            <>
                                <a 
                                    className="file-wrapper" 
                                    href={`https://risala.codenoury.se/${fileObject.path.substring(3)}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    title={fileObject.path}
                                    key={fileObject.path + 'file-reply'}
                                >
                                    <i className="material-icons">description</i>
                                    <div className="file-description">
                                        <span>{fileObject.path.substring(21)}</span>
                                        <span>{fileSize}</span>
                                    </div>
                                </a>
                            </>
                        )
                    })
                }
            </>
        )
    } else {
        return(
            <div className="file-message">
                <div className="files">
                {
                    (!fileReply && filePath) &&
                    filePath.map((value, index) => {
                        
                        var type = value.type.split('/')[0]
                        //The file is an image
                        if(type === "image" || type === "video"){

                            var style;
                            var width = value.dimensions[0]
                            var heigth = value.dimensions[1]
                            var aspectRatio = width/heigth
                    
                            if(aspectRatio > 1.7 && aspectRatio < 1.8){ //16:9
                                style = sixteenToNine
                            } else if(aspectRatio === 1){
                                style = oneToOne
                            } else {
                                style = nineToSixteen
                            }

                            if(type === "image"){
                                if(window.location.hostname === "localhost"){
                                    return(
                                        <>
                                            <figure 
                                                key={value.path} 
                                                onClick={(() => { fileClick(value.path) })}
                                                style={style}
                                            >
                                                <img src={`../${value.path.substring(3)}`}/>
                                            </figure>
                                        </>
                                    )
                                } else {
                                    return(
                                        <>
                                            <figure 
                                                key={value.path} 
                                                onClick={(() => { fileClick(value.path) })}
                                                style={style}
                                            >
                                                <img src={`https://risala.codenoury.se/${value.path.substring(3)}`}/>
                                            </figure>
                                        </>
                                    )
                                }
                            } else {
                                if(window.location.hostname === "localhost"){
                                
                                    return(
                                        <>
                                            <figure
                                                className="video" 
                                                key={value.path}
                                                onClick={(() => { fileClick(value.path) })}
                                                style={style}
                                            >
                                                <video src={`../${value.path.substring(3)}`} controls />
                                            </figure>
                                        </>
                                    )
                                } else {
                                    return(
                                        <>
                                            <figure
                                                className="video" 
                                                key={value.path} 
                                                onClick={(() => { fileClick(value.path) })}
                                                style={style}
                                            >
                                                <video src={`https://risa.codenoury.se/${value.path.substring(3)}`} controls/>
                                            </figure>
                                        </>
                                    )
                                }
                            }
                        } else {
                            var fileSize = fileSizeFormatter(value.size, 2)
                            //The file is a file or a non-image, treat it as a file
                            if(window.location.hostname === "localhost"){
                                return(
                                    <>
                                        <a 
                                            className="file-wrapper" 
                                            href={`../${value.path.substring(3)}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            title={value.name}
                                            key={value.path}
                                        >
                                            <i className="material-icons">description</i>
                                            <div className="file-description">
                                                <span>{value.path.substring(21)}</span>
                                                <span>{fileSize}</span>
                                            </div>
                                        </a>
                                    </>
                                )
                            } else{
                                return(
                                    <>
                                        <a 
                                            className="file-wrapper" 
                                            href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                            target="_blank" rel="noopener noreferrer" 
                                            title={value.name}
                                            key={value.path}
                                        >
                                            <i className="material-icons">description</i>
                                            <div className="file-description">
                                                <span>{value.path.substring(21)}</span>
                                                <span>{fileSize}</span>
                                            </div>
                                        </a>
                                    </>
                                )
                            }

                        }
                    })
                }
                {
                    (fileReply && filePath) &&
                    filePath.map((value, index) => {

                        try {
                            var fileObject = filesAndMedia.files.find(e => e.path === value)
                        } catch {
                            var fileObject = current.files.files.find(e => e.path === value)
                        }
                        
                        var fileSize = fileSizeFormatter(fileObject.size, 2)
                        return(
                            fileObject &&
                            <>
                                <a 
                                    className="file-wrapper" 
                                    href={`https://risala.codenoury.se/${fileObject.path.substring(3)}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    title={fileObject.path}
                                    key={fileObject.path}
                                >
                                    <i className="material-icons">description</i>
                                    <div className="file-description">
                                        <span>{fileObject.path.substring(21)}</span>
                                        <span>{fileSize}</span>
                                    </div>
                                </a>
                            </>
                        )
                    })
                }
                </div>
                {
                    !fileReply &&
                    <div className="message" style={!recieved ? {backgroundColor: chat_settings.color} : null}>
                        {value.text}
                    </div>
                }
            </div>
        )
    }
}