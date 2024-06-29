Alessandro Manrique Junior
      
Gabriel Alves Coelho
      
Guilherme de Freitas Diniz      

Natã Siloe

Pedro Henrique Aranha

Victor Akira Maejima

Prof. Glauco Todesco
 
# Síntese do Projeto

O projeto da MatchSquad, trabalha com ideias. Inicialmente tem como objetivo de fomentar o encontro de interessados dos mais variados nichos do empreendedorismo, buscando unir empresários com novas ideias de negócio, e experts do ramo. Complementarmente, disponibilizar a venda de conteúdos dos consultores e coaches previamente apurados, para a maturação e melhoria contínua das ideias, como uma incubadora ou dar propulsão a um negócio ja em curso, como aceleradora.
As dores dos usuários que serão trabalhadas estão embasadas nas dificuldades:
* Perspectiva do Empreendedor
    * Dificuldade na procura de um profissinal qualificado;
    * Falta de visões chave/insights para por em prática as ideias;
    * Confiabilidade na seleção de um profissinal;
* Perspectiva dos Consultores e Coaches
    * Falha de Marketing Pessoal;
    * Oculto pela competitividade dos profissionais já estabelecidos no mercado;
    * Falta de informação de quais são os atuais projetos sendo trabalhados nas empresas;
    * Cross Sell dos conteúdos educativos moldados ao campo de atuação que o empreendedor esta interessado em investir;
            
# Nível de Dificuldade do Sistema Proposto

# Quantidade de Tabelas, quais tabelas?

A aplicação terá 10 tabelas. São elas:

1) Tabela de instrutores
2) Tabela de empreendedores
3) Tabela de consultorias
4) Tabela de reuniões
5) Tabela de registros de reuniões
6) Tabela de pagamentos
7) Tabela de planos
8) Tabela de planos para empreendedores (relacionamento n:n)
9) Tabela de habilidades
10) Tabela de habilidades para instrutores (relacionamento n:n)

# Quantidade de dores (Casos de Uso). Quais dores?

As dores/casos de uso dos clientes da MatchSquad são:

1) Procurar/encontrar consultor;
2) Analisar perfil do consultor (por parte do empreendedor);
3) Analisar perfil do empreendedor (por parte do consultor, para direcionar melhor sua consultoria);
4) Assistir/ministrar uma consultoria à distância;
5) Melhorar seu trabalho (consultoria) através da avaliação do cliente.

# Quantidade de Relatórios. Quais relatórios?

	Serão compostos em 4 relatórios: consultas de avaliação, o histórico de match de acordo com o perfil, o relatório de progressão, e o contrato de consultoria (metas).

Consulta de Avaliação:

Os relatórios de avaliações de Consultores e Coaches são só visíveis para Empresas, para evitar compra de boas avaliações com propósito de inflar score. Só são habilitados para avaliar os perfis que tenham tido contrato entre si, tendo informações da porcentagem de metas atingidas e classificação por estrelas.
Para abordar avaliações ruins, pode-se incrementar o anonimato do autor com o subsequente envio por e-mail do que foi relatado, estabelecendo um tempo hábil para réplica e resolução do problema. Caso não seja atendido, a avaliação é atrelada permanentemente ao perfil.

Histórico de Match:

Este relatório tem um propósito de arquivar ao longo do tempo empresas ou consultores/coaches, conforme o perfil, que foram feito o contato durante o uso da aplicação, com detalhes em resumo de: datas, chamadas online, quantidade de consultorias/reuniões feitas, assuntos trabalhados nas respectivas consultorias/reuniões, quanto foi pago, comprovantes e certificados.

Relatórios de Agendamentos:

O referido relatório tem o objetivo de documentar todos os agendamentos de consultorias/reuniões para ciência do consultor/coach.

Extrato de Pagamentos:

Este relatório tem como objetivo registrar as transações feitas na carteira do consultor/coach para ciência e documentação deste.

Logs de Sessão Atendida:

Relatório com a finalidade de documentar as sessões de consultoria/reunião já realizadas.

# Quantidade de Telas. Quais telas

A aplicação terá 11 telas principais e outras telas informativas. São elas:

1)   Tela de pesquisa de consultores/coaches;
2)   Tela de perfil do consultor/coach;
3)   Tela de perfil do empreendedor;
4)   Tela de avaliação da consultoria/reunião;
5)   Tela de agendamento de consultoria/reunião;
6)   Tela para registro da reunião;
7)   Tela de consulta de consultorias/reuniões agendadas;
8)   Tela de consulta de relatórios de Avaliação;
9)   Tela de consulta de relatório de Histórico de Match;
10) Tela de consulta de Relatório de Progressão;
11) Tela de Contrato de Consultoria;
12) Telas informativas.

# Tecnologia Utilizadas

# FrontEnd

	Serão utilizadas as seguintes tecnologias para a etapa de desenvolvimento FrontEnd:

1)	HTML e CSS;
2)	JavaScript;
3)	Headroom.js;
4)	BootStrap;
5)	React;
6)	VSCode;
7)	GitHub;
8)	Git cliente.
# BackEnd

Serão utilizadas as seguintes tecnologias para a etapa de desenvolvimento BackEnd:

1)	Java;
2)	Spring;
3)	VSCode;
4)	GitHub;
5)	Git cliente;

# Mobile 

No início do projeto não está previsto o desenvolvimento de aplicação mobile, tornando-se assim uma opção para o futuro.

# Banco de Dados

Prezando pela consistência e de maior integridade provida pelos bancos SQL, dado o uso de operações financeiras, será utilizado o Oracle como base de dados. O que confere maior segurança no armazenamento de segurança e rollback necessários em eventual mau funcionamento.

# Documento Principal

https://github.com/Gabriel-Alves02/MatchSquad/blob/main/MatchSquad.docx

# Diagramas:

# Casos de Uso:

### Empreendedor
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/157eedee-d58e-4b02-96c6-58405ca7959a)

### Consultor
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/0b58fe1e-40b4-4f50-beae-084fa400e002)

### Coach
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/330452b0-8c82-4307-a71a-92d24e8b21c3)

### Admin (Em fase de ajuste/modelagem provisoria)
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/f61fbecb-4972-41df-af05-f8402a8a11a9)

### Diagrama E/R
![Modelo_Entidade_Relacionamento_Trabalho](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/cf9911cd-e2d6-4996-9504-a48902edc9af)

### Modelo Lógico
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/b7ff18c8-28e5-49fc-b3e6-4651d00486cf)

### Modelo Conceitual
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/8d55ca5c-bb6f-4cb8-882c-38f2f9814841)



# Protótipo em baixa fidelidade:

https://www.figma.com/file/duECfgkcSOjXFHZnNDrTCz/Untitled?type=design&node-id=0%3A1&mode=design&t=M5zaaqJTc3UVJnM2-1

https://www.figma.com/file/2fs2UONimMNqprCcBRt3nG/FlowOverview?type=design&node-id=0-1&mode=design&t=TAtH0ZcOd7c5IVOH-0

# Protótipo em alta fidelidade:

### Fluxo do Homepage
https://almanriquejr.github.io/Matchsquad_Homepage/

### Fluxo do Coach
https://gabriel-alves02.github.io/MatchSquad-Coach/

### Fluxo do Consultor
https://almanriquejr.github.io/MatchSquad_Consultor/index.html

### Fluxo do Empreendedor
https://gabriel-alves02.github.io/MatchSquad-Empreendedor/

### Fluxo do Administrador
https://gabriel-alves02.github.io/MatchSquad-ADM/

O protótipo se encontra na pasta Docs/Alta Fidelidade, a qual contêm pastas com os fluxos de cada ator do sistema, separadamente.

# Apresentação final:
https://www.youtube.com/watch?v=QVF9fPfuNxw
