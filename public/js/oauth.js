document.getElementById("retry").hidden = true
document.onload = (() => {
    const url = new URL(document.location);
    const query = url.searchParams;

    if(!query.get("code")) return document.location.href = "/redirect"
    
    axios.post("/api/join", {
        code: query.get("code")
    }).then((x) => {
        const data = x.data


        if(data.message == 1) {
            document.getElementById("msg").textContent = data.__note
            document.getElementById("status").remove()
            document.getElementById("load").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="green" class="bi bi-check" viewBox="0 0 16 16" id="tick"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>`
        } else if (data.fixable == true) {
            document.getElementById("msg").textContent = data.__note
            document.getElementById("retry").hidden = false
            document.getElementById("status").remove()
            document.getElementById("load").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="red" class="bi bi-x" viewBox="0 0 16 16" id="cross"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`
        } else {
            document.getElementById("msg").textContent = data.__note
            document.getElementById("status").remove()
            document.getElementById("load").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="red" class="bi bi-x" viewBox="0 0 16 16" id="cross"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`
        }
    })
})()

