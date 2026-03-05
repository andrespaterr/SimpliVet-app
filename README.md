# SimpliVet - Sistema de Gestion Veterinaria

## Deploy en Netlify

1. Sube este proyecto a GitHub
2. En Netlify: Add new site > Import from GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`

## Local

```bash
npm install
npm run dev
```

## Modulos

- Clientes (propietarios)
- Mascotas (vinculadas a clientes)
- Historial Medico (por mascota, con categorias)
- Servicios (genera ingreso automaticamente)
- Ingresos (automaticos + manuales)
- Egresos (con categorias)
- Reportes Financieros (con cierre de ciclos)
- Inventario (control de stock)
- Dashboard (estadisticas y graficos)
- Busqueda global
