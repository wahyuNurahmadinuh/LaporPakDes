FROM ubuntu:24.04
RUN apt-get update && apt-get install -y nodejs npm

RUN npm install -g http-server

# Buat folder kerja untuk aplikasi
WORKDIR /usr/apps/LaporPakDes

COPY . .

EXPOSE 8080
CMD ["http-server", "-p", "8080"]
