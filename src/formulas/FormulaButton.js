import {spaces,formatNumber} from '../utilities'
import formulaList from './FormulaDictionary'
import {getInventorySize} from '../savestate'

export const isLockedByChallenge = (state, formula)=>((state.activeChallenges.SIMPLEONLY && formula.complex) || 
    (state.activeChallenges.COMPLEX && !formula.complex && !formula.isBasic) ||
    (state.activeChallenges.NEWONLY && formula.effectLevel !== state.highestXTier))

export const getUnlockMultiplier = (formula, state)=>{
    let unlockMultiplier = 1
    let effectLevel = formula.effectLevel || formula.targetLevel

    if (formula.isBasic) {
        unlockMultiplier = 1
    } else {
        if (effectLevel < 1 && state.highestXTier >= 1) {
            unlockMultiplier *= 4
        }
        if (effectLevel < 2 && state.highestXTier >= 2) {
            unlockMultiplier *= 12
        }
        if (effectLevel < 3 && state.highestXTier >= 3) {
            unlockMultiplier *= 8000
        }
    }
    return unlockMultiplier
}

export default function FormulaButton({state, popup, updateState, setTotalClicks, formulaName, context, myIndex}) {
    const applyFormula = (formula,evt)=>{
        if (!state.decreaseCooldown && state.settings.valueReduction === "ON" && 0.9999 * state.xValue[formula.targetLevel] > formula.applyFormula(state.formulaEfficiency[formula.targetLevel],state.xValue, state)) {
            popup.confirm(<>Applying this formula will reduce the value. Are you sure?<br/>If you confirm, this pop-up gets disabled until your next Reset.</>,()=>{
                state.decreaseCooldown = true
                state.holdAction = null
                state.isHolding = false
                updateState({name: "applyFormula", formula: formula, updateState: updateState, forceApply: true})
                setTotalClicks((x)=>x+1)
            })
        } else {
            updateState({name: "applyFormula", formula: formula, updateState: updateState, forceApply: evt.shiftKey})
            setTotalClicks((x)=>x+1)
        }
    }

    const unlockFormula = (formula)=>{
        updateState({name: "unlockFormula", formula: formula})
        setTotalClicks((x)=>x+1)
    }

    const getFormula = (formula)=>{
        updateState({name: "getFormula", formula: formula})
        setTotalClicks((x)=>x+1)
    }

    const discardFormula = (formula)=>{
        updateState({name: "discardFormula", formula: formula})
        setTotalClicks((x)=>x+1)
    }

    var formula = formulaList[formulaName]

    const toggleAutoApply = (event)=>{
        event.preventDefault()
        updateState({name:"toggleAutoApply", index:myIndex})
    }

    if (!formula) { //--- BUTTON
        return ( 
            <tr>{state.alphaUpgrades.AAPP && <td><input onClick={toggleAutoApply} disabled={state.activeChallenges.FULLYIDLE} style={{transform:"scale(1.2)"}} type="checkbox" checked={state.autoApply[myIndex]} readOnly></input></td>}
                <td align="left" className="block" style={{width:"auto"}}>
                <button className="fbutton" style={{backgroundColor:"#ffffff", height: "40px"}} disabled={true}>-------</button>
            </td><td>
            </td><td>
            </td>
            </tr>
        )
    } 

    let lockedByChallenge = isLockedByChallenge(state, formula)
    let applyNeed = formula.applyNeed
    let applyCost = formula.applyCost
    if (state.activeChallenges.SMALLINV && !state.anyFormulaUsed && state.formulaBought[formula.formulaName]) {
        applyCost = 0
        applyNeed = 0
    } else if (state.alphaUpgrades.FREF) {
        applyCost = 0
        applyNeed = formula.applyNeed + formula.applyCost
    }
    var tooltip = applyCost >= applyNeed ? (state.alphaUpgrades.FREF ? "Need":"Cost") + ": x=" + formatNumber(applyCost, state.settings.numberFormat) : "Need: x=" + formatNumber(applyNeed, state.settings.numberFormat)
    const delimiter = state.settings.shopPrices ? " / " : "\n"
    var tooltipplus = tooltip + (formula && formula.explanation ? delimiter + formula.explanation : "")

    const freeFormulas = ["x+1","x'=1","x'=1","x'=1"]
    formula.isFree = formula.formulaName === freeFormulas[state.highestXTier]

    if (!formula.effectLevel) {
        formula.effectLevel = formula.targetLevel
    }

    let buttonColor = "#ffffff"
    let buttonBoldness = "normal"
    let buttonItalicity = "normal"
    if (state.shopFavorites[state.highestXTier][formula.formulaName] === 1) {
        buttonBoldness = "bold"
    }
    if (state.shopFavorites[state.highestXTier][formula.formulaName] === -1) {
        buttonItalicity = "italic"
    }
    if (applyNeed <= state.xValue[0] && applyCost <= state.xValue[0]) {
        buttonColor = "#CCFFCC"
        if (context === "my" && state.xValue[formula.targetLevel] >= 0 && formula.applyFormula(state.formulaEfficiency[formula.targetLevel], state.xValue, state) > 1.05 * state.xValue[formula.targetLevel]) {
            buttonColor = "#99FF99" //Dark Green if +5% with one application
        }
    }


    formula.unlockMultiplier = getUnlockMultiplier(formula,state)
    if (formula.isBasic)
    {
        tooltip = "Basic Formula"
        tooltipplus = "Basic Formula"
    }

    if (formula.numberFormat !== state.settings.numberFormat)
        formula.description =  formula.descriptions?.[state.settings.numberFormat] || formula.description

    const mouseHandler = (e)=>{
        switch(e.type){
        case "mousedown":
        case "touchstart":
            updateState({name:"changeHold", newValue:{type:"ApplyFormula", formulaName:formula.formulaName, delay: 5}})
            break
        case "mouseup":
        case "mouseleave":
        case "touchend":
            if (state.holdAction && (state.holdAction.formulaName===formula.formulaName)){
                updateState({name:"changeHold", newValue:null})
            }
            break
        default:
            console.error("Unexpected mouse event " + e.type)
        }

    }
    const moveFormulaUp = (e)=>{
        updateState({name:"swapFormulas", formulaName:formula.formulaName, isDownward:false})
    }
    const moveFormulaDown = (e)=>{
        updateState({name:"swapFormulas", formulaName:formula.formulaName, isDownward:true})
    }
    const changeFavorite = (e)=>{
        updateState({name:"changeFavorite", formulaName:formula.formulaName, tier:state.highestXTier})
    }

    if (context === "my") { //APPLY BUTTON
        return (
            <tr>{state.alphaUpgrades.AAPP && <td><input onClick={toggleAutoApply} disabled={state.activeChallenges.FULLYIDLE} style={{transform:"scale(1.2)"}} type="checkbox" checked={state.autoApply[myIndex]} readOnly></input></td>}
                <td align="left" className="block" style={{width:"auto"}}>
                <button className="fbutton" title={tooltipplus} style={{backgroundColor: buttonColor, minHeight: "40px"}}
                    disabled={lockedByChallenge || state.activeChallenges.FULLYIDLE || !state.formulaUnlocked[formulaName] || (applyNeed && state.xValue[0] < applyNeed) || (applyCost && state.xValue[0] < applyCost)}
                    onClick={(evt)=>applyFormula(formula,evt)} onMouseDown={mouseHandler} onMouseUp={mouseHandler} onMouseLeave={mouseHandler} onTouchStart={mouseHandler} onTouchEnd={mouseHandler} onTouchCancel={mouseHandler}>
                    {formula.description}
                </button>
            </td><td>
                {!state.formulaUnlocked[formulaName] && lockedByChallenge && <>&nbsp;Locked</> }
                {!state.formulaUnlocked[formulaName] && !lockedByChallenge && <>&nbsp;Unlock: x={formatNumber(formula.unlockCost * formula.unlockMultiplier, state.settings.numberFormat)}</> }
                {state.formulaUnlocked[formulaName] && !!applyCost && state.xValue[0] < applyCost && <>&nbsp;{state.alphaUpgrades.FREF ? "Need":"Cost"}: x={formatNumber(applyCost, state.settings.numberFormat)}</> }
                {state.formulaUnlocked[formulaName] && !!applyNeed && state.xValue[0] < applyNeed && <>&nbsp;Need: x={formatNumber(applyNeed, state.settings.numberFormat)}</>}
                {state.formulaUnlocked[formulaName] && state.xValue[0] >= applyNeed && state.xValue[0] >= applyCost && !state.formulaUsed[formulaName] && <>&nbsp;Click to apply!</>}
                {!state.formulaUsed[formulaName] && <span style={{display:"inline-block"}}>&nbsp;&nbsp;<button disabled={state.activeChallenges.FULLYIDLE} 
                    onClick={()=>discardFormula(formula)}>
                    Unequip
                </button>&nbsp;<button onClick={moveFormulaUp} disabled={state.activeChallenges.FULLYIDLE}>&nbsp;&#708;&nbsp;</button>&nbsp;<button onClick={moveFormulaDown} disabled={state.activeChallenges.FULLYIDLE}>&nbsp;&#709;&nbsp;</button></span>}
            {/* </td><td> */}
            </td>
            <td align="left" className="block" style={{width:"auto"}}></td>
            </tr>
        )
    } else if (lockedByChallenge) { //LOCKED BY CHALLENGE (=>HIDDEN)
        return undefined
    } else if (formula.effectLevel > state.highestXTier || formula.targetLevel > state.highestXTier) { //Not available in Shop
        return undefined;
    } else if (state.settings.shopFilter === "EDIT" && state.mailsCompleted["Favorites"] !== undefined) { //Edit Formula Display Type
        return (
            <tr><td align="left" className="block" style={{width:"auto"}}>
                <button title={tooltipplus} className="fbutton" style={{backgroundColor: buttonColor, fontWeight: buttonBoldness, fontStyle: buttonItalicity}}
                    onClick={()=>changeFavorite(formula)} onMouseDown={(e)=>{e.preventDefault()}}>
                    {formula.description}
                </button>
            </td><td>
                {spaces()}
            </td><td>
                {state.shopFavorites[state.highestXTier][formula.formulaName] === 1 && <b>Favorite</b>}
                {state.shopFavorites[state.highestXTier][formula.formulaName] === -1 && <i>Hidden</i>}
            </td></tr>
        )
    } else if (state.formulaBought[formulaName]) { //EQUIPPED
        return (
            <tr><td align="left" className="block" style={{width:"auto"}}>
                <button disabled={true} className="fbutton" style={{backgroundColor: "#CCFFCC"}}>
                    EQUIPPED
                </button>
            </td><td>
                {spaces()}
            </td><td>
                {state.settings.shopPrices === "ON" && tooltip}
            </td></tr>
        )
    } else if (state.formulaUnlocked[formulaName]) { //GET BUTTON
        return (
            <tr><td align="left" className="block" style={{width:"auto"}}>
                <button title={tooltipplus} className="fbutton" style={{backgroundColor: buttonColor, fontWeight: buttonBoldness, fontStyle: buttonItalicity}}
                    disabled={state.activeChallenges.FULLYIDLE || state.myFormulas.length >= getInventorySize(state)}
                    onClick={()=>getFormula(formula)} onMouseDown={(e)=>{e.preventDefault()}}>
                    GET {formula.description}
                </button>
            </td><td>
                {spaces()}
            </td><td>
                {state.settings.shopPrices === "ON" && tooltip}
            </td></tr>
        )
    } else { //UNLOCK BUTTON
        return (
            <tr><td align="left" className="block" style={{"width":"auto"}}>
                <button className="fbutton" style={{backgroundColor: "#ffffff", fontWeight: buttonBoldness, fontStyle: buttonItalicity}} title={tooltipplus}
                    disabled={state.activeChallenges.FULLYIDLE || (state.xValue[0] < formula.unlockCost * formula.unlockMultiplier && !formula.isFree)}
                    onClick={()=>unlockFormula(formula)} onMouseDown={(e)=>{e.preventDefault()}}>
                    UNLOCK {formula.description}
                </button>
            </td><td>
                {spaces()}
            </td><td>
                {!formula.isFree ? <>Unlock{state.alphaUpgrades.AUNL ? "s" : ""} {state.alphaUpgrades.AUNL ? "at" : "for" } x={formatNumber(formula.unlockCost * formula.unlockMultiplier, state.settings.numberFormat)}</> : <>First formula is free!!!</>}
            </td></tr>
        )
    }
}