FROM node:20

WORKDIR /usr/src/app

# Prisma ve package.json dosyalarını kopyala
COPY package*.json ./
COPY prisma ./prisma/

# Bağımlılıkları yükle (Debian tabanlı bu imaj Python/make gibi derleme araçlarını içerir)
RUN npm install

# Geri kalan kodları kopyala
COPY . .

# Prisma client'ı oluştur
RUN npx prisma generate

# Projeyi derle
RUN npm run build

# Uygulamanın çalışacağı port
EXPOSE 3000
#Veritabanını kurduğumuz anda içinin boş kalmamasını ve kodlarımızdaki Prisma model yapımızın anında tablolaştırılmasını sağlayan inşaat işçimizdir.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
