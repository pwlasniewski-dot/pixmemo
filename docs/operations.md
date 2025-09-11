# PixMemo — Operacje / Runbook (MVP)

## Konta i panele
- Stripe Dashboard — płatności, webhook logi, Apple/Google Pay.  
- Przelewy24 Panel — transakcje, webhook.  
- Resend — logi e-mail.  
- Hosting (Vercel/Render) — deploye i logi BE/FE.  
- DB (Neon/Supabase) — kopie zapasowe, inspekcja danych.

## Procedury
- **Awaria płatności**: sprawdź webhooki i sygnatury → ręczna zmiana statusu w Admin Panel (po potwierdzeniu w panelu operatora).
- **Zgłoszenie RODO (usunięcie)**: anonimizacja użytkownika, zachowanie danych księgowych (jeśli wymagane).
- **Nadużycie**: zawieszenie Fotografa, komunikacja do klientów, backup dowodów (logi audytowe).
