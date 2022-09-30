import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import jsTPS from './common/jsTPS.js';
import DBManager from './db/DBManager';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import DeleteSongModal from './components/DeleteSongModal';
import EditSongModal from './components/EditSongModal';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import AddSong_Transaction from './transactions/AddSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';
import EditSong_Transaction from './transactions/EditSong_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            listKeyPairMarkedForEdit : null,
            indexMarkedForDeletion : null,
            currentList : null,
            activeModal : false,
            sessionData : loadedSessionData
        }

        this.undoHelper = this.undoHelper.bind(this);
        this.redoHelper = this.redoHelper.bind(this);

    }
    undoHelper(event) {
        if((event.ctrlKey || event.metaKey) && event.key === 'z') {
            if(this.tps.hasTransactionToUndo() === true){
                console.log("I can UNDO!!!")
                this.undo();
                this.forceUpdate();
            }
                
        }
    }

    redoHelper(event) {
        if((event.ctrlKey || event.metaKey) && event.key === 'y') {
            if(this.tps.hasTransactionToRedo() === true){
                console.log("Redo")
                this.redo();
                this.forceUpdate();
            }
        }
    }

    componentDidMount(){
        document.addEventListener('keydown', this.undoHelper, false);
        document.addEventListener('keydown', this.redoHelper, false);
    }

    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;
        

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList: newList,
            activeModal: prevState.activeModal,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList: newCurrentList,
            activeModal: prevState.activeModal,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList: prevState.currentList,  // ! ---------------
            activeModal: prevState.activeModal,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        this.tps.clearAllTransactions();
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList: newCurrentList,
            activeModal: prevState.activeModal,
            sessionData: this.state.sessionData
        }));
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList: null,
            activeModal: prevState.activeModal,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }


    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            currentList : list,
            activeModal: prevState.activeModal,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        console.log("move " + start + " " + end)
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    editSong = (newTitle, newArtist, newID) => {
        console.log(this.state.listKeyPairMarkedForEdit)
        console.log(newTitle + newArtist + newID)
        let currentList = this.state.currentList;
        let songToEdit = currentList?.songs[this.state.listKeyPairMarkedForEdit];
        console.log('edit song ' + songToEdit)
        if (songToEdit != null){
            console.log(songToEdit)
            songToEdit.title = newTitle;
            songToEdit.artist = newArtist;
            songToEdit.youTubeId = newID;
            // Set state to guarantee a re-render with the new song info
            this.setState((prevState) => ({
                currentList: prevState.currentList,
                listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
                listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
                sessionData: prevState.sessionData
            }), 
                this.db.mutationUpdateList(currentList))
        }
        this.hideEditSongModal();
    }
    markSongForEdit = (index, prompt, now = false, newTitle = '', newArtist = '', newID = '') => {

        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : index,
            activeModal : prevState.activeModal,
            sessionData: prevState.sessionData
        }), () => {
            if (prompt)
                // PROMPT THE USER
                this.showEditSongModal();
            if (now) {
                this.editSong(newTitle, newArtist, newID);
            }
        });
    }
    showEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : true,
            sessionData: prevState.sessionData
        }))
    }
    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : false,
            sessionData: prevState.sessionData
        }))
    }
    addEditSongTransaction = (newTitle, newArtist, newID) => {
        let key = this.state.listKeyPairMarkedForEdit;
        let oldTitle = this.state.currentList?.songs[key].title;
        let oldArtist = this.state.currentList?.songs[key].artist;
        let oldID = this.state.currentList?.songs[key].youTubeId;

        let transaction = new EditSong_Transaction(this, key, oldTitle, oldArtist, oldID, newTitle, newArtist, newID);
        this.tps.addTransaction(transaction)
    }


    // Sets the state variable of what to delete: Index of song in the list
    markSongForDeletion = (index, prompt, now = false) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : index,
            sessionData: prevState.sessionData
        }), () => {
            if (prompt)
                // PROMPT THE USER
                this.showDeleteSongModal();
            if (now)
                this.deleteSong();
        });
    }
    deleteSong = () => {
        console.log('deleting index ' + this.state.indexMarkedForDeletion)
        let index = this.state.indexMarkedForDeletion;
        let currentList = this.state.currentList;
        let songs = currentList.songs;
        songs.splice(index, 1);
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : prevState.activeModal,
            sessionData: prevState.sessionData
        }), () => {
            this.hideDeleteSongModal();
            this.db.mutationUpdateList(currentList);
        })
        
    }

    addDeleteSongTransaction = (title, artist, id) => {
        console.log('addDelete ' + title + " " + artist + " " + id);
        let listLength = this.state.currentList.songs.length;
        console.log('listlen ' + listLength);
        
        let transaction = new DeleteSong_Transaction(this, this.state.indexMarkedForDeletion, title, artist, id, listLength);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE SONG
    showDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : true,
            sessionData: prevState.sessionData
        }))
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : false,
            sessionData: prevState.sessionData
        }))
    }

    addSong = () => {
        console.log('add')
        let currentList = this.state.currentList;
        let songs = currentList?.songs;
        let newSong = { title:'Untitled', artist: 'Unknown', youTubeId: 'dQw4w9WgXcQ' };
        songs[songs.length] = newSong;
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal: prevState.activeModal,
            sessionData: prevState.sessionData
        }), () => {
            this.db.mutationUpdateList(currentList);
        })
    }

    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this, this.state.currentList.songs.length);
        this.tps.addTransaction(transaction);
    }


    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            activeModal: prevState.activeModal,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : true,
            sessionData: prevState.sessionData
        }))
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.setState((prevState) => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            listKeyPairMarkedForEdit : prevState.listKeyPairMarkedForEdit,
            indexMarkedForDeletion : prevState.indexMarkedForDeletion,
            activeModal : false,
            sessionData: prevState.sessionData
        }))
    }

    render() {
        
        let canAddSong = this.state.currentList === null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList === null;
        return (
            <div id="playlister-root">
                <Banner />
                <SidebarHeading
                    disabled={this.state.activeModal}
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    disabled={this.state.activeModal}
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addCallback={this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    editSongCallback={this.markSongForEdit} 
                    deleteSongCallback={this.markSongForDeletion}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    listKeyPair={this.state.currentList?.songs[this.state.listKeyPairMarkedForEdit]}
                    hideEditSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.addEditSongTransaction}
                />
                <DeleteSongModal
                    listKeyPair={this.state.currentList?.songs[this.state.indexMarkedForDeletion]}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                    deleteSongCallback={this.addDeleteSongTransaction}
                />
            </div>
        );
    }
}

export default App;
