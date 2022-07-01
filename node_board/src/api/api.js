import axios from "axios";

let instance = axios.create({
    baseURL: 'http://127.0.0.1:19901/'
})



function fetch_search(searchValue, selectOption) {
    return instance.get(`search?searchValue=${searchValue}&selectOption=${selectOption}`);
}
function fetch_delete(id) {
    let bodyData = {
        id: id,
    };
    let options = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    let data = JSON.stringify(bodyData);
    return instance.post("http://127.0.0.1:19901/delete", data, options)
}
function fetch_modify(article, textAreaValue) {
    let formData = {
        title: article.title,
        writer: article.writer,
        content: textAreaValue,
        date: new Date(),
        id: article.id,
    };
    let data = JSON.stringify(formData);
    console.log(data);
    let options = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    return instance.post("http://127.0.0.1:19901/modify", data, options)
}

function fetch_write(data) {
    let options = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    console.log(data); //undefined
    return instance.post("http://127.0.0.1:19901/write", data, options)
}

export { fetch_search, fetch_delete, fetch_modify, fetch_write };