import { getGlobalMultiplier } from '../savestate'
import {secondsToHms, reverseGeometric} from '../utilities'


export default function AlphaResearchBar({state, research, updateState}) {
    const startTime = state.researchStartTime[research.id]
    const researchLevel = state.researchLevel[research.id]
    const deltaMilliSeconds = startTime ? Date.now() - startTime : 0
    const progressMultiplier = getGlobalMultiplier(state) * research.getMultiplier(state)
    const progress = progressMultiplier * deltaMilliSeconds / 1000
    const goal = research.durationStart * Math.pow(research.durationBase, researchLevel || 0)
    const remainingTime = Math.max(1, (goal - progress) / progressMultiplier)
    const percentage = Math.min(deltaMilliSeconds / research.minimumDuration, progress / goal)
    const isDone = (!researchLevel || percentage >= 1)
    const leftToMaxx = 2500 - (researchLevel||0)
    const oneSecondBulk = isDone ? reverseGeometric(1, research.durationBase, progressMultiplier / goal) : 0 //Theoretical Research Levels in 1 Second
    const adjustedBulk = oneSecondBulk > getGlobalMultiplier(state) ? Math.pow(oneSecondBulk / getGlobalMultiplier(state), 0.3) * getGlobalMultiplier(state) : oneSecondBulk
    const bulkAmount = isDone ? Math.min(leftToMaxx, Math.floor(adjustedBulk)) : 0
    const progressBarWidth = isDone ? "100%" : Math.min(100 * percentage,99).toFixed(2) + "%"
    var hasResearched = false
    
    const clickResearchBar = ()=>{
      if (isDone && !hasResearched) {
        hasResearched = true
        updateState({name: "startResearch", research: research, bulkAmount: Math.max(bulkAmount, 1)})
      }
    }

    if (!researchLevel && !research.checkUnlock(state))
      return <div style={{position: "relative", color:"#000000", backgroundColor:"#ffffff", border:"2px solid", height:"25px",width:"80%", maxWidth:"320px"}}>
        <div style={{userSelect:"none",whiteSpace:"nowrap",lineHeight:"25px", position:"absolute", left:"50%", transform:"translateX(-50%)"}}><b>{research.lockText}</b>
      </div></div>
    else if (!researchLevel) 
    return <div onClick={clickResearchBar} style={{position: "relative", color:"#000000", backgroundColor:"#ffffff", border:"2px solid", height:"25px",width:"80%", maxWidth:"320px"}}>
      <div style={{userSelect:"none",whiteSpace:"nowrap",lineHeight:"25px",position:"absolute", left:"50%", transform:"translateX(-50%)"}}><b>CLICK TO UNLOCK</b>
    </div></div>

    if (researchLevel >= 2500) {
      return (
        <>
        <div style={{position: "relative", marginBottom:"5px", color:"#000000", backgroundColor:"#ff6666", border:"2px solid", height:"25px",width:"80%", maxWidth:"320px"}}>
          <div style={{backgroundColor:"#ff6666", border:"0px", height:"25px", width:"100%"}}>
            <div style={{userSelect:"none",whiteSpace:"nowrap" ,lineHeight:"25px",position:"absolute", left:"50%", transform:"translateX(-50%)"}}><b>MAXXED</b></div>
          </div>
        </div>
        <div>Level: {researchLevel}</div>
        <div>Bonus: {research.getBonusText(researchLevel,state)}</div>
        <div>Boost: {research.getBoostText(state)}</div>
        {research.checkBoost2(state) && <div>Special: {research.getBoostText2(state)}</div>}
      </>
    )
    } else {
      return (
        <>
        <div onClick={clickResearchBar} style={{position: "relative", marginBottom:"5px", color:"#000000", backgroundColor:"#ffffff", border:"2px solid", height:"25px",width:"80%", maxWidth:"320px"}}>
          <div style={{backgroundColor:"#ff9999", border:"0px", height:"25px", width:progressBarWidth}}>
            <div style={{userSelect:"none",whiteSpace:"nowrap",lineHeight:"25px", position:"absolute", left:"50%", transform:"translateX(-50%)"}}><b>{isDone ? <>RESEARCH {research.id}{bulkAmount > 1 && <>&nbsp;(+{bulkAmount})</>}</> : secondsToHms(Math.ceil(remainingTime))}</b></div>
          </div>
        </div>
        <div>Level: {state.researchLevel[research.id]}</div>
        <div>Bonus: {research.getBonusText(researchLevel,state)}</div>
        <div>Boost: {research.getBoostText(state)}</div>
        {research.checkBoost2(state) && <div>Special: {research.getBoostText2(state)}</div>}
      </>
    )
  }
}