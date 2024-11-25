# Usando a imagem oficial do Node.js
FROM node:latest

# Definindo o diretório de trabalho
WORKDIR /app

# Copiando os arquivos para dentro do contêiner
COPY . .

# Instalando as dependências
RUN npm install

# Compilando o TypeScript
RUN npm run build

# Expondo a porta
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["npm", "start"]
