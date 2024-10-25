
const url_cliente = "http://127.0.0.1:8000/clientes";

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

    return await fetch(url_cliente + improviseAdaptOvercome, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status == 200) {
            alert("Cadastro realizado com sucesso. Enviado e-mail para confirmação enviado");
        } else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

export const getUser = async (objUser) => {
    return await fetch(url_cliente + '/login', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status == 200) {
            location.replace("./Menu.html")
        } else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};