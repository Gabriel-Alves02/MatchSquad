
const url_cliente = "http://127.0.0.1:8000/clientes";

/*EX: Só envio sem resposta */
// export const postCliente = (objCliente) => {
//     return fetch(url + "/cadastro", {
//         method: "POST",
//         headers: {"Content-Type":"application/json"},
//         body: JSON.stringify(objCliente)
//     })
// };

export const postCliente = async (objCliente) => {
    return await fetch(url_cliente + "/cadastro", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objCliente)
    }).then((response) => {
        if (response.status == 200) {
            alert("Cadastro realizado com sucesso. Enviado e-mail para confirmação enviado");
        } else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

export const getCliente = async (objCliente) => {
    return await fetch(url_cliente + '/login', {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(objCliente)
    }).then((response) => {
        if (response.status == 200) {
            location.replace("./Menu.html")
        } else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};