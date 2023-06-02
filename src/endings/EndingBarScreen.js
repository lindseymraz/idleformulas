import { useState } from 'react'
import { getGlobalMultiplier } from '../savestate'

import {endingList} from './EndingDictionary'
import EndingFinalScreen from './EndingFinalScreen'
import LeaveConfirm from '../LeaveConfirm'

export default function EndingBarScreen({state, popup, updateState}) {
    const [ oldEnding, updateOldEnding] = useState(0)
    const [ actionNumber , setActionNumber ] = useState(0)
    const ending = endingList[state.currentEnding]
    if (oldEnding !== state.currentEnding) {
        setActionNumber(0)
        updateOldEnding(state.currentEnding)
    }
    const currentAction = ending.actions[actionNumber] || ending.actions[0]
    const [currencyAmount, setCurrencyAmount] = useState(0)
    const [generatorAmounts, setGeneratorAmounts] = useState({})
    const [repetitionAmount, setRepetitionAmount] = useState(0)
    const [ headerText , setHeaderText ] = useState(currentAction.headerText)
    const [ startTime , setStartTime ] = useState(0)
    const [ lastUpdateTime , setLastUpdateTime ] = useState(Date.now())

    const deltaMilliSeconds = startTime ? Date.now() - startTime : 0
    const goal = 1000 * currentAction.durationSeconds
    const percentage = getGlobalMultiplier(state) * deltaMilliSeconds / goal
    const isDone = (currentAction.finishOnClick || percentage >= 1)

    if (currentAction.final) {
        return <EndingFinalScreen state={state} action={currentAction} updateState={updateState} popup={popup}/>
    }

    let hesitancePercentage = percentage
    if (currentAction.hesitance) {
        if (percentage < 0.8)
            hesitancePercentage = percentage
        else if (percentage < 0.975)
            hesitancePercentage = 0.8
        else
            hesitancePercentage = 0.8 + 8*(percentage - 0.975)
    }
    const progressBarWidth = isDone ? "100%" : Math.min(101 * hesitancePercentage,100).toFixed() + "%"
    
    const currencyPerSecond = ending.generators ? ending.generators.reduce((a,v)=>(a+(generatorAmounts[v.title]||0) * v.production),0) : 0
    const cpsMultiplier = Math.max(0,Math.min(1, 1.49 - 1.5 * currencyAmount / ending.currencyGoal))
    const generatorMultiplier = ending.generatorDecay ? cpsMultiplier : 1
    const deltaUpdate = Date.now() - lastUpdateTime
    let newCurrencyAmount = currencyAmount
    if (deltaUpdate > 100 && !ending.valueBased) {
        setLastUpdateTime(Date.now())
        newCurrencyAmount += cpsMultiplier*(deltaUpdate * currencyPerSecond / 1000)
    }

    if (startTime && isDone){
        if (ending.valueBased) {
            newCurrencyAmount = currentAction.getValue ? currentAction.getValue(repetitionAmount+1) : newCurrencyAmount
        } else {
            newCurrencyAmount = currencyAmount + (currentAction.progress || 0)
        }
        setRepetitionAmount(repetitionAmount + 1)
        if (currentAction.split) {
            newCurrencyAmount = Math.floor(currencyAmount + (ending.currencyGoal - currencyAmount) / currentAction.split)
        }

        setStartTime(0)
        if (currentAction.generator){
            generatorAmounts[currentAction.generator] = (generatorAmounts[currentAction.generator] || 0) + 1
            setGeneratorAmounts(generatorAmounts)
        }

        if (repetitionAmount >= (currentAction.repeat || 0) && (!currentAction.requirement || newCurrencyAmount >= currentAction.requirement)) {
            const nextAction = ending.actions[actionNumber + 1]
            const newHeaderText = nextAction.headerText
            if (newHeaderText && newHeaderText !== headerText)
                setHeaderText(newHeaderText)
            setRepetitionAmount(0)
            setActionNumber(actionNumber + 1)
        }
    }

    if (newCurrencyAmount !== currencyAmount)
        setCurrencyAmount(newCurrencyAmount)

    const clickProgressBar = ()=>{
        if (currentAction.finishOnClick) {
            updateState({name:"completeEnding", endingName:currentAction.endingName})
            return
        }
        if (!startTime)
            setStartTime(Date.now())
    }

    return (
        <div style={{position:"absolute", margin:"auto", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>{<>
            <LeaveConfirm saveState={state}/>
            <p><b>{headerText}</b></p><br/>
            {(currencyAmount > 0 || currencyAmount.length > 0) && <p>{ending.currencyName}{ending.ascending === -1 ? Math.ceil(ending.currencyGoal - currencyAmount) : currencyAmount}</p>}<br/>
            <div onClick={clickProgressBar} style={{position: "relative", margin:"auto", color: "#000000", backgroundColor:"#ffffff", border:"2px solid", height:"25px",width:"300px"}}>
                <div style={{backgroundColor:currentAction.barColor || "#aaaaaa", border:"0px", height:"25px", width:progressBarWidth}}>
                    <div style={{userSelect:"none",whiteSpace:"nowrap",lineHeight:"25px",position:"absolute", left:"50%", transform:"translateX(-50%)"}}><b>{currentAction.title}</b></div>
                </div>
            </div><br/><br/>
            {ending.generators.map((generator)=>
                <div style={{visibility: generatorAmounts[generator.title] !== undefined ? undefined : "hidden"}}key={generator.title}>{generator.title}: {Math.ceil(generatorAmounts[generator.title] * generatorMultiplier)}<br/></div>
            )}
            <div style={{visibility: currencyPerSecond ? undefined : "hidden"}}>Total {ending.productionName}: {(currencyPerSecond * cpsMultiplier).toFixed(2)}<br/></div>
            </>}
        </div>)
}