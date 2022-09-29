import React from "react";
import SongCard from './SongCard.js';

export default class PlaylistCards extends React.Component {


    render() {
        const { 
            currentList, 
            moveSongCallback,
            editSongCallback,
            deleteSongCallback } = this.props;
        if (currentList === null) {
            return (
                <div id="playlist-cards"></div>
            )
        }
        else {
            return (
                <div id="playlist-cards">
                    {
                        currentList.songs.map((song, index) => (
                            <SongCard
                                index={index+1}
                                id={'playlist-song-' + (index+1)}
                                key={'playlist-song-' + (index+1)}
                                song={song}
                                moveCallback={moveSongCallback}
                                editCallback={editSongCallback}
                                deleteCallback={deleteSongCallback}
                            />
                        ))
                    }
                </div>
            )
        }
    }
}