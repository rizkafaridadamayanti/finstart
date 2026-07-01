\# API CONTRACT FINSTART



Dokumen ini menjadi kesepakatan nama data, endpoint, dan pembagian backend antara Orang 1 dan Orang 2.



\## 1. Informasi Dasar



\- Frontend: Vue + Vite

\- Backend: Laravel REST API

\- Database: MySQL

\- Base URL API lokal:



```text

http://127.0.0.1:8000/api

```



\- Format respons API:



```json

{

&#x20; "success": true,

&#x20; "message": "Berhasil",

&#x20; "data": {}

}

```



\---



\## 2. Master Data — Tugas Orang 1



\### A. Client



Endpoint:



```text

GET    /clients

POST   /clients

GET    /clients/{id}

PUT    /clients/{id}

DELETE /clients/{id}

```



Field data:



```text

id

company\_name

pic\_name

email

phone

industry

category

location

address

status

created\_at

updated\_at

```



Status client:



```text

active

inactive

```



\---



\### B. Project



Endpoint:



```text

GET    /projects

POST   /projects

GET    /projects/{id}

PUT    /projects/{id}

DELETE /projects/{id}

```



Field data:



```text

id

client\_id

project\_name

project\_code

contract\_value

status

start\_date

end\_date

description

created\_at

updated\_at

```



Status project:



```text

planning

ongoing

completed

cancelled

```



\---



\### C. Chart of Accounts / COA



Endpoint:



```text

GET    /accounts

POST   /accounts

GET    /accounts/{id}

PUT    /accounts/{id}

DELETE /accounts/{id}

```



Field data:



```text

id

code

name

type

normal\_balance

opening\_balance

status

created\_at

updated\_at

```



Jenis akun:



```text

asset

liability

equity

revenue

expense

```



Normal balance:



```text

debit

credit

```



Status akun:



```text

active

inactive

```



\---



\### D. Employee



Endpoint:



```text

GET    /employees

POST   /employees

GET    /employees/{id}

PUT    /employees/{id}

DELETE /employees/{id}

```



Field data:



```text

id

name

email

phone

position

salary

employment\_status

join\_date

created\_at

updated\_at

```



Status pegawai:



```text

active

inactive

```



\---



\### E. Company Settings



Endpoint:



```text

GET /company-settings

PUT /company-settings

```



Field data:



```text

id

company\_name

email

phone

address

npwp

currency

logo

created\_at

updated\_at

```



\---



\### F. Invoice Draft



Endpoint:



```text

GET    /invoices

POST   /invoices

GET    /invoices/{id}

PUT    /invoices/{id}

DELETE /invoices/{id}

```



Field data:



```text

id

client\_id

project\_id

invoice\_number

issue\_date

due\_date

total\_amount

status

notes

created\_at

updated\_at

```



Status invoice:



```text

draft

unpaid

partial

paid

overdue

cancelled

```



\---



\### G. Bill Draft



Endpoint:



```text

GET    /bills

POST   /bills

GET    /bills/{id}

PUT    /bills/{id}

DELETE /bills/{id}

```



Field data:



```text

id

vendor\_name

project\_id

bill\_number

bill\_date

due\_date

total\_amount

status

notes

created\_at

updated\_at

```



Status bill:



```text

draft

unpaid

partial

paid

overdue

cancelled

```



\---



\## 3. Proses Keuangan — Tugas Orang 2



\### A. Journal Entry



Endpoint:



```text

GET  /journals

POST /journals

GET  /journals/{id}

PUT  /journals/{id}

POST /journals/{id}/approve

POST /journals/{id}/post

```



Field jurnal utama:



```text

id

voucher\_number

transaction\_date

description

status

created\_by

approved\_by

posted\_at

created\_at

updated\_at

```



Status jurnal:



```text

draft

approved

posted

rejected

```



\---



\### B. Journal Lines



Setiap jurnal memiliki detail akun.



Field detail jurnal:



```text

id

journal\_entry\_id

account\_id

description

debit

credit

created\_at

updated\_at

```



Aturan wajib:



```text

Total debit harus sama dengan total credit.

Jurnal hanya boleh diposting jika status sudah approved.

Jurnal posted akan memengaruhi saldo akun.

```



\---



\### C. Invoice Payment



Endpoint:



```text

GET  /invoice-payments

POST /invoice-payments

GET  /invoice-payments/{id}

```



Field pembayaran invoice:



```text

id

invoice\_id

payment\_date

payment\_method

amount

reference\_number

notes

created\_at

updated\_at

```



Aturan:



```text

Jumlah pembayaran tidak boleh melebihi sisa tagihan invoice.

Jika invoice lunas, status invoice menjadi paid.

```



\---



\### D. Bill Payment



Endpoint:



```text

GET  /bill-payments

POST /bill-payments

GET  /bill-payments/{id}

```



Field pembayaran bill:



```text

id

bill\_id

payment\_date

payment\_method

amount

reference\_number

notes

created\_at

updated\_at

```



Aturan:



```text

Jumlah pembayaran tidak boleh melebihi sisa tagihan bill.

Jika bill lunas, status bill menjadi paid.

```



\---



\## 4. Dashboard dan Report — Tugas Orang 2



Endpoint dashboard:



```text

GET /dashboard/summary

```



Data dashboard:



```text

cash\_balance

total\_receivable

total\_payable

monthly\_income

monthly\_expense

net\_profit

active\_projects

overdue\_invoices

recent\_transactions

```



Endpoint laporan:



```text

GET /reports/profit-loss

GET /reports/balance-sheet

GET /reports/cash-flow

GET /reports/general-ledger

```



Parameter laporan:



```text

start\_date

end\_date

project\_id

account\_id

```



\---



\## 5. Aturan Integrasi Frontend



Frontend menggunakan endpoint API, bukan data dummy, setelah backend selesai.



```text

Client dan Project ditampilkan pada CRM dan Project.

COA ditampilkan pada General Ledger dan Transaction.

Invoice ditampilkan pada Receivable.

Bill ditampilkan pada Payable.

Journal dan Payment memengaruhi Dashboard serta Report.

```



\---



\## 6. Pembagian Tugas



\### Orang 1 — Aiinin



```text

UI/UX Figma

Master data Client

Master data Project

Master data COA

Master data Employee

Company Settings

Invoice Draft

Bill Draft

Dokumentasi UI dan User Manual

```



\### Orang 2 — Rizka



```text

Implementasi seluruh tampilan Vue dari desain UI/UX

Routing, komponen, form, tabel, modal, dan validasi frontend

Integrasi API menggunakan Axios dan Pinia

Jurnal debit-credit

Approval dan posting jurnal

Pembayaran invoice dan bill

Perhitungan saldo akun

Dashboard

Laporan keuangan

AI CFO rule-based

ERD, Data Dictionary, API Documentation, dan README

```



\---



\## 7. Alur Utama Sistem



```text

Client

→ Project

→ Invoice

→ Pembayaran Invoice

→ Jurnal Approved

→ Jurnal Posted

→ Saldo Akun Berubah

→ Dashboard dan Report Terupdate

```



Dokumen ini dapat diperbarui jika ada perubahan field atau alur sistem.

