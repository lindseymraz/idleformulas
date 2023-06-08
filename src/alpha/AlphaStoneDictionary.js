import {getChallengeBonus} from '../savestate'
import {countAlphaUpgrades} from './AlphaUpgradeTab'

export const startingStones = {
    "WorldFormula":{
        id: "WorldFormula",
        title: "World Formula",
        description: <>Find the World Formula</>, //Unlocks after changing destiny
        check: (state=>(state.completedEndings.good || state.completedEndings.evil || state.completedEndings.skipped || state.completedEndings.true)),
    },
    "BadEndings":{
        id: "BadEndings",
        title: "Breaking Maths",
        description: <>Reach three distinct Bad Endings</>,
        check: (state=>(state.badEndingCount >= 3)),
    },
    "StartingValue":{
        id: "StartingValue",
        title: "Stone Skipper",
        description: <>Reach exactly s<sub>x</sub>=60</>,
        tooltip: "Reach exactly sx=60",
        check: (state=>(state.startingStoneX === 60)),
    },
    "Googol":{
        id: "Googol",
        title: "Googol",
        description: <>&alpha;-Reset with x=1e100 or more</>,
        check: (state=>(state.xHighScores[3] >= 1e100)),
    },
    "Timewall":{
        id: "Timewall",
        title: "Timewall ",
        description: <>&alpha;-Reset while having at least four billion Alpha and x=1e110</>,
        check: (state=>state.clearedTimewall),
    },
    "AllChallenges":{
        id: "AllChallenges",
        title: "Challenger",
        description: <>Complete all Challenges</>,
        check: (state)=>(getChallengeBonus(state).full >= 13),
    },
    "VeryAlpha":{
        id: "VeryAlpha",
        title: "Mighty Million",
        description: <>Reach a million Alpha</>,
        check: (state=>(state.alpha >= 1e6)),
    },
    "MaxResearch":{
        id: "MaxResearch",
        title: "Ultimate Scientist",
        description: <>Get all Research Bars to Level 2500</>,
        check: (state)=>(state.researchLevel["x"] >= 2500 && state.researchLevel["x'"] >= 2500 && state.researchLevel["x''"] >= 2500 && state.researchLevel["x'''"] >= 2500),
    },
    "AllUpgrades":{
        id: "AllUpgrades",
        title: "Upgrade Complete",
        description: <>Buy everything on the Alpha Upgrades Tab</>,
        check: (state)=>(countAlphaUpgrades(state)>=12 && state.autoApplyLevel >= 2 && state.baseAlphaLevel >= 12),
    },
}

export const stoneTable = [["BadEndings","WorldFormula","VeryAlpha"],["AllChallenges","Timewall","Googol"],["MaxResearch","StartingValue","AllUpgrades"]]
export const stoneList = ["BadEndings","WorldFormula","VeryAlpha","AllChallenges","Timewall","Googol","MaxResearch","StartingValue","AllUpgrades"]
export default stoneTable