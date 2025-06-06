
const url_cliente = "http://127.0.0.1:8000/clientes";
const url_consultores = "http://127.0.0.1:8000/consultores";
const url_checks = "http://127.0.0.1:8000/checks";
const url_administrador = "http://127.0.0.1:8000/administradores";

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

//ADAPTAR PARA ATRIB NOVO STATUS 1
export const getUser = async (objUser, opt) => {

    return await fetch(url_cliente + '/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objUser)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            if (opt === '1') {
                location.replace("./ConfigCliente.html");
            } else {
                location.replace("./Menu.html");
            }
        } else if (response.status === 401) {
            alert("Credenciais inválidas");
        }
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};


//ADAPTAR PARA ATRIB NOVO STATUS 0
export const getAdmin = async (objAdmin) => {

    return await fetch(url_administrador + '/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objAdmin)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            location.replace("./MenuAdministrador.html");
        }
        else if (response.status === 401) {
            alert("Credenciais inválidas");
        }
        else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
};

//ADAPTAR PARA ATRIB NOVO STATUS 3 = ADMIN

export const getUserConsultor = async (objConsultor, opt) => {

    return await fetch(url_consultores + '/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objConsultor)
    }).then((response) => {
        if (response.status >= 200 && response.status < 300) {
            if (opt === '1') {
                location.replace("./ConfigConsultor.html");
            } else {
                location.replace("./MenuConsultor.html");
            }
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
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar agendamentos:", error);
        }
    })

}

export async function carregarHabilidades() {

    return await fetch(url_consultores + `/habilidades`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar as habilidades:", error);
        }
    })

}

export async function carregarSolicitacoesAgendadas(id) {

    return await fetch(url_consultores + `/historico/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data;
        }
        else if (response.status === 201) {
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
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao procurar pelo nome do usuario:", error);
        }
    })
}

export async function buscarPrazo(id) {

    return await fetch(url_consultores + `/${id}/prazo`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        else if (response.status === 201) {
            return 1;
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
        else if (response.status === 201) {
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
        else if (response.status === 201) {
            return { success: false, message: 0 };
        }
        else {
            console.error("Erro ao procurar pelo codigo do usuario:", error);
        }
    })
}


export async function agendadoNovamente(idCliente, idConsultor) {
    try {
        const response = await fetch(url_checks + `/${idCliente}/${idConsultor}`);
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


export async function enviarCodigo(id, usertype, email) {
    try {

        const response = await fetch('http://localhost:8000/notifications', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}`, "usertype": `${usertype}`, "email": `${email}` })
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
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

export async function verificado(id, usertype) {
    try {

        const response = await fetch(url_checks + '/verified', {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}`, "usertype": `${usertype}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Verificado com sucesso!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro na verificação:", error);
    }
}

export async function buscarNick(nickname) {
    try {
        const response = await fetch(url_checks + `/${nickname}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 200) {
            const data = await response.json();

            return data.valid;
        } else {
            console.log(`Erro do servidor: ${response.status}`);
            return null;
        }

    } catch (error) {
        console.error("Erro em buscar o nickname:", error);
        return null;
    }
}

export async function agendamentoCancelado(id) {
    try {

        const response = await fetch(url_consultores + `/agenda/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Cancelado com sucesso!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro geral no cancelamento do agendamento:", error);
    }
}

export async function canceladoReuniao(id) {
    try {

        if (!id) {
            throw new Error("Erro na identificação da Reuniao");
        }

        const response = await fetch(url_cliente + `/agenda/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Cancelado com sucesso!");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro geral no cancelamento do agendamento:", error);
    }
}

export const RegistrarReuniao = async (objRegistro) => {
    return await fetch(url_cliente + '/registrarReuniao', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objRegistro)
    }).then((response) => {
        if (response.status == 200) {
            alert('Registro de reunião salvo com sucesso!');
        } else {
            console.log(`Erro do servidor: ${response.status}`);
        }
    })
}

export async function carregarInfoPerfil(id, usertype) {
    return await fetch(url_checks + `/perfil/${id}/${usertype}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data.perfil;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar info de perfil:", error);
        }
    })
}

export async function habilidadesPortifolio (id) {
    return await fetch(url_consultores + `/habilidades/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar info de perfil:", error);
        }
    })
}

export async function mediaPortifolio (id) {
    return await fetch(url_consultores + `/media/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar info de media do consultor:", error);
        }
    })
}

