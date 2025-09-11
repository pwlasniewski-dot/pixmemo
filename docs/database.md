# PixMemo — Model danych (Postgres, MVP)

## Konwencje
- Klucze: `uuid`.
- Czas: `timestamptz` (UTC).
- Kwoty: **integer** w groszach (374 PLN = 37400).

## Tabele
### users
- id (uuid, pk)
- email (citext, unique)
- password_hash (text, null jeśli oauth)
- role (enum: `client` | `photographer` | `admin`)
- created_at (timestamptz)
- last_login_at (timestamptz)

### photographers
- id (uuid, pk)
- user_id (uuid, fk→users.id unique)
- full_name (text)
- city (text)
- bio (text)
- verified (bool, default false)
- verification_level (enum: `none` | `id_check` | `video_call`)
- rating_avg (numeric(3,2) default 0)
- rating_count (int default 0)
- primary_photo_url (text)
- created_at (timestamptz)

### packages
- id (uuid, pk)
- photographer_id (uuid, fk, index)
- name (text)
- price_pln (int)  // lub price_grosz (int)
- description (text)
- is_active (bool default true)

### availability
- id (uuid, pk)
- photographer_id (uuid, fk)
- date (date, index (photographer_id, date))
- slots (jsonb) // ["10:00","12:00","17:30"]

### bookings
- id (uuid, pk)
- client_user_id (uuid, fk→users.id)
- photographer_id (uuid, fk→photographers.id)
- package_id (uuid, fk→packages.id)
- date (date)
- time (time)
- address_street (text)
- address_postal (text)
- address_city (text)
- distance_km (numeric(6,2))
- travel_cost_pln (int)
- price_base_pln (int)
- discount_pct (int) // 0/5/10/15
- price_final_pln (int)
- status (enum: `pending` | `awaiting_payment` | `confirmed` | `done` | `cancelled`)
- payment_provider (enum: `stripe` | `p24` | `none`)
- payment_intent_id (text)
- created_at (timestamptz)
- updated_at (timestamptz)

### reviews
- id (uuid, pk)
- booking_id (uuid, fk unique)
- rating (int check 1..5)
- comment (text)
- created_at (timestamptz)

### photographer_documents
- id (uuid, pk)
- photographer_id (uuid, fk)
- doc_type (enum: `id` | `nip` | `selfie_with_id`)
- file_url (text)
- status (enum: `uploaded` | `approved` | `rejected`)
- reviewed_by_admin_id (uuid, fk users.id, null)
- reviewed_at (timestamptz, null)

### audit_log
- id (uuid, pk)
- actor_user_id (uuid, null)
- action (text) // np. BOOKINGS_CREATE, PAYMENT_WEBHOOK
- entity (text) // bookings:uuid
- payload (jsonb)
- created_at (timestamptz)

## Indeksy kluczowe
- `idx_users_email_unique`
- `idx_photographers_city`
- `idx_bookings_photographer_date_time`
- `idx_availability_photographer_date`

## Migracje
- Narzędzie: Prisma Migrate.
- Naming: `YYYYMMDDHHmm__short_description`.
