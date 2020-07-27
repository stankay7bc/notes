'use strict';

/**
* String String Number (void -> void)
*/
export function dbIN(dbName, os, ver, callback) {

    let DB;

    let openDB = indexedDB.open(dbName, ver);

    openDB.onsuccess = function (event) {
        DB = event.target.result;
        callback();
    }

    openDB.onupgradeneeded = function (event) {
        let db = event.target.result;
        let objStore = db
            .createObjectStore(os, { keyPath: "ts" });
    }

    /**
    * ... -> IDBObjectStore  
    */
    function getObjectStore(objStore, oncompleteCallback) {
        let trxn = DB.transaction([objStore], "readwrite");
        trxn.oncomplete = oncompleteCallback;
        return trxn.objectStore(objStore);
    }

    return {
        /**
         * Number Array<Object> 
         **/
        createRecord: function (osIndx, data, callback) {
            let objStore = getObjectStore(os[osIndx], callback);
            data.forEach(function (record) {
                let storeRec = objStore.add(record);
                storeRec.onsuccess = function (event) {
                    //
                }
            });
        },
        getRecord: function (osIndx, key, callback) {
            let objStore = getObjectStore(os[osIndx]);
            let getRec = objStore.get(key);
            getRec.onsuccess = function (event) {
                callback(event.target.result);
            }
            getRec.onerror = function (event) {
                console.log("error...");
            }
        },
        deleteRecord: function (osIndx, key, callback) {
            let delRec = getObjectStore(os[osIndx]).delete(key);
            delRec.onsuccess = function (event) {
                console.log("record deleted");
                callback(event);
            }
        },
        getRecords: function (osIndx, callback) {
            let objStore = getObjectStore(os[osIndx]);
            let getAll = objStore.getAll();
            getAll.onsuccess = function (event) {
                callback(event.target.result);
            }
        },
        /**
         * Number String X (EventObject -> void) 
         */
        updateRecord: function (osIndx, key, newData, callback) {
            let objStore = getObjectStore(os[osIndx]);
            let update = objStore.get(key);
            update.onsuccess = function (event) {
                let data = event.target.result;
                for (let rec in data) {
                    if (newData.hasOwnProperty(rec)) {
                        data[rec] = newData[rec];
                    }
                }
                let saveUpdate = objStore.put(data);
                saveUpdate.onsuccess = function(event) {
                    console.log(`record ${key} updated...`);
                    callback(event);
                }
            }
        }
    };
}