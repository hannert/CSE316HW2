import React from "react";

export default class EditToolbar extends React.Component {

    // constructor (props) {
    //     super(props);

    //     this.undoFunction = this.undoFunction.bind(this);

    // }

    // undoFunction(event) {
    //     if(event.ctrlKey && event.key === 'z') {
    //         if(this.props.canUndo === true){
    //             console.log("I can UNDO!!!")
    //             this.props.undoCallback();
    //         }
                
    //     }
    // }

    // componentDidMount(){
    //     document.addEventListener('keydown', this.undoFunction, false);
    // }

    render() {
        const { disabled, canAddSong, canUndo, canRedo, canClose, 
                addCallback, undoCallback, redoCallback, closeCallback} = this.props;
        let addSongClass = "toolbar-button";
        let undoClass = "toolbar-button";
        let redoClass = "toolbar-button";
        let closeClass = "toolbar-button";
        
        
        if (disabled) {
            addSongClass += " disabled"
            undoClass += " disabled"
            redoClass += " disabled"
            closeClass += " disabled"
        }
        else {
            if (canAddSong) addSongClass += " disabled";
            if (!canUndo) undoClass += " disabled";
            if (!canRedo) redoClass += " disabled";
            if (canClose) closeClass += " disabled";
        }

        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                className={addSongClass}
                onClick={addCallback}
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                className={undoClass} 
                onClick={undoCallback}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                className={redoClass} 
                onClick={redoCallback}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                className={closeClass} 
                onClick={closeCallback}
            />
        </div>
        )
    }
}