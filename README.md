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

