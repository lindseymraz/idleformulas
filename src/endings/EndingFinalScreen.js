import { useState } from 'react'
import { getGlobalMultiplier } from '../savestate'
import LeaveConfirm from '../LeaveConfirm'

export default function EndingFinalScreen({state, action, popup, updateState, children}) {
    const [ startTime , ] = useState(Date.now())
    const buttonsVisible = action.instaDestiny || (getGlobalMultiplier(state)*(Date.now() - startTime) > 10000)
    const changeDestiny=()=>{
        updateState({name:"completeEnding",endingName:action.endingName})
    }
    const alternativeDestiny=()=>{
        updateState({name:"completeEnding",endingName:action.endingName})
        updateState({name:"startEnding",endingName:action.endingName2})
    }

    return (
        <div style={{position:"absolute", margin:"auto", top:"20%", left:"50%", transform:"translate(-50%,-20%)", textAlign:"center"}}>{<>
            <LeaveConfirm saveState={state}/>
            <h1 style={{fontSize:"50px"}}>{action.title}</h1>
            <p style={{fontSize:"14px"}}>{action.quoteText}<br/>{action.quoteAuthor}</p><br/><br/>
            <div style={{fontSize:"20px"}}>{action.storyText}</div>
            <br/><br/><br/><br/>
            <p><b>{action.headerText}</b></p>
            <button onClick={changeDestiny} className="fbutton" style={{visibility:!buttonsVisible ? "hidden":undefined, width:"250px"}} ><b>{action.buttonText || "CHANGE YOUR DESTINY"}</b></button>
            <br/><br/><button onClick={alternativeDestiny} style={{visibility:!buttonsVisible || !action.buttonText2 ? "hidden":undefined, width:"200px"}}>{action.buttonText2}</button>
            </>}
        </div>)
}