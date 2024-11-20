# I'm finishing this README later...

# UniDrive 🚗

Este projeto é um protótipo de aplicativo de caronas desenvolvido como projeto acadêmico. Este sistema foi criado para ajudar estudantes a organizar e marcar caronas de forma prática e sustentável.  

---

## Descrição do Projeto  

O UniDrive é um site desenvolvido com **Node.js** e **PostgreSQL** que permite que estudantes:  
- **Ofereçam caronas:** Informando os detalhes da viagem, como horário e local de saída.  
- **Busquem caronas:** Encontrando motoristas que vão para o mesmo destino.  

A principal motivação é reduzir a quantidade de automóveis em circulação e contribuir para a diminuição da emissão de gases, promovendo um impacto ambiental positivo. O destino das caronas é sempre a faculdade, facilitando a integração entre os alunos.  

O projeto visa alinhar-se com dois dos Objetivos de Desenvolvimento Sustentável da ONU: a ODS11, que busca criar cidades e comunidades sustentáveis e a ODS13, que busca ações que atenuem a mudança global do clima.

---

## Tecnologias Utilizadas  

- **Back-end:** Node.js (Express.js)  
- **Banco de Dados:** PostgreSQL  
- **Template Engine:** EJS

---

## Funcionalidades Principais  

1. **Cadastro e login de usuários:**  
   - Cada usuário pode se cadastrar como motorista ou passageiro.  

2. **Sistema de caronas:**  
   - Motoristas podem criar ofertas de carona.  
   - Passageiros podem buscar e solicitar caronas disponíveis.  

3. **Interface simples e intuitiva:**  
   - Design pensado na usabilidade, permitindo que o sistema seja facilmente utilizado por qualquer aluno.  

---

## Teste Você Mesmo

1. **Clone o repositório ou baixe o arquivo ZIP**
2. **Instale as dependências:**
```bash
npm install
```
3. **Crie um arquivo .env na raiz do projeto e configure as variáveis de ambiente**
```bash
# Porta do servidor, se não for especificada, usará a porta 3000
PORT=sua_porta

# Variáveis do banco de dados
DB_HOST="localhost"
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

# Open Weather API Key
OPEN_WEATHER_KEY=sua_chave

# Google Maps API KEY
GOOGLE_MAPS_KEY=sua_chave
```
4. **Inicie o servidor**
```bash
node index.js
```

---

## Melhorias, Novas Funcionalidades e Bugs

1. **Melhorias**
   - Tornar a interface mais atrativa e intuitiva.
   - Uma requisição é feita ao Open Weather API a todo momento que uma página que exiga dados do clima é carregada, seria válido reaizar uma verificação do número de requisições para os casos em que os dados pertinentes já foram acessados, evitando assim requisições redundantes.
   - Alguns alunos têm aulas tanto de manhã quanto a noite, seria válido implementar uma lógica que suporte esses casos.
   - A lógica atual (20/11/2024) não válida os dados inseridos durante o cadastro e isso pode compremeter o funcionamento do programa.
   - Melhorar a implementação do HTML.
2. **Novas Funcionalidades**
   - Tornar o site responsivo.
   - Criar uma forma do usuário alterar os dados inseridos durante o cadastro.
   - Criar uma forma do usuário cancelar a viagem em que está registrado.
   - Criar uma forma do usuário recadastrar suas aulas.
   - Criar a possibilidade de cadastrar-se em mais de uma viagem.
4. **Bugs**
   - Durante os testes, era comum surgir erros ao tentar adquirir dados da Open Weather API, mas acredito que isso apenas seja um problema na comunicação com os servidores.
   - Na página de perfil, caso a página seja recarregada o site irá "crashar", não investiguei o problema a fundo mas provavelmente a causa seja a obtenção dos dados do perfil que está sendo visto.
   - ... 

---

## Imagens

Abaixo selecionei quatro imagens de algumas páginas do projeto que demonstram algumas das funcionalidades.

![Home1](./images/home1.png)
![Home2](./images/home2.png)
![Rides](./images/rides.png)
![Profile](./images/profile.png)

---

