
const url_cliente = "http://127.0.0.1:8000/clientes";
const url_consultores = "http://127.0.0.1:8000/consultores";
const url_checks = "http://127.0.0.1:8000/checks";

/*EX: Só envio sem resposta */
// export const postCliente = (objUser) => {
//     return fetch(url + "/cadastro", {
//         method: "POST",
//         headers: {"Content-Type":"application/json"},
//         body: JSON.stringify(objUser)
//     })
// };

export const Cadastrar = async (objUser) => {

    const possuiHabilidades = Object.keys(objUser).some(key => key === "habilidades");

    let improviseAdaptOvercome = possuiHabilidades ? "/cadConsultor" : "/cadCliente";

    console.log(improviseAdaptOvercome);

    console.log(objUser);

    return await fetch(url_cliente + improviseAdaptOvercome, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            alert("Cadastro realizado com sucesso. Enviado e-mail para confirmação enviado");
        } 
        else if (response.status === 409){
            alert("Usuário já cadastrado");
        }    
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

export const userType = async (info) => {

    return await fetch(url_checks, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({"nickname": info})
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return (response.json());
        }
        else if (response.status === 401){
            alert("Usuário Inexistente");
        } 
        else {
            console.log(`ERRO: ${response.status}`);
        }
    })
};



export const getUser = async (objUser) => {
    return await fetch(url_cliente + '/login', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            location.replace("./Menu.html")
        }else if (response.status === 401){
            alert("Credenciais inválidas");
        }
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

export const getUserConsultor = async (objConsultor) => {
    return await fetch(url_consultores + '/login', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objConsultor)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            location.replace("../view/MenuConsultor.html")
        }
        else if (response.status === 401){
            alert("Credenciais inválidas");
        } 
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};


export const Registrar = async (pedido) => {

    return await fetch(url_cliente + '/pedidoAgendamento', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(pedido)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            alert("Cadastro realizado com sucesso. Enviado e-mail para confirmação enviado");
        }       
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

export const Agendar = async (Pedido) => {

    return await fetch(url_cliente + '/agendamento', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(Pedido)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            alert("Solicitação de agendamento enviado com sucesso!");
        } 
        // else if (response.status === 409){       ELSE IF SE O USUARIO JA AGENDOU COM ESSE CONSULTOR
        //     alert("Usuário já cadastrado");
        // }    
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

