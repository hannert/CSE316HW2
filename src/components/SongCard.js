import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        if(targetId){
            targetId = targetId.substring(target.id.indexOf("-") + 1);
            let sourceId = event.dataTransfer.getData("song");
            sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
            
            this.setState(prevState => ({
                isDragging: false,
                draggedTo: false
            }));

            // ASK THE MODEL TO MOVE THE DATA
            this.props.moveCallback(sourceId, targetId);
        }
        else {
            this.setState(prevState => ({
                isDragging: false,
                draggedTo: false
            }));
        }
    }

    handleDoubleClick = (event) => {
        event.stopPropagation();
        console.log("song doubleclicked! Index of " + (this.props.index - 1));
        this.props.editCallback(this.props.index - 1, true);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    render() {
        const { song, index, deleteCallback} = this.props;
        let num = this.getItemNum();
        let itemClass = "playlister-song unselected-playlister-song"; 
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        return (
            <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onDoubleClick={this.handleDoubleClick}
                draggable="true"
            >
                {num}.
                <a href = {'https://www.youtube.com/watch?v=' + song.youTubeId} draggable='false'>
                    {song.title} by {song.artist}
                </a>
                <input
                    type="button"
                    id={"delete-song-" + index}
                    className="list-card-button"
                    value={"X"} 
                    onClick={() => deleteCallback(index - 1, true)}
                />
            </div>
        )
    }
}