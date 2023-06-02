import React from "react";

//Tries to save the game right before the tab is closed
class LeaveConfirm extends React.Component{
  constructor(props){
    super(props);
    this.onUnload = this.onUnload.bind(this)
  }

  onUnload(e){
    debugger
    if (this.props.saveState.currentEnding)
        e.preventDefault()
  }

  render(){
    return undefined
  }

  componentDidMount(){
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount(){
    window.removeEventListener("beforeunload", this.onUnload);
  }
}
 
export default LeaveConfirm;