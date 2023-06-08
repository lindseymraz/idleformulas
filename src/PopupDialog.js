import Modal from 'simple-react-modal'
import Hotkeys from 'react-hot-keys'

export const makeShowPopup = (popupState, setPopupState) => {
    return {
        show: (text, options, callback, outerClose, showInput)=>{
            setPopupState({text: text, options: options, callback: callback, visible: true, outerClose})
        },
        prompt: (text, placeholder, options, callback, outerClose)=>{
            setPopupState({text: text, options: options, callback: callback, visible: true, outerClose, showInput:true, inputText:"", inputPlaceholder:placeholder})
        },
        alert: (text, callback, skip, outerClose)=>{
            if (skip) {
                callback?.("CLOSE")
                return
            }
            setPopupState({text: text, options: ["CLOSE"], callback: callback, visible: true, outerClose})
        },
        confirm: (text, callback, skip, outerClose)=>{
            if (skip) {
                callback?.("YES")
                return
            }
            const mycallback = (option)=>(option==="YES" && callback(option))
            setPopupState({text: text, options: ["YES","NO"], callback: mycallback, visible: true, outerClose})
        },
        discard: ()=>{
            setPopupState({text: "", options: [], callback: ()=>true, visible:false})
        },
        popupState: popupState,
    } 
}

export function PopupDialog({popupState, setPopupState, discardable}) {
    const closePopup = (option) => {
        const oldPopupState = {...popupState}
        setPopupState({text: "", options: [], callback: ()=>true, visible:false})
        oldPopupState.callback?.(option, oldPopupState) //Callback must be invoked after resetting popup, so a new popup can be shown
    }

    const changeInputText = (e)=>{
        setPopupState({...popupState, inputText: e.target.value})
    }

    // return (<Modal>Test</Modal>)

    return (
        <Modal
            style={{}}
            closeOnOuterClick={!!popupState.outerClose}
            containerStyle={{position: "absolute", left: "50%", top: "30%", transform: "translate(-50%, -50%)", background: 'lightgray', color: 'black', border: "4px solid #666666", textAlign: "center", fontWeight: "bold", width:"max-content", maxWidth:"80%"}}
            show={popupState.visible}
            onClose={(evt)=>{setPopupState({...popupState, visible:false})}}
            >
            <Hotkeys keyName="Escape" disabled={!discardable} onKeyDown={()=>{setPopupState({text: "", options: [], callback: ()=>true, visible:false})}}/>
            <p>{popupState.text}</p>
            {popupState.showInput && <div><textarea cols="30" rows="4" style={{resize:"none"}} placeholder={popupState.inputPlaceholder} value={popupState.inputText} onChange={changeInputText}/></div>}
            {popupState.options.map(option=>
                <button key={option} onClick={()=>closePopup(option)} style={{padding:"2px 10px 2px 10px", margin:"10px", fontWeight:"bold"}}>{option}</button>
            )}
        </Modal>
    )
}