import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { chatReducer } from "../features/chat";

export default function ChatImageCarousel(){
    const dispatch = useDispatch();
    const imageCarousel = useSelector((state) => state.chatReducer.value.imageCarousel)
    const [carouselPosition, setCarouselPosition] = useState(undefined)
    const [clickLeft, setClickLeft] = useState(undefined)
    const [clickRight, setClickRight] = useState(undefined)

    let position;

    useEffect(() => {
        if(imageCarousel){
            position = imageCarousel.images.map(e => e.path).indexOf(imageCarousel.selected)
            setCarouselPosition(position)
        }
    }, [imageCarousel])

    useEffect(() => {
        if(carouselPosition !== undefined && imageCarousel.images.length > 1){
            if(carouselPosition === 0){
                setClickLeft(false)
                setClickRight(true)
            } else if(carouselPosition === (imageCarousel.images.length - 1)){
                setClickLeft(true)
                setClickRight(false)
            } else {
                setClickLeft(true)
                setClickRight(true)
            }

            if(document.querySelector('.nav-image.selected')){
                document.querySelector('.nav-image.selected').classList.remove('selected')
                document.querySelectorAll('.nav-image')[carouselPosition].classList.add('selected')
            }

        } else{
            setClickLeft(false)
            setClickRight(false)
        }

        if(imageCarousel){
            window.addEventListener('keydown', keyBoardNavigation)
        }

        return(() => {
            window.removeEventListener('keydown', keyBoardNavigation)
        })
    }, [carouselPosition, clickLeft, clickRight])

    function clickNav(e){
        if(parseInt(e.currentTarget.getAttribute('data-position')) !== carouselPosition){
            document.querySelector('.nav-image.selected').classList.remove('selected')
            if(!document.querySelector('.nav-image.selected')){
                e.currentTarget.classList.toggle('selected')
            }
            
            setCarouselPosition(parseInt(e.currentTarget.getAttribute('data-position')))
        }
    }

    function close(){
        dispatch(chatReducer({imageCarousel: undefined}))
        setCarouselPosition(undefined)
    }

    function keyBoardNavigation(e){
        if(e.type){
            if(e.key === "ArrowLeft" && clickLeft){
                setCarouselPosition(carouselPosition - 1)
            } else if(e.key === "ArrowRight" && clickRight){
                setCarouselPosition(carouselPosition + 1)
            } else if(e.key === "Escape"){
                close();
            }
        }
    }

    return(
        <>
            {   (imageCarousel && carouselPosition !== undefined) &&
                <div className="background-blocker">
                    <div className="chat-image-carousel">
                        <div className="chat-carousel-header">
                            <div className="navigation">
                                <a className="download nav-icon" href={imageCarousel.images[carouselPosition].path} download>
                                    <i className="material-icons">download</i>
                                </a>
                                <div className="close nav-icon" onClick={close}>
                                    <i className="material-icons">close</i>
                                </div>
                            </div>
                        </div>
                        <div className="chat-carousel-arrows">
                            <div className={clickLeft ? "arrow" : "arrow deactive"} onClick={clickLeft ? (() => {setCarouselPosition(carouselPosition - 1)}) : null}>
                                <i className="material-icons">chevron_left</i>
                            </div>
                            <div className={clickRight ? "arrow" : "arrow deactive"} onClick={clickRight ? (() => {setCarouselPosition(carouselPosition + 1)}) : null}>
                                <i className="material-icons">chevron_right</i>
                            </div>
                        </div>
                        {
                            (carouselPosition !== undefined && imageCarousel) &&
                            <>
                                {
                                    (imageCarousel.images[carouselPosition].type.split('/')[0] === "video") ?
                                    <video className="chat-background">
                                        <source src={imageCarousel.images[carouselPosition].path} />
                                    </video>
                                    :
                                    <div className="chat-background" style={{backgroundImage: `url(${imageCarousel.images[carouselPosition].path})`}}></div>
                                }
                            </>
                        }
                        <div className="chat-carousel-main">
                            {
                                (carouselPosition !== undefined && imageCarousel) &&
                                <>
                                    {
                                        (imageCarousel.images[carouselPosition].type.split('/')[0] === "video") ?
                                        <figure className="video">

                                            <video src={imageCarousel.images[carouselPosition].path} controls/>
                                        </figure>
                                        :
                                        <figure>
                                            <img src={imageCarousel.images[carouselPosition].path}/>
                                        </figure>
                                    }
                                </>
                            }
                        </div>
                        <div className="chat-carousel-nav">
                            {
                                (imageCarousel && imageCarousel.images) &&
                                imageCarousel.images.map((e, i) => {
                                    var type = e.type.split('/')[0]

                                    if(type === "video"){
                                        return(
                                            <figure 
                                                className={i === carouselPosition ? "nav-image selected" : "nav-image"} 
                                                key={i} 
                                                data-src={e.path}
                                                data-position={i}
                                                onClick={clickNav}
                                            >
                                                <video src={e.path}/>
                                            </figure>
                                        )
                                    } else {
                                        return(
                                            <figure 
                                                className={i === carouselPosition ? "nav-image selected" : "nav-image"} 
                                                key={i} 
                                                data-src={e.path}
                                                data-position={i}
                                                onClick={clickNav}
                                            >
                                                <img src={e.path}/>
                                            </figure>
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}