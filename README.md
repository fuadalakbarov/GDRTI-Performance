# GDRTI Performans İdarəetmə Sistemi

Sektorlar → işçilər (şəkil, avtomatik bal) → tapşırıq təyinatı → mesajlaşma → kalendar.

## 1. Supabase qurulumu
1. supabase.com-da yeni layihə yaradın.
2. SQL Editor-da `db/schema.sql` faylının tam məzmununu işə salın (sektorları da yaradır).
3. Settings → API-dan `Project URL` və `service_role` açarını götürün.

## 2. Lokal qurulum
```
npm install
cp .env.example .env
# .env-də SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET doldurun
npm start
```
`http://localhost:3000` açılır.

## 3. İlk admin (rəhbər) yaratmaq
Serveri işə saldıqdan sonra bir dəfəlik bu sorğunu göndərin (Postman, ya da terminal):
```
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Fuad Alakbarov","email":"admin@gdrti.az","password":"GucluSifre123","role":"admin"}'
```
Sonra bu email/şifrə ilə `/index.html`-dən daxil olun. Admin panelindən (Sektorlar səhifəsindən) qalan işçiləri əlavə edə bilərsiniz — ya birbaşa Supabase Table Editor-dan `employees` cədvəlinə (şifrəni bcrypt ilə hash edərək), ya da eyni `/api/auth/register` endpointini `role:"employee"` ilə çağıraraq.

> Qeyd: `/api/auth/register` hazırda açıqdır (asan test üçün). Canlıya keçəndə bu route-u admin tokeni tələb edəcək şəkildə bağlamaq lazımdır (`middleware/auth.js`-dəki `verifyToken, requireAdmin`-i `routes/auth.js`-də `/register`-ə əlavə edin).

## 4. Google ilə işçi girişi (Supabase Auth)

İşçilər öz Gmail hesabları ilə birbaşa qeydiyyatdan keçə bilər. Bunun üçün:

