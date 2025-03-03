export function ImageContainer({ noteImages, controller: [prevImage, nextImage, offset]}: any) {
    return (
        <div className="carousel-container" id="note-image-container">
            <div className="carousel-wrapper" style={{transform: `translateX(${-offset * 100}%)`}}>
                {noteImages?.map((imageLink: string, index: number) => {
                    return <div className="carousel-slide" key={index}>
                        <div className="carousel-content">
                            <span className="note-page-number">{index + 1}</span>
                            <img src={imageLink} className="image-links" />
                        </div>
                    </div>
                })}
            </div>

            <button onClick={() => prevImage()} data-tippy-content="Left Arrow (←)" className="carousel-control prev">
                <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                </svg>
            </button>
            <button onClick={() => nextImage()} data-tippy-content="Right Arrow (→)" className="carousel-control next">
                <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M51.3971 38.1667H0.667969V29.8334H51.3971L28.0638 6.50002L34.0013 0.666687L67.3346 34L34.0013 67.3334L28.0638 61.5L51.3971 38.1667Z" fill="#1D1B20"/>
                </svg>      
            </button>
        </div>
    )
}