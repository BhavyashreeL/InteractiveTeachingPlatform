import { useState } from "react";
import "./SlideViewer.css";
import dbmsSlides from "../../data/unit1/dbmsSlides.js";


function SlideViewer() {

const [currentSlide, setCurrentSlide] = useState(0);


const nextSlide = () => {

    if(currentSlide < dbmsSlides.length - 1)
    {
        setCurrentSlide(currentSlide + 1);
    }

};


const previousSlide = () => {

    if(currentSlide > 0)
    {
        setCurrentSlide(currentSlide - 1);
    }

};


return (

<div className="slide-container">


<div className="slide-box">

<img
src={dbmsSlides[currentSlide]}
alt="DBMS Slide"
/>

</div>


<div className="navigation">


<button onClick={previousSlide}>
Previous
</button>


<span>
{currentSlide + 1} / {dbmsSlides.length}
</span>


<button onClick={nextSlide}>
Next
</button>


</div>


</div>

);

}

export default SlideViewer;