import { constellationPrices } from "./DestinyConstellationDictionary"
import '../App.css';

export default function DestinyConstellationButton({state, popup, constellation, updateState}) {
    
    if (!state.starConstellations[constellation.id] && state.starLight < constellationPrices[state.constellationCount]) return constellation.fixed

    const clickConstellation = ()=>{
        if (!state.starConstellations[constellation.id]) {
            popup.confirm(<>Use all Starlight and sacrifice all Starlight Upgrades to complete the {constellation.title} Constellation?</>,()=>{
                console.log("Clicked on" + constellation.title)
                updateState({name: "completeConstellation", constellation: constellation})
            })
        }
    }

    const disabled = state.starConstellations[constellation.id]

    const buttonStyle={
        background: "none",
        border: "none",
        color: state.starConstellations[constellation.id] ? "#ffff66" : "#333333",
        fontSize:"48px",
        padding:"10px", 
        cursor: state.starConstellations[constellation.id] ? undefined : "pointer",
    }

    return (<>
        <button className="astrodot" onClick={clickConstellation} title={constellation.title} style={buttonStyle} disabled={disabled}>{constellation.symbol}</button>
        </>)

}