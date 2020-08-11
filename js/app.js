'use strict';

/**
 * Object -> Object
 * DB is an interface to an browser indexed DB store
 */
export function NoteApp(DB) {

  const editor = document.querySelector("#editor");
  const sheet = editor.querySelector("#sheet");
  const notes = document.querySelector("aside");
  const articlesCont = notes.querySelector("section");
  const addButton = notes.querySelector("#add-note");
  const delButton = editor.querySelector("#delete-note");
  
  const articleElem = document.createElement("ARTICLE");
  
  document.querySelector("#list")
    .addEventListener("click",event=>{
      notes.style.setProperty("z-index",2);
  });
  
  /** UI */

  /**
   * Object -> String
  */
  function listTemplate(anote,key) {
      //return `<article key="${key}" class="my-box">
      return `<article key="${anote.ts}">
  ${anote.body.slice(0,18)}
  </article>`;
  }

/**
 * Array<Object> -> String
 */
function listView(notes) {
    return notes.reduce((html,anote,indx) => {
        return `${html}${listTemplate(anote,indx)}`;
    },"");
} 
  
  /* 
  * set UI for a new note
  */
  function newNoteUI() {
      localStorage.clear();
      sheet.value = "";
      notes.style.setProperty("z-index",1);
      history.pushState(null,"new",`${location.pathname}`);
  }
  
  /**
  * Note -> void // Note is {ts: Number, body: String }
  * insert a new article element with a content
  * to a list of article elements
  */
  function addNoteUI(anote) {
      let newArticle = articleElem.cloneNode();
      newArticle.innerText = anote.body.slice(0,18);
      newArticle.setAttribute("key",anote.ts);
      articlesCont.appendChild(newArticle);
  }
  
  /**
  * Key Note -> void
  * update a content of an article
  */
  function updateNoteUI(key,anote) {
      let updArticle = articlesCont.querySelector(`[key="${key}"]`);
      updArticle.textContent = anote.body.slice(0,18);
  }
  
  /**
  * Key -> void
  * delete an article with a key attribute
  */
  function deleteNoteUI(key) {
      articlesCont.removeChild(
          articlesCont.querySelector(`[key="${key}"]`)
      );
  }
  
  /**
  * Note -> void
  * Load note content into #sheet
  * Update url to match the note
  * Push #sheet to front
  */
  function setNoteToSheet(note) {
      localStorage.setItem('currentSavedNote',note.body);
      sheet.value = note.body;
      history.pushState(null,`note ${note.ts}`,`?note=${note.ts}`);
      notes.style.setProperty("z-index",1);
  }
  
  /** REACT  */
  
  /**
  * Select a note to display/edit 
  */
  articlesCont.addEventListener("click",event=>{
    if(event.target.tagName==="ARTICLE") {
      let indx = Number(event.target.getAttribute("key"));
      DB.getRecord(0, indx, note => {
        setNoteToSheet(note);
      });
    }
  });
  
  /**
  * Create a new note
  * 
  * Clear #sheet text content
  * Push #sheet to front
  */
  addButton.addEventListener("click", event => {
      newNoteUI();
      console.log("adding new note");
  });
  
  /**
  * Delete a note
  */
  delButton.addEventListener("click", event => {
      let noteKey = Number(new URLSearchParams(
          location.search).get("note"));
      console.log(`deleting note ${noteKey}`);
      if(noteKey) {
          DB.deleteRecord(0, noteKey, event => {
              deleteNoteUI(noteKey); newNoteUI();
          })
      }
  });
  
  function autoSave() {
    setTimeout(()=>{
      if(document.activeElement === sheet) {
        let noteToSave = { "body": sheet.value };
        let currentSaved = localStorage.getItem('currentSavedNote');
        if(currentSaved===null&&noteToSave.body!="") {
          noteToSave['ts'] = Date.now();
          DB.createRecord(0,[noteToSave], event => {
              console.log("record created");
              addNoteUI(noteToSave);
              history.pushState(null,`note ${noteToSave.ts}`,`?note=${noteToSave.ts}`);
              console.log("saving note");
              localStorage.setItem('currentSavedNote',noteToSave.body);
          });
        } else if (noteToSave.body!=currentSaved) {
          let noteKey =(new URLSearchParams(location.search)).get("note");
          if(noteKey) {
            DB.updateRecord(
                0, Number(noteKey), noteToSave, event => {
                    updateNoteUI(noteKey,noteToSave);
                    localStorage.setItem('currentSavedNote',noteToSave.body);
                    console.log("updating note");
                });
          }
        }
      }  
      autoSave();
    },3000)
  }

  return {
    init: function () {
        let noteKey = Number((new URLSearchParams(
            location.search)).get("note"));
      if(noteKey) {
          if(noteKey) {
              DB.getRecord(0, noteKey, note => {
                  setNoteToSheet(note);
              });
          } else {
              history.replaceState(null,"","/"); 
          }
      } 
  
      autoSave();
  
      DB.getRecords(0, notes => {
          articlesCont.innerHTML = listView(notes);
      }); 
    }
  }
}

  