export async function atualizarPerfil(id, usertype, info) {
    try {
        const response = await fetch(url_checks + `/perfil/${id}/${usertype}/refresh`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        let data = await response.json();

        if (data) {
            return data;
        }

        return 'Falha na atualização dos dados!'

    } catch (error) {
        return alert('Erro ao atualizar perfil:', error);
    }
}

export async function atualizarSenha(id, usertype, info) {
    try {
        const response = await fetch(url_checks + `/senha/${id}/${usertype}/refresh`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        let data = await response.json();

        if (data) {
            return data;
        }

        return 'Falha na atualização dos dados!'

    } catch (error) {
        return alert('Erro ao atualizar senha:', error);
    }
}

export async function uploadImagemPerfil(id, usertype, file) {

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
        const response = await fetch(url_checks + `/perfil/${id}/${usertype}/image`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data) {
            return data;
        }

        return { success: false, message: 'Erro: Não foi possivel fazer upload da imagem!' }

    } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        return { success: false, message: 'Erro de rede ou servidor.' };
    }
}

export async function uploadCertificado(id, file) {

    const formData = new FormData();
    formData.append('certificatePic', file);

    try {
        const response = await fetch(url_consultores + `/perfil/${id}/certificados`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data) {
            return data;
        }

        return { success: false, message: 'Erro: Não foi possivel fazer upload do(s) certificado(s)!' }

    } catch (error) {
        console.error('Erro ao enviar certificado:', error);
        return { success: false, message: 'Erro de rede ou servidor.' };
    }
}

export async function carregarConsultoriasPesquisadas(nomeCliente) {
    return await fetch(url_consultores + `/historico/${nomeCliente}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data.historico;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar historico de consultorias:", error);
        }
    })
}

export async function carregarMatchsPesquisados(id) {

    return await fetch(url_cliente + `/historico/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar historico de match:", error);
        }
    })
}

export async function carregarMatchsConsultor(id) {

    return await fetch(url_consultores + `/solicitacoes/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();

            return await data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar historico do consultor:", error);
        }
    })
}

export async function carregarUsuariosPesquisados(nomeUsuario) {
    return await fetch(url_administrador + `/denuncias/${nomeUsuario}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data.denuncias;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar denuncias:", error);
        }
    })
}

export async function carregarDenunciasUsuario(idUsuario, tipoUsuario) {
    return await fetch(url_administrador + `/denuncias/${idUsuario}/${tipoUsuario}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data.denuncias;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar denuncias:", error);
        }
    })
}

export const buscarSenha = async (id, usertype) => {

    try {
        const response = await fetch(url_checks + `/${id}/${usertype}/senha`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data) {
            return data.message;
        }

        return { success: false, message: 'Erro: Não foi possivel fazer upload da imagem!' }

    } catch (error) {
        console.error('Erro ao buscar senha:', error);
        return { success: false, message: 'Erro de rede ou servidor.' };
    }
};


export async function desativarUsuario(id, usertype) {
    try {

        const response = await fetch(url_checks + `/${id}/${usertype}/desativar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": `${id}`, "usertype": `${usertype}` })
        }).then((response) => {
            if (response.status == 200) {
                console.log("Desativado com sucesso!");
                localStorage.clear();
                location.replace("../view/Login.html")
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro no envio do código de verificação:", error);
    }
}


export async function buscarHabilidades() {

    return await fetch(url_consultores + `/habilidades`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            let data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao procurar pelo nome do usuario:", error);
        }
    })
}

