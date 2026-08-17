# CircuitJS1 — código de terceros

Este directorio contiene un **build estático de terceros**, no código propio
de SIGCT-Rural. Es el simulador de circuitos CircuitJS1 (Paul Falstad,
adaptado a navegador por Iain Sharp y colaboradores), auto-hospedado bajo
nuestro propio origen para satisfacer el requisito de mismo-origen de su
interfaz JS documentada (`getNodeVoltage`, `sim.onupdate`, etc. — ver
`doc/js-interface.html` en este mismo directorio).

- **Origen:** https://github.com/pfalstad/circuitjs1
- **Commit exacto compilado:** `c0b264e462fb8935c09b0e2a4dfa884debbde6b5` (2026-08-02)
- **Licencia:** GNU General Public License v2.0 (ver `LICENSE.txt` en este
  mismo directorio — texto verbatim del repo de origen, sin modificar).
- **Cómo se generó este build:** el repo de origen NO commitea el módulo GWT
  compilado (`war/circuitjs1/` está en su propio `.gitignore`) ni publica
  releases con binarios. Se generó localmente, una sola vez, corriendo el
  `circuitjs1.Containerfile` que el propio repo trae (`gradle compileGwt &&
  gradle makeSite`, dentro de un contenedor Docker aislado), y copiando el
  directorio `site/` resultante tal cual a esta ubicación. Ver
  `docs/local/MOVEMENT_LOG.md` para el registro de esta operación.
- **Nada de este directorio fue escrito ni modificado por SIGCT-Rural.** Si
  hace falta actualizar la versión de CircuitJS1, se repite el mismo proceso
  de build contra un commit más nuevo del repo de origen, no se edita nada
  acá a mano.
