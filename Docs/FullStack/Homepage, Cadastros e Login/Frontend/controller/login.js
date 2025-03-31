import { getUser } from "../service/req_respManager.js";
import { getUserConsultor } from "../service/req_respManager.js";
import { userType } from "../service/req_respManager.js";

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let username = document.getElementById('nick').value;

    try {
        const test = await userType(username);

        let objLogin = {
            nickname: username,
            senha: document.getElementById('senha').value
        };
        
        if (test.message === "0") {
            localStorage.setItem("idConsultor", test.user);
            getUserConsultor(objLogin);
           
        } else if (test.message === "1") {
            localStorage.setItem("idCliente", test.user);
            getUser(objLogin);
        }else {
            throw new Error('Erro no login.js');
        }
        
    } catch (error) {
        console.error('Erro no login.js:', error);
    }

});