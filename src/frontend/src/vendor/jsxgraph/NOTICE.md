# JSXGraph — procedencia y licencias

Motor visual oficial del Laboratorio Matemático del MMC.

## Qué se vendoriza

| Fichero | Origen | Modificado |
|---|---|---|
| `jsxgraph.css` | `node_modules/jsxgraph/distrib/jsxgraph.css` | **No** — copia literal, cabecera de copyright intacta |
| `LICENSE.MIT` | `node_modules/jsxgraph/distrib/LICENSE.MIT` | No |
| `LICENSE.LGPL` | `node_modules/jsxgraph/distrib/LICENSE.LGPL` | No |

El **código** de JSXGraph NO se vendoriza: se importa como dependencia npm
(`import JXG from 'jsxgraph'`). Solo se vendoriza el CSS porque el `exports`
del paquete no expone subrutas (`ERR_PACKAGE_PATH_NOT_EXPORTED`) y porque
necesitamos una copia estable y same-origin.

## Versión

`1.13.3` — verificado en `node_modules/jsxgraph/package.json` el 2026-09-30.

## Licencia

JSXGraph es software libre con **licencia dual**:

- **GNU LGPL** v3 o posterior
- **MIT**

Declarada en `package.json` como SPDX: `(MIT OR LGPL-3.0-or-later)`.

SIGCT-Rural usa la **rama MIT**, que no impone copyleft, ni share-alike, ni
restricciones de uso comercial. El `LICENSE.MIT` se conserva íntegro junto al
código como exige la licencia.

Motivo de esta decisión: la licencia MIT es coherente con la dirección del
proyecto. GeoGebra queda fuera del camino crítico del MMC porque su producto y
sus servicios web se distribuyen **solo para uso no comercial**, lo que no
alinea con el futuro de SIGCT-Rural.

## Autoría

Copyright 2008-2026: Matthias Ehmann, Michael Gerhaeuser, Carsten Miller,
Bianca Valentin, Andreas Walter, Alfred Wassermann, Peter Wilfahrt.
Licencia: <https://opensource.org/licenses/MIT/>

## Nota sobre los estilos

`jsxgraph.css` declara `.jxgbox { background-color: #fff; border-color: #356aa0 }`,
que rompería el tema oscuro del MMC. **Ese fichero NO se edita**: las reglas de
tema se sobreescriben con mayor especificidad desde
`src/labs/mmc/theme/mmcWorkbench.css`, de modo que el original permanece
intacto y auditable.

## Referencia

- Proyecto: <https://github.com/jsxgraph/jsxgraph>
- Documentación: <https://jsxgraph.org/docs/>