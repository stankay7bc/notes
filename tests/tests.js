/* TESTS */

let db = dbIN("Notepad", ["notes"], 1, ()=>{});

document.querySelector("ul")
    .addEventListener("click", event => {
        if (event.target.tagName === "BUTTON") {
            let testId = event.target.id;
            ({
                "test1": () => {
                    db.createRecord(
                        0, [{ "ts": Date.now(), "body": "Hello, world!" }]);
                },
                "test3": () => {
                    db.getRecords(0,console.log);
                },
            })[testId]();
        }
    });

document.querySelector("form#test2")
    .addEventListener('submit', event => {
        event.preventDefault();
        let formData = new FormData(event.target);
        db.updateRecord(
            0, Number(formData.get("key")), { "body": formData.get("body") });
    });

document.querySelector("form#test4")
    .addEventListener('submit', event => {
        event.preventDefault();
        let formData = new FormData(event.target);
        db.getRecord(0, Number(formData.get("key")),console.log);
    });

document.querySelector("form#test5")
    .addEventListener('submit', event => {
        event.preventDefault();
        let formData = new FormData(event.target);
        console.log(db.deleteRecord(0, Number(formData.get("key"))));
    });