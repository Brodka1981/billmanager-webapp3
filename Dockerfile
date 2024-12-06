# Fase 1: Build dell'app Angular
FROM node:18 AS build
WORKDIR /app

# Copia i file di configurazione di npm e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia tutto il progetto Angular
COPY . .

# Compila l'app Angular in modalità produzione
RUN npm run build --prod

# Fase 2: Configura NGINX per servire i file statici
FROM nginx:stable-alpine

# Copia i file statici Angular generati nella directory di NGINX
COPY --from=build /app/dist/bill-manager-frontend/browser /usr/share/nginx/html

# (Opzionale) Copia una configurazione personalizzata di NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Esponi la porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