export async function avaliado(info) {
    try {
        const response = await fetch(url_cliente + `/avaliacao`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        let data = await response.json();

        if (data) {
            return data;
        }

        return 'Falha na atualização dos dados!'

    } catch (error) {
        return alert('Erro ao atualizar senha:', error);
    }
}

export async function denunciar(id, usertype, info) {


    try {
        const response = await fetch(url_checks + `/${id}/${usertype}/denuncia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        let data = await response.json();

        if (data) {
            return data;
        }

        return 'Falha na submissão da denuncia'

    } catch (error) {
        return alert('Erro ao submter a denuncia: ', error);
    }
}

export async function registrarReuniao(info) {
    try {
        const response = await fetch(url_consultores + `/registrarReuniao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        });

        let data = await response.json();

        if (data) {
            return data;
        }

        return 'Falha na submissão do registro da reunião';

    } catch (error) {
        return alert('Erro ao submter a registro: ', error);
    }
}

export const checkDenuncia = async (id, usertype, id2) => {


    try {
        const response = await fetch(url_checks + `/denuncia/${id}/${usertype}/${id2}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data) {
            return data.message;
        }

        return { success: false, message: 'Erro: Não foi verificar se tem denuncia!' }

    } catch (error) {
        console.error('Erro ao buscar informação de denuncia:', error);
        return { success: false, message: 'Erro de rede ou servidor no momento de carregar denuncias.' };
    }
};

export async function carregarDenuncias() {

    return await fetch(url_administrador + `/denuncias`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar historico de match:", error);
        }
    })
}

export const buscarMediaConsultor = async (id) => {

    try {
        const response = await fetch(url_consultores + `/${id}/media`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data) {
            return data.message;
        }

        return { success : false, message: 'Erro: Não foi possivel buscar media'}

    } catch (error) {
        console.error('Erro ao buscar media:', error);
        return { success: false, message: 'Erro de rede ou servidor.' };
    }
};


export const comunicarGeral = async (opt, objEmail) => {

    return await fetch(url_administrador + `/comunicados/${opt}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objEmail)
    })
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                console.log("Email enviado com sucesso.");
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })
};

export async function trocarStatusDenuncia (idDenuncia) {

    return await fetch(url_administrador + `/statusDenuncia/${idDenuncia}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    })
        .then((response) => {
            if (response.status == 200) {
                console.log("Status desta denuncia agora esta em analise, primeiro contato feito.");
            }
            else if (response.status == 201){
                console.log("Não encontrado o registro")
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })
}


export async function finalizarDenuncia (obj,opt) {

    return await fetch(url_administrador + `/vereditoDenuncia/${opt}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
    })
        .then((response) => {
            if (response.status == 200) {
                console.log("Denuncia encerrada");
            }
            else if (response.status == 201){
                console.log('Sem denuncia para o id passado');
            }
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })
}

export async function obterArrayAgendamentoDashboard (id) {
    return await fetch(url_consultores + `/dashboard/totalAgendamentos/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de perfil:", error);
        }
    })
}

export async function obterArrayDemandaDiaAgendamento (id) {
    return await fetch(url_consultores + `/dashboard/demandaDias/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de perfil:", error);
        }
    })
}

export async function obterArrayHistAvaliacao (id) {
    return await fetch(url_consultores + `/dashboard/historicoAvaliacao/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de perfil:", error);
        }
    })
}



export async function obterArrayQtdBloqDashboard () {
    return await fetch(url_administrador + `/dashboard/totalDenuncias`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de bloq-dashboard:", error);
        }
    })
}

export async function obterArrayAvgAvaliacaoConsultor () {
    return await fetch(url_administrador + `/dashboard/mediaAvaliacao`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de avgAvaliacao-dashboard:", error);
        }
    })
}

export async function obterArrayTop5Consultores () {
    return await fetch(url_administrador + `/dashboard/top5Consultores`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            console.error("Erro ao carregar info de avgAvaliacao-dashboard:", error);
        }
    })
}

export async function horariosConsultor (idConsultor) {
    return await fetch(url_checks + `/horarios/${idConsultor}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then(async (response) => {
        if (response.status === 200) {
            const data = await response.json();
            return await data;
        }
        else if (response.status === 201) {
            return null;
        }
        else {
            console.error("Erro ao carregar horarios deste consultor:", error);
        }
    })
}