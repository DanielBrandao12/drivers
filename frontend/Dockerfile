# Usa a imagem do Node.js como base
FROM node:latest AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos necessários para instalar as dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia todo o código do frontend para o container
COPY . .

# Constrói a aplicação para produção
RUN npm run build

# Usa o servidor Nginx para servir os arquivos estáticos
FROM nginx:alpine AS production

# Copia os arquivos buildados do estágio anterior para o Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponha a porta que o Nginx usa
EXPOSE 80

# Comando padrão do Nginx
CMD ["nginx", "-g", "daemon off;"]
