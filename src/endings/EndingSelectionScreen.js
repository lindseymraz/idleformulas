import LeaveConfirm from "../LeaveConfirm"

export default function EndingSelectionScreen({state, popup, updateState}) {  
    
    const startEnding = (endingName)=>{
        updateState({name:"startEnding", endingName:endingName})
    }

    const startTrueEnding = ()=>{
        updateState({name:"completeEnding", endingName:"worldselect"}) //Unlocks Milestone
        updateState({name:"startEnding", endingName:"true"})
    }

    const showTrueEnding = state.xValue[0]===Infinity && state.xValue[1]===Infinity && state.xValue[2]===Infinity && state.xValue[3]===Infinity
    const showTrueHint = state.completedEndings["good"] || state.completedEndings["evil"] || state.completedEndings["skipped"]

    return (
        <div style={{position:"absolute", margin:"auto", width:"90%", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>{<>
            <LeaveConfirm saveState={state}/>
            <h3><b>You found the World Formula!<br/><br/>What do you want to do with it?</b></h3><br/>
            <button onClick={()=>startEnding("good")}><b>I want to do GOOD THINGS for the world!</b></button><br/><br/>
            <button onClick={()=>startEnding("evil")}><b>I want to do EVIL THINGS to the world!</b></button><br/><br/>
            {showTrueHint && !showTrueEnding && <><button style={{color:"black"}} disabled={true}><b>? ???? ???? ?? ???? ??????? ?? ???</b></button><br/><br/></>}
            {showTrueEnding && <><button onClick={startTrueEnding}><b>I just want to make NUMBERS GO UP!</b></button><br/><br/></>}
            <button onClick={()=>startEnding("skipped")}>Nothing</button><br/><br/>
            {showTrueHint && !showTrueEnding && <p>Get here with x, x', x'' and x''' all being Infinity to choose the true ending.</p>}
            </>}
        </div>)
}