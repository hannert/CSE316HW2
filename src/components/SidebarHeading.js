import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback } = this.props;
        createNewListCallback();
    };
    render() {
        let name = "toolbar-button"
        console.log(this.props)
        if (this.props.disabled) 
            name += " disabled"
        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={name} 
                    onClick={this.handleClick}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}