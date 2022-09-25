import jsTPS_Transaction from "../common/jsTPS.js";

export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initIndex, initTitle, initArtist, initID, initLength) {
        super();
        this.app = initApp;
        this.songNum = initIndex + 1;
        this.index = initIndex;
        this.title = initTitle;
        this.artist = initArtist;
        this.youTubeId = initID;
        this.listLength = initLength;
    }

    doTransaction() {
        this.app.markSongForDeletion(this.index, false, true);
    }
    
    undoTransaction() {
        this.app.addSong();
        this.app.moveSong(this.listLength , this.songNum);
        this.app.markSongForEdit(this.index, false, true, this.title, this.artist, this.youTubeId);

    }
}