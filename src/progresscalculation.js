import { constellationPrices } from './destiny/DestinyConstellationDictionary'
import formulaList from './formulas/FormulaDictionary'
import { getGlobalMultiplier } from './savestate'
import { notify } from './utilities'

export const applyFormulaToState = (state, formula, forceApply, silent, multiApply)=>{
    if (!formula) return false

    let applyNeed = formula.applyNeed
    let applyCost = formula.applyCost
    if (state.activeChallenges.SMALLINV && !state.anyFormulaUsed) {
        applyCost = 0
        applyNeed = 0
    } else if (state.alphaUpgrades.FREF) {
        applyCost = 0
        applyNeed = formula.applyNeed + formula.applyCost
    }

    //Can't afford or not yet unlocked
    if ((!formula.isBasic && (state.xValue[0] < applyCost || state.xValue[0] < applyNeed)) || !state.formulaUnlocked[formula.formulaName])
        return false

    //Apply Limit reached
    if ((state.activeChallenges.LIMITED && state.formulaApplyCount >= 100) || (state.activeChallenges.SINGLEUSE && state.formulaUsed[formula.formulaName]))
        return false

    const newValue = formula.applyFormula(state.formulaEfficiency[formula.targetLevel], state.xValue, state)

    const actuallyApply = () => {
        const deductCost = applyCost > 0 && !state.alphaUpgrades.FREF && state.xValue[formula.targetLevel] !== newValue
        const maxApplyTimes = deductCost ? state.xValue[0] / applyCost : Infinity 
        const limitActive = state.activeChallenges.LIMITED || state.activeChallenges.SINGLEUSE
        const applyTimes = (multiApply && !formula.isStatic && !limitActive) ? Math.floor(Math.min(getGlobalMultiplier(state), maxApplyTimes)) : 1
        const efficiency = state.formulaEfficiency[formula.targetLevel] * applyTimes
        state.xValue[formula.targetLevel] = formula.applyFormula(efficiency, state.xValue, state)
        if (state.activeChallenges.RESETOTHER) {
            state.xValue = state.xValue.map((v,i)=>(i === formula.targetLevel ? v : 0))
        }
        state.formulaUsed[formula.formulaName] = true
        state.anyFormulaUsed = true
        state.formulaApplyCount++
        if (deductCost) { //Cost only deducted if value changes, cost should not push beneath zero
            state.xValue[0] = Math.max(state.xValue[0] - applyCost * applyTimes, 0)
        }
    }

    //Would break maths
    if (isNaN(newValue)) {
        if (silent) {
            return false
        } else if (newValue && newValue.error) { //Expected Error
            state.currentEnding = newValue.error
            return false
        } else { //Infinity Error or Unexpected Error, defaults to Infinity Ending
            state.currentEnding = "infinite"
            return false
        }
    }

    //Would lower the value
    if (isNaN(newValue) || 0.9999 * state.xValue[formula.targetLevel] > newValue) {
        if (silent)
            return false;

        switch (state.settings.valueReduction) {
            case "ON":
                if (!forceApply && !state.decreaseCooldown) {
                    return false
                } else {
                    state.decreaseCooldown = true
                }
                break;
            case "WARNING":
                if (!forceApply) {
                    notify.warning("Value would be reduced", "Shift+Click if this is intentional")
                    return false
                }
                break;
            case "PREVENT":
                if (!forceApply)
                    return false
                break;
            case "NEVER":
                return false
            case "OFF":
                break;
            default:
                return false
        }
    }
    actuallyApply()
    return state.xValue[0] >= applyCost && state.xValue[0] >= applyNeed
}

export const applyIdleProgress = (state, deltaMilliSeconds) => {
    const intervalCount = 12
    const intervalSize = deltaMilliSeconds / intervalCount *0.98
    for (let i = 0; i < intervalCount; i++) {
        state = simulateOfflineProgress(state, intervalSize)
    }
    return state
}

export const autoApply = (state) => {
    for (let i = 0; i<5; i++) {
        if (state.autoApply[i] && state.myFormulas.length > i) {
            applyFormulaToState(state,formulaList[state.myFormulas[i]],false, true)
        }
    }
    return state
}

export const autoApplySingle = (state, index) => {
    if (state.autoApply[index] && state.myFormulas.length > index) {
        applyFormulaToState(state,formulaList[state.myFormulas[index]],false, true)
    }
    return state
}

export const applyProduction = (state, deltaMilliSeconds, applierBonus = [0,0,0,0,0,0]) => {
    const integrationFactor = [1,1,1/2,1/6,1/24,1/120,1/720] //one over factorial
    const productionBonus = state.productionBonus
    const challengeMultiplier = state.activeChallenges.SLOWPROD ? 0.01 : 1
    for(let j=0; j<state.xValue.length; j++) { //tier to be calculated
        let multiplier = 1
        for(let k=j+1; k<applierBonus.length; k++) { //higher tiers that affect it
            state.xValue[j]+= Math.pow(deltaMilliSeconds / 1000, k-j)  * multiplier * ((productionBonus[k-1]||1) * (state.xValue[k]||0) + state.autoApplyRate * applierBonus[k]) * integrationFactor[k-j]
            multiplier *= challengeMultiplier * (productionBonus[k-1]||1)
        }
    }
    return state
}

export const getStarLightRate = (state)=>{
    return state.lightAdder * Math.pow(2,state.lightDoubler) * Math.pow(state.destinyStars, state.lightRaiser)
}

export const generateStarLight = (state, deltaMilliSeconds) => {
    if (deltaMilliSeconds < 10)
        return
    if (isNaN(state.starLight)) {
        console.log("Starlight became NaN")
        state.starlight = 0
    }
    state.starLight += deltaMilliSeconds / 1000 * getStarLightRate(state)
    state.starLight = Math.min(state.starLight,constellationPrices[state.constellationCount])
}

export const simulateOfflineProgress = (state, deltaMilliSeconds) => {
    // STEP 1: Auto Apply Once
    if (state.alphaUpgrades.AAPP)
        state = autoApply(state)

    // STEP 2: Linearly Approximate Auto Appliers
    let applierBonus = [0,0,0,0,0,0]
    let activeAppliers = 0
    if (state.alphaUpgrades.OAPP) {
        for (let index = 0; index < state.myFormulas.length; index++) {
            if (!state.autoApply[index] || formulaList[state.myFormulas[index]].offlineDisabled) //Formula too difficult for offline calculation
                continue;
            let isActive = 0
            state = autoApplySingle(state,index)
            const xBefore = [...state.xValue]
            state = autoApplySingle(state,index)
            for (let i = 0; i<4; i++) {
                applierBonus[i+1] += state.xValue[i] - xBefore[i]
                isActive ||= state.xValue[i] - xBefore[i]
            }
            if (isActive)
                activeAppliers++
        }
    }
    state.formulaApplyCount += Math.floor(activeAppliers * state.autoApplyRate * (deltaMilliSeconds - 300) / 1000)

    // STEP 3: Calculate Production
    state = applyProduction(state, (deltaMilliSeconds - 300) * getGlobalMultiplier(state), applierBonus.map((v)=>(v || 0)))
 
    return state
}