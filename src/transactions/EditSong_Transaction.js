import jsTPS_Transaction from "../common/jsTPS.js";

export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initKey, initOldTitle, initOldArtist, initOldID, initNewTitle, initNewArtist, initNewID) {
        super();
        this.app = initApp;
        this.key = initKey;
        this.oldTitle = initOldTitle;
        this.oldArtist = initOldArtist;
        this.oldID = initOldID;
        this.newTitle = initNewTitle;
        this.newArtist = initNewArtist;
        this.newID = initNewID;
    }

    doTransaction() {
        // Edit song
        this.app.markSongForEdit(this.key);
        this.app.editSong(this.newTitle, this.newArtist, this.newID);
    }
    
    undoTransaction() {
        this.app.markSongForEdit(this.key);
        this.app.editSong(this.oldTitle, this.oldArtist, this.oldID);
    }
}