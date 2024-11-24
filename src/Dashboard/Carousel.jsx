import slide_01 from '../assets/slide_01.jpg';
import slide_02 from '../assets/slide_02.jpg';
import slide_03 from '../assets/slide_03.jpg';
import 'bootstrap/dist/css/bootstrap.css';

const Carousel = () => {
    return (


        <div className="container-fluid">
            <div id="myCarousel" className="carousel slide" data-ride="carousel">

                <ol className="carousel-indicators" style={{ marginLeft: '20%' }}>
                    <li data-target="#myCarousel" data-slide-to="0" className="active"></li>
                    <li data-target="#myCarousel" data-slide-to="1"></li>
                    <li data-target="#myCarousel" data-slide-to="2"></li>
                </ol>


                <div className="carousel-inner ">
                    <div className="item active item_img">
                        <img src={slide_01} alt="Los Angeles" />
                    </div>
                    <div className="item item_img">
                        <img src={slide_02} alt="Chicago" />
                    </div>

                    <div className="item item_img">
                        <img src={slide_03} alt="New york" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Carousel;