
const url_cliente = "http://127.0.0.1:8000/clientes";
const url_consultores = "http://127.0.0.1:8000/consultores";
const url_checks = "http://127.0.0.1:8000/checks";

export const Cadastrar = async (objUser) => {

    const possuiHabilidades = Object.keys(objUser).some(key => key === "habilidades");

    let improviseAdaptOvercome = possuiHabilidades ? "/cadConsultor" : "/cadCliente";

    return await fetch(url_cliente + improviseAdaptOvercome, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objUser)
    })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                alert("Cadastro realizado com sucesso. Enviado e-mail para confirmação enviado");
            }
            else if (response.status === 409) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "nickname": info })
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            return (response.json());
        }
        else if (response.status === 401) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            location.replace("./Menu.html")
        } else if (response.status === 401) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objConsultor)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            location.replace("../view/MenuConsultor.html")
        }
        else if (response.status === 401) {
            alert("Credenciais inválidas");
        }
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};


export const Registrar = async (pedido) => {

    return await fetch(url_cliente + '/agendamento', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

export async function carregarAgendamentos(id) {

    return await fetch(url_consultores + `/agenda/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 404) {
            return null;
        }
        else {
            console.error("Erro ao carregar agendamentos:", error);
        }
    })

}

export async function buscarNome(id, usertype) {

    return await fetch(url_checks + `/${id}/${usertype}/name`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 404) {
            return null;
        }
        else {
            console.error("Erro ao procurar pelo nome do usuario:", error);
        }
    })
}

export async function buscarCodigo(id, usertype) {


    return await fetch(url_checks + `/${id}/${usertype}/code`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 404) {
            return null;
        }
        else {
            console.error("Erro ao procurar pelo codigo do usuario:", error);
        }
    })

}

export async function temBloqueio(id, usertype) {

    return await fetch(url_checks + `/${id}/${usertype}/block`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 404) {
            return null;
        }
        else {
            console.error("Erro ao procurar pelo codigo do usuario:", error);
        }
    })
}

export async function agendadoNovamente(idCliente, idConsultor) {
    try {
        const response = await fetch(`http://localhost:8000/checks/${idCliente}/${idConsultor}`);
        const data = await response.json();

        if (response.status === 200 || response.status === 409) {
            return data.success;
        } else {
            throw new Error("Erro ao buscar cliente");
        }

    } catch (error) {
        console.error("Erro Interno:", error);
        return;
    }
}

export async function enviarRemarcacao(info) {
    try {

        const response = await fetch('http://localhost:8000/notifications', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                alert("Sua mudança no agendamento já foi notificada para o cliente. Enviado por e-mail para que ele fique ciente!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro no envio de remarcação:", error);
    }
}


export async function enviarCodigo(id, userType) {
    try {

        const response = await fetch('http://localhost:8000/notifications', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}`, "userType": `${userType}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Enviado com sucesso!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro no envio do código de verificação:", error);
    }
}

export async function verificado(id, userType) {
    try {

        const response = await fetch(url_checks + '/verified', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}`, "userType": `${userType}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Enviado com sucesso!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro no envio do código de verificação:", error);
    }
}

export async function buscarNick(nickname) {
    try {
      const response = await fetch(url_checks + `/${nickname}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
  
      if (response.ok) {
        const data = await response.json();
        //console.log("data valid: ", data.valid);
        return data.valid;
      } else {
        console.log(`Erro do servidor: ${response.status}`);
        return null;
      }
  
    } catch (error) {
      console.error("Erro no envio do código de verificação:", error);
      return null;
    }
  }