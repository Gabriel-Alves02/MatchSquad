Alessandro Manrique Junior
      
Gabriel Alves Coelho
      
Guilherme de Freitas Diniz      

Natã Siloe

Pedro Henrique Aranha

Victor Akira Maejima

Prof. Glauco Todesco
 
# Síntese do Projeto

O projeto da MatchSquad, trabalha com ideias. Inicialmente tem como objetivo de fomentar o encontro de interessados dos mais variados nichos do empreendedorismo, buscando unir empresários com novas ideias de negócio, e experts do ramo. Complementarmente, disponibilizar a venda de conteúdos dos consultores e mentores previamente apurados, para a maturação e melhoria contínua das ideias, como uma incubadora ou dar propulsão a um negócio ja em curso, como aceleradora.
As dores dos usuários que serão trabalhadas estão embasadas nas dificuldades:
* Perspectiva do Empreendedor
    * Dificuldade na procura de um profissinal qualificado;
    * Falta de visões chave/insights para por em prática as ideias;
    * Confiabilidade na seleção de um profissinal;
* Perspectiva dos Consultores e Mentores
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

1) Procurar/encontrar mentor;
2) Analisar perfil do mentor (por parte do empreendedor);
3) Analisar perfil do empreendedor (por parte do mentor, para direcionar melhor sua mentoria);
4) Assistir/ministrar uma mentoria à distância;
5) Melhorar seu trabalho (mentoria) através da avaliação do cliente.

# Quantidade de Relatórios. Quais relatórios?

	Serão compostos em 4 relatórios: consultas de avaliação (reviews tanto empresa quanto mentor), o histórico de match de acordo com o perfil, o relatório de progressão, e o contrato de mentoria (metas).

Consulta de Avaliação:

Os relatórios de avaliações de Mentores são só visíveis para Empresas, e a avaliação das Empresas são só visíveis aos Mentores, para evitar compra de boas avaliações com propósito de inflar score. Só são habilitados para avaliar os perfis que tenham tido contrato entre si, tendo informações da porcentagem de metas atingidas e classificação por estrelas.
Para abordar avaliações ruins, pode-se incrementar o anonimato do autor com o subsequente envio por e-mail do que foi relatado, estabelecendo um tempo hábil para réplica e resolução do problema. Caso não seja atendido, a avaliação é atrelada permanentemente ao perfil.

Histórico de Match:

Este relatório tem um propósito de arquivar ao longo do tempo empresas ou mentores, conforme o perfil, que foram feito o contato durante o uso da aplicação, com detalhes em resumo de: datas, chamadas online, quantidade de mentorias feitas, assuntos trabalhados nas respectivas mentorias, quanto foi pago, comprovantes e certificados.

Relatórios de Agendamentos:

O referido relatório tem o objetivo de documentar todos os agendamentos de mentorias para ciência do mentor.

Extrato de Pagamentos:

Este relatório tem como objetivo registrar as transações feitas na carteira do mentor para ciência e documentação deste.

Logs de Sessão Mentorada:

Relatório com a finalidade de documentar as sessões de mentoria já realizadas.

# Quantidade de Telas. Quais telas

A aplicação terá 11 telas principais e outras telas informativas. São elas:

1)   Tela de pesquisa de mentores;
2)   Tela de perfil do mentor;
3)   Tela de perfil do empreendedor;
4)   Tela de avaliação da mentoria;
5)   Tela de agendamento de mentoria;
6)   Tela de videochamada para realização da mentoria;
7)   Tela de consulta de mentorias agendadas;
8)   Tela de consulta de relatórios de Avaliação;
9)   Tela de consulta de relatório de Histórico de Match;
10) Tela de consulta de Relatório de Progressão;
11) Tela de Contrato de Mentoria;
12) Telas informativas.

# Tecnologia Utilizadas

# FrontEnd

	Serão utilizadas as seguintes tecnologias para a etapa de desenvolvimento FrontEnd:

1)	HTML e CSS;
2)	JavaScript;
3)	Headroom.js;
4)	React;
5)	VSCode;
6)	GitHub;
7)	Git cliente.
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

https://github.com/Gabriel-Alves02/Tabalho-ES-II/blob/89b09ab12f948261cc858a13610a07cd82ef3f1e/MatchSquad.docx

# Diagramas:

# Casos de Uso:

### Empreendedor
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/157eedee-d58e-4b02-96c6-58405ca7959a)

### Mentor
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/344e52c4-c3ae-4364-a626-f592814f44f9)

### Coach
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/d0aa629d-1f12-40c3-aad6-e14e7545141e)

### Admin (Em fase de ajuste/modelagem provisoria)
![image](https://github.com/Gabriel-Alves02/MatchSquad/assets/5949045/b9f623df-694c-424f-a79a-044da85d45d5)

### Diagrama E/R
![Modelo_Entidade_Relacionamento_Trabalho](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/cf9911cd-e2d6-4996-9504-a48902edc9af)

### Modelo Lógico
![Modelo_Lógico_Atualizado_Trabalho](https://github.com/Gabriel-Alves02/MatchSquad/assets/161254104/9fc0933a-ad57-497e-8ca0-ffa1d7839e23)

# Protótipo em baixa fidelidade:

https://www.figma.com/file/duECfgkcSOjXFHZnNDrTCz/Untitled?type=design&node-id=0%3A1&mode=design&t=M5zaaqJTc3UVJnM2-1

https://www.figma.com/file/2fs2UONimMNqprCcBRt3nG/FlowOverview?type=design&node-id=0-1&mode=design&t=TAtH0ZcOd7c5IVOH-0

# Protótipo em alta fidelidade:

O protótipo se encontra na pasta Docs/Alta Fidelidade, a qual contêm pastas com os fluxos de cada ator do sistemas, separadamente.
