# Cómo agregar nuevos laboratorios (sin borrar existentes)

Este catálogo usa una fuente de datos centralizada en `src/data/lab-data.js`.

Pasos para añadir contenido:

1. Abrir `src/data/lab-data.js` y editar el arreglo `labCategories`.
2. Para un **nuevo bloque de laboratorio** agrega un objeto con:
   - `title`: nombre visible de la categoría.
   - `accent`: color de acento en formato hex (ej. `#00e5ff`).
   - `icon`: emoji o carácter corto (opcional).
   - `links`: lista de enlaces simples (externos o internos).
   - `sections`: opcional, lista de sub-secciones con su propio `title`, `accent` y `links`.
3. En cada elemento de `links`:
   - Usa `{ label: 'Texto', href: 'https://...' }` para enlaces externos.
   - Usa `{ label: 'Texto', to: 'ruta-interna', internal: true }` para navegación interna.

Notas importantes:

- No borres categorías existentes; añade nuevas entradas para crecer el catálogo.
- Todos los enlaces externos se abren en nueva pestaña con `target="_blank"` y `rel="noreferrer"` para mayor seguridad.
- La grilla es responsiva (1/2/3 columnas) y acepta muchas tarjetas sin romper el layout.

Ejemplo mínimo de nueva categoría:

```js
labCategories.push({
  title: 'Nuevos Robots',
  accent: '#4fc3f7',
  icon: '🛠️',
  links: [
    { label: 'Repositorio Principal', href: 'https://example.org/robots' },
    { label: 'Abrir Lab Interno', to: 'lab-robots-nuevos', internal: true },
  ],
});
```

Con esto, la tarjeta aparecerá automáticamente en `Laboratorios` sin modificar el componente `LabCatalog.jsx`.