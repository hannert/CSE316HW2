import React, { Component } from 'react';

export default class EditSongModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title : '',
            artist : '',
            id : ''
        }

        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleArtistChange = this.handleArtistChange.bind(this);
        this.handleIDChange = this.handleIDChange.bind(this);
    }



    handleTitleChange(event) {
        this.setState((prevProps) => ({
            title: event.target.value,
            artist: prevProps.artist,
            id: prevProps.id
        }));
    }
    handleArtistChange(event) {
        this.setState((prevProps) => ({
            title: prevProps.title,
            artist: event.target.value,
            id: prevProps.id
        }));
    }
    handleIDChange(event) {
        this.setState((prevProps) => ({
            title: prevProps.title,
            artist: prevProps.artist,
            id: event.target.value
        }));
    }



    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        if(nextProps != null){
            this.setState({
                title: nextProps.listKeyPair?.title,
                artist: nextProps.listKeyPair?.artist,
                id: nextProps.listKeyPair?.youTubeId
            })
        }
        
    }

    render() {
        const { editSongCallback, hideEditSongModalCallback } = this.props;
        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-edit-song-root'>
                        <div class="modal-north">
                            Edit Song
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                <div class="modal-edit-grid">
                                    <div class="modal-edit-box-text">Title:</div>
                                        <input 
                                            type="text" 
                                            id="edit-song-title-field" 
                                            class="modal-text-submission" 
                                            value={this.state.title || ''}
                                            onChange={this.handleTitleChange}
                                        />
                                    <div class="modal-edit-box-text">Artist:</div>
                                        <input 
                                            type="text" 
                                            id="edit-song-artist-field" 
                                            class="modal-text-submission" 
                                            value={this.state.artist || ''}
                                            onChange={this.handleArtistChange}
                                        />
                                    <div class="modal-edit-box-text">You Tube Id:</div>
                                        <input 
                                            type="text" 
                                            id="edit-song-id-field" 
                                            class="modal-text-submission" 
                                            value={this.state.id || ''}
                                            onChange={this.handleIDChange}
                                        />
                                </div>
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={() => editSongCallback(this.state.title, this.state.artist, this.state.id)}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}