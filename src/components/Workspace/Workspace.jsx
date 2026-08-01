import {useState} from "react";

import SlideViewer from "../SlideViewer/SlideViewer";
import ExplanationPanel from "../ExplanationPanel/ExplanationPanel";
import SqlEditor from "../SqlEditor/SqlEditor";

import "./Workspace.css";


function Workspace(){


const [activeWindow,setActiveWindow] = useState("slide");


return(

<div className="workspace">


<div className="buttons">


<button onClick={()=>setActiveWindow("slide")}>
Slide
</button>


<button onClick={()=>setActiveWindow("explanation")}>
Explanation
</button>


<button onClick={()=>setActiveWindow("sql")}>
SQL
</button>


</div>



<div className="content">


{
activeWindow==="slide" &&

<SlideViewer/>

}



{
activeWindow==="explanation" &&

<ExplanationPanel/>

}



{
activeWindow==="sql" &&

<SqlEditor/>

}



</div>


</div>

);


}


export default Workspace;