import {formatNumber} from '../utilities'
import AlphaUpgradeTab from './AlphaUpgradeTab'
import AlphaResearchTab from './AlphaResearchTab'
import AlphaChallengeTab from './AlphaChallengeTab'
import AlphaStonesTab from './AlphaStonesTab'
import TabContent from '../TabContent'

export default function AlphaScreen({state, popup, updateState, setTotalClicks}) {
      
const setAlphaTab = (tabKey)=>{
    updateState({name: "selectAlphaTab", tabKey: tabKey})
}

return (
    <div style={{color:"#ff7777"}}>
        {<h3 style={{fontSize: "32px", marginLeft: "20px", marginTop:"10px", marginBottom:"20px", textAlign:"left"}}>&alpha;&nbsp;=&nbsp;{formatNumber(state.alpha, state.settings.numberFormat,3)}</h3>}
        <button style={{marginLeft: "20px"}} onClick={()=>setAlphaTab("AlphaUpgradeTab")}>Upgrades</button>&nbsp;
        {state.mailsCompleted["Research"] !== undefined && <><button onClick={()=>setAlphaTab("AlphaResearchTab")}>Research</button>&nbsp;</>} 
        {state.mailsCompleted["Challenges"] !== undefined && <><button onClick={()=>setAlphaTab("AlphaChallengeTab")}>Challenges</button>&nbsp;</>}
        {(state.mailsCompleted["Stones"] !== undefined || state.mailsCompleted["MythicalStones"] !== undefined) && <button onClick={()=>setAlphaTab("AlphaStonesTab")}>Stones</button>}
        <TabContent selectedTabKey={state.selectedAlphaTabKey}>
            <AlphaUpgradeTab tabKey="AlphaUpgradeTab" popup={popup} state={state} updateState={updateState} setTotalClicks={setTotalClicks}/>
            <AlphaResearchTab tabKey="AlphaResearchTab" popup={popup} state={state} updateState={updateState} setTotalClicks={setTotalClicks}/>
            <AlphaChallengeTab tabKey="AlphaChallengeTab" popup={popup} state={state} updateState={updateState} setTotalClicks={setTotalClicks}/>
            <AlphaStonesTab tabKey="AlphaStonesTab" popup={popup} state={state} updateState={updateState} setTotalClicks={setTotalClicks}/>
        </TabContent>
    </div>)
}