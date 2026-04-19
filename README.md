# EventHub API (Backend Projesi)

## Proje Özeti
Bu proje, güvenli, ölçeklenebilir ve performanslı bir backend altyapısı sunmak amacıyla geliştirilmiş Node.js, **NestJS** ve **PostgreSQL** tabanlı bir RESTful API sistemidir. Proje, veri erişim katmanı olarak **Prisma ORM**'i kullanmaktadır. Kullanıcı yönetimi, rol tabanlı yetkilendirme ve karmaşık veri modellemeleri gibi temel iş gereksinimlerini sağlam ve esnek bir mimariyle karşılamak üzere tasarlanmıştır.

## Özellikler
- **Kimlik Doğrulama:** Passport ve JWT (JSON Web Token) tabanlı güvenli giriş/kayıt sistemi.
- **Yetkilendirme:** Kullanıcı rollerine göre erişim kontrolü (Role-Based Access Control).
- **CRUD Operasyonları:** Temel veri varlıkları üzerinde standart oluşturma, okuma, güncelleme ve silme işlemleri.
- **İlişkisel Veritabanı:** PostgreSQL ve Prisma ORM ile yapılandırılmış sağlam veritabanı modeli ve tip güvenliği.
- **Güvenlik & Stabilite:** Throttler (Rate-limiting), bcrypt (Şifre şifreleme) ve çeşitli güvenlik optimizasyonları.
- **Arka Plan Görevleri:** NestJS Schedule (Cron jobs) ile zamanlanmış görevlerin yönetimi.
- **E-posta Entegrasyonu:** Nodemailer / Mailer modülü ile otomatik e-posta gönderimi.

## Teknolojiler
- **Çalışma Ortamı:** Node.js
- **Framework:** NestJS
- **Veritabanı:** PostgreSQL
- **ORM Katmanı:** Prisma ORM
- **Güvenlik / Auth:** @nestjs/passport, @nestjs/jwt, bcrypt, Throttler
- **Diğer:** TypeScript, class-validator, class-transformer

## Mimari
Uygulama, NestJS'in sunduğu güçlü bağımlılık enjeksiyonu (Dependency Injection) yapısı ile modüler olarak tasarlanmıştır:
- **Modules:** Uygulama özelliklerini bağımsız parçalara ayırır (AuthModule, UsersModule vb.).
- **Controllers:** HTTP isteklerini (routes) yönetir.
- **Services:** Çekirdek iş mantığını barındırır.
- **Guards / Interceptors:** Kimlik doğrulama kontrolleri (JWT Guard vb.) ve istek/yanıt yaşam döngüsüne müdahale için kullanılır.
- **PrismaService:** Veritabanı ile etkileşimi yönetir.

## Veritabanı Şeması
Prisma şeması veritabanı yapısını `schema.prisma` dosyasında tanımlar. Temel olarak aşağıdaki gibidir:
- **Kullanıcılar (User):** E-posta, şifre hash'leri ve yetki düzeylerini barındırır.
- **Etkinlikler (Event vb.):** Projede işlenen diğer temel veriler ve bire-çok (1-N) ilişkiler.

## API Uç Noktaları
Sistemin bazı temel uç noktaları şunlardır (Modüler yapıya göre şekillenir):
- `POST /auth/register` — Yeni kullanıcı hesabı oluşturur.
- `POST /auth/login` — Kullanıcı girişi yapar ve yetkilendirme bazlı JWT döner.
- `GET /users` — Sisteme kayıtlı kullanıcıları listeler (Sadece Admin yetkisi gerektirir).
- `GET /events` — Tüm etkinlik verilerini listeler.

## Örnek İstekler
**Başarılı Bir Giriş (Login) İsteği:**
```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "user@example.com", "password": "securepassword123"}'
```
**Başarılı Yanıt:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

## Kurulum
Projeyi yerel geliştirme ortamınızda çalıştırmak için:

1. Depoyu klonlayın:
```bash
git clone https://github.com/username/eventhub-api.git
cd eventhub-api
```
2. Gerekli bağımlılıkları yükleyin:
```bash
npm install
```
3. Ortam değişkenlerini ayarlayın (Bkz. Çevresel Değişkenler kısmı).
4. Prisma ile veritabanı tablolarını oluşturun ve şemaları senkronize edin:
```bash
npx prisma generate
npx prisma db push
```
*(Alternatif olarak `npx prisma migrate dev` komutu da kullanılabilir).*
5. Geliştirme sunucusunu başlatın:
```bash
npm run start:dev
```

## Çevresel Değişkenler
Projenin kök dizininde (Mümkünse `.env.example` referansıyla) bir `.env` dosyası oluşturun ve değerleri kendi yerel geliştirme kurulumunuza göre doldurun:
```env
PORT=<SUNUCU_PORTU>
DATABASE_URL=<VERITABANI_BAGLANTI_URL_ADRESI>
JWT_SECRET=<JWT_GIZLI_ANAHTARI>
JWT_EXPIRES_IN=<GECERLILIK_SURESI_ORN_1d>
```

## Test
Sistemin farklı birimlerinin beklendiği gibi çalışıp çalışmadığını test etmek için (NestJS üzerinden Jest altyapısı ile):
```bash
npm run test         # Unit testler
npm run test:e2e     # E2E testleri
```

## Öğrenimler
Bu projeyi geliştirirken edinilen temel kazanımlar:
- **NestJS Mimarisini Kavrama:** Bağımlılık Enjeksiyonu, Modüler mimari, Decorators (Guard, Interceptor) yapılarının etkili kullanımı.
- **Tip Güvenliği ve Prisma ORM:** Prisma ORM kullanarak TypeScript ile end-to-end type safety sağlanması ve karmaşık sorguların yapılandırılması.
- **Güvenlik Standartları:** Passport entegrasyonuyla JWT yönetimi, rate limiting, şifre korunumu (bcrypt) gibi ileri düzey güvenlik pratikleri.
- **Kapsamlı Test Stratejisi:** Jest ve Supertest araçlarıyla uygulamayı izole ve uçtan uca (E2E) test etme prensipleri.
