import { getUser } from "../service/req_respManager.js";

const form = document.getElementById('loginForm');


form.addEventListener('submit', (event) => {
    event.preventDefault();

    let objLogin = {
        nickname: document.getElementById('nick').value,
        senha: document.getElementById('senha').value
    }

    getUser(objLogin);

});