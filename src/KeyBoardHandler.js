import Hotkeys from 'react-hot-keys';
import formulaList from './formulas/FormulaDictionary';

export default function KeyBoardHandler({state, updateState, popup}) {

    if (popup?.popupState?.visible) return undefined

    const hotkeyApplyFormulaDown = (keyName, e, handle) => {
        const index = keyName.replace("num_", "") - 1
        if (index >= state.myFormulas.length) return

        const formula = formulaList[state.myFormulas[index]]
        if (e.repeat) {
            updateState({name: "changeHold", newValue:{type:"ApplyFormula", formulaName:formula.formulaName, delay: state.holdAction ? Math.min(state.holdAction.delay !== undefined ? state.holdAction.delay : 1) : 2, temp: 10}})
        } else {
            if (!state.decreaseCooldown && state.settings.valueReduction === "ON" && 0.9999 * state.xValue[formula.targetLevel] > formula.applyFormula(state.formulaEfficiency[formula.targetLevel],state.xValue, state)) {
                popup.confirm(<>Applying this formula will reduce the value. Are you sure?<br/>If you confirm, this pop-up gets disabled until your next Reset.</>,()=>{
                    updateState({name: "applyFormula", formula: formula, updateState: updateState, forceApply: true})
                })
            } else {
                updateState({name: "applyFormula", formula: formula, updateState: updateState, forceApply: e.shiftKey})
            }
        }
    }

    const hotkeyApplyFormulaUp = (keyName, e, handle) => {
        updateState({name:"changeHold", newValue:null})
    }

    const hotkeyBasicReset = (keyName, e, handle) => {
        updateState({name:"resetXValues"})
    }

    const hotkeyXReset = (keyName, e, handle) => {
        updateState({name:"upgradeXTier"})
    }

    const hotkeyAlphaReset = (keyName, e, handle) => {
        if (state.progressionLayer < 1) return
        updateState({name:"alphaReset", isAbort: false})
    }

    const hotkeyToggleAuto = (keyName, e, handle) => {
        updateState({name:"toggleAutoApply", all:true})
    }

    const hotkeyAbortRun = (keyName, e, handle) => {
        if (state.progressionLayer < 1) return
        updateState({name:"alphaReset", isAbort: true})
    }

    const hotkeyResearchAll = (keyName, e, handle) => {
        if (state.progressionLayer < 1 || state.mailsCompleted["ResearchAll"] === undefined) return
        const showNotification = (state.selectedTabKey !== "AlphaScreen" || state.selectedAlphaTabKey !== "AlphaResearchTab")
        updateState({name:"researchAll", showNotification: showNotification})
    }

    return <>
        <Hotkeys keyName="1,2,3,4,5,num_1,num_2,num_3,num_4,num_5" disabled={state.settings.hotkeyApplyFormula === "OFF"} onKeyDown={hotkeyApplyFormulaDown} onKeyUp={hotkeyApplyFormulaUp} allowRepeat={true}/>
        <Hotkeys keyName="b" disabled={state.settings.hotkeyBasicReset === "OFF"} onKeyDown={hotkeyBasicReset}/>
        <Hotkeys keyName="x" disabled={state.settings.hotkeyXReset === "OFF"} onKeyDown={hotkeyXReset}/>
        <Hotkeys keyName="a" disabled={state.settings.hotkeyAlphaReset === "OFF"} onKeyDown={hotkeyAlphaReset}/>
        <Hotkeys keyName="t" disabled={state.settings.hotkeyToggleAuto === "OFF"} onKeyDown={hotkeyToggleAuto}/>
        <Hotkeys keyName="c" disabled={state.settings.hotkeyAbortRun === "OFF"} onKeyDown={hotkeyAbortRun}/>
        <Hotkeys keyName="r" disabled={state.settings.hotkeyResearchAll === "OFF"} onKeyDown={hotkeyResearchAll}/>
    </>


}