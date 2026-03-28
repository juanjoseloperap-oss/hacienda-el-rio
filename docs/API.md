# API principal

Base URL local: `http://localhost:4000/api`

## Autenticación
### POST `/auth/login`
Body:
```json
{ "email": "admin@elrio.com", "password": "Admin123*" }
```
Respuesta:
```json
{ "token": "...", "user": { "id": "...", "name": "Administrador El Río", "role": "admin" } }
```

## Dashboard
### GET `/dashboard/summary`
Devuelve animales por categoría, por ubicación, insumos bajos, ventas semanales y costos semanales.

## Animales
### GET `/animals`
Lista animales.

### POST `/animals`
```json
{
  "animal_code": "ER-010",
  "animal_name": "Brisa",
  "sex": "female",
  "birth_date": "2025-09-12",
  "identification_type": "individual",
  "current_category": "heifer",
  "breed": "Brahman"
}
```

## Sanidad
### GET `/health`
Lista historial sanitario.

### POST `/health`
```json
{
  "animal_code": "ER-010",
  "event_type": "vaccine",
  "medicine_name": "Clostridial",
  "dose": "5 ml",
  "event_date": "2026-03-28"
}
```

## Pesajes
### GET `/weights`
Lista pesajes recientes.

### POST `/weights`
```json
{
  "animal_code": "ER-010",
  "weight_kg": 311.4,
  "weighed_at": "2026-03-28",
  "notes": "Control mensual"
}
```

## Movimientos
### GET `/movements`
Lista movilizaciones internas.

### POST `/movements`
```json
{
  "animal_code": "ER-010",
  "to_location_id": 2,
  "moved_at": "2026-03-28",
  "reason": "Rotación de potrero"
}
```

## Transacciones
### GET `/transactions`
Lista compras/ventas.

### POST `/transactions`
```json
{
  "transaction_type": "sale",
  "animal_code": "ER-010",
  "quantity": 1,
  "unit_price": 2200,
  "total_amount": 2200,
  "transaction_date": "2026-03-28",
  "counterpart": "Frigorífico XYZ"
}
```

## Reproducción
### GET `/reproduction`
Lista eventos reproductivos.

### POST `/reproduction`
```json
{
  "event_type": "mating",
  "female_code": "ER-001",
  "male_code": "ER-002",
  "event_date": "2026-03-28",
  "expected_birth_date": "2026-12-30"
}
```

## Insumos
### GET `/supplies`
Lista insumos.

### POST `/supplies`
```json
{
  "item_name": "Vacuna aftosa",
  "item_type": "medicine",
  "unit": "frascos",
  "current_stock": 5,
  "reorder_level": 3,
  "unit_cost": 30
}
```

## Usuarios
### GET `/users`
Solo admin.

### POST `/users`
Solo admin.

## Reportes
### GET `/reports/weekly`
JSON consolidado semanal.

### GET `/reports/weekly.pdf`
Descarga PDF.

### GET `/reports/weekly.xlsx`
Descarga Excel.