### a) Google Cloud tərəfi
1. [console.cloud.google.com](https://console.cloud.google.com) → yeni layihə (və ya mövcud).
2. **APIs & Services → OAuth consent screen** → "External" seç, doldur, saxla.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → tip: "Web application".
4. **Authorized redirect URIs**-ə əlavə et: `https://<SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback` (Supabase Auth Providers səhifəsində bu URL hazır göstərilir, oradan kopyala).
5. Client ID və Client Secret-i saxla.

### b) Supabase tərəfi
1. Supabase Dashboard → **Authentication → Providers → Google** → aktiv et.
2. Google Client ID və Client Secret-i yapışdır, saxla.
3. **Authentication → URL Configuration → Redirect URLs**-ə Render domenini əlavə et:
   `https://sizin-render-domeniniz.onrender.com/index.html`

### c) Layihə tərəfi
1. Push et, Render yenidən deploy etsin. (Frontend Google API-larla birbaşa əlaqə saxlamır — hər şey backend vasitəsilə olur, `supabase-config.js`-ə ehtiyac yoxdur.)

### Necə işləyir? (whitelist prinsipi — PTPK-dakı kimi)
- Admin panelində **"➕ İşçi əlavə et"** basıb işçinin adını və Gmail ünvanını yazırsan (sektoru dərhal, ya da sonra təyin edə bilərsən). Şifrə lazım deyil.
- İşçi login səhifəsində **"📱 QR kod ilə daxil ol"** kodu telefonla skan edir, açılan səhifədə öz Gmail-i ilə daxil olur.
- **Yalnız admin əvvəlcədən əlavə etdiyi email-lər daxil ola bilər** — naməlum Google hesabı ilə cəhd edilsə, sistem rədd edir ("Bu email üçün icazə yoxdur").
- Sektoru təyin olunmamış işçilər admin panelində **"⏳ Sektoru gözləyən işçilər"** bölməsində görünür.
- Google profil şəkli avtomatik `photo_url` kimi götürülür.

### QR kod ilə giriş (WhatsApp Web məntiqi)
Login səhifəsində QR kod avtomatik göstərilir. İstifadəçi telefonla skan edir, açılan `qr-confirm.html` səhifəsində öz email/şifrəsi (admin) və ya whitelist-də olan Gmail-i ilə təsdiqləyir — kompüter avtomatik daxil olur. Bu, real dövlət SİMA/ASAN imza sisteminə qoşulma deyil (rəsmi dövlət API girişi tələb edir), sadəcə eyni cross-device UX-i öz sistemimizdə təkrarlayır. `qr_sessions` cədvəli 3 dəqiqədən sonra kodu etibarsız sayır.

## 5. Render-də deploy
Bağça Monitoring ilə eyni üsul:
1. GitHub-a push edin.
2. Render → New Web Service → repo seçin.
3. Build Command: `npm install`, Start Command: `npm start`.
4. Environment Variables bölməsində `.env`-dəki 3 dəyişəni əlavə edin.

## Yeni əlavələr (3-cü mərhələ)

- **Sərbəst məktublaşma** — artıq təkcə admin yox, hər bir işçi istənilən başqa işçiyə (admin daxil) rəsmi məktub göndərə bilər. Bütün sektora broadcast yalnız admin üçün qalıb.
- **Fayl əlavəsi (PDF/Word)** — məktuba fayl əlavə etmək mümkündür (maks. ~5MB, base64 kimi DB-də saxlanılır, ayrıca fayl saxlama xidməti lazım deyil).
- **Məktub şərhləri** — hər məktubun altında iştirakçılar (göndərən, alan, sektor üzvləri, admin) canlı şərh yaza, öz şərhini redaktə/silə bilər.
- **Resurslar bölməsi** (`resources.html`) — hər kəs şablon/material yükləyə bilər (kateqoriya ilə, filtrlənə bilən), hamı görüb endirə bilər.

Yeni DB dəyişikliyi lazımdır — Supabase SQL Editor-da **`db/migration_letters_v2.sql`**-ı işə sal (yeni quraşdırmalarda `schema.sql` onsuz da yenilənib).

## Yeni əlavələr (2-ci mərhələ)

- **Rəsmi məktublar** (`letters.html`) — admin bir işçiyə ya bütün sektora rəsmi məktub göndərir, işçi "Məktublarım"da oxuyur. Yeni Supabase DB dəyişikliyi lazımdır — `db/migration_letters.sql`-ı SQL Editor-da işə sal (yeni quraşdırmalarda `schema.sql` onsuz da yenilənib).
- **Profil şəkli** (`profile.html`) — hər kəs öz şəklini yükləyə bilər (kompüterdə kiçildilib base64 kimi saxlanılır, ayrıca fayl saxlama xidməti lazım deyil).
- **Üzən mesaj widget-i** — bütün səhifələrdə sağ-alt küncdə (FB Messenger üslubu), ayrıca səhifəyə keçmək lazım deyil, `public/js/chat-widget.js`-dən idarə olunur.
- **Tapşırıq xatırlatması** — admin gecikmiş/gözləyən tapşırıq üçün "🔔 Xatırlat" basanda işçiyə avtomatik mesaj gedir.
- **Deadline vurğusu** — son tarixi keçmiş tapşırıqlar qırmızı, bu gün bitənlər narıncı görünür (həm admin, həm işçi görünüşündə).
- **Avtomatik kalendar** — son tarixli tapşırıq yaradılanda avtomatik kalendar hadisəsi əlavə olunur.

## Struktur
```
server.js              — əsas Express server
routes/auth.js          — login, qeydiyyat
routes/sectors.js       — sektor performans hesabatı
routes/employees.js     — işçi profili
routes/tasks.js         — tapşırıq təyinatı, status, keyfiyyət balı
routes/messages.js      — mesajlaşma
routes/calendar.js      — kalendar hadisələri
routes/_points.js        — avtomatik bal hesablama düsturu
db/schema.sql           — Supabase SQL sxemi
public/                 — bütün frontend (login, admin, işçi paneli, mesaj, kalendar)
```

## Bal düsturu (avtomatik)
- Vaxtında tamamlanan tapşırıq: 10 bal
- Gecikərək tamamlanan: 6 bal
- Keyfiyyət balı verilibsə (0-100), bal ona mütənasib azalır/qalır (məs. keyfiyyət 80 → 10×0.8=8 bal)
- Açıq qalıb vaxtı keçən (overdue) tapşırıq: -3 bal
- Sektor balı = o sektordakı bütün işçilərin orta balı

Bu düstur `routes/_points.js`-də bir yerdə saxlanılıb — dəyişmək istəsəniz təkcə o faylı redaktə edin.
