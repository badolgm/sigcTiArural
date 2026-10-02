import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * MmcEquation — tipografía matemática del MMC.
 *
 * POR QUÉ KaTeX Y NO EL MOTOR: JSXGraph no renderiza LaTeX. La frontera queda
 * deliberadamente así: React y KaTeX son dueños del TEXTO, JSXGraph es dueño de
 * la GEOMETRÍA. La ecuación vive fuera del tablero, junto a los controles, que es
 * además donde el usuario la lee.
 *
 * `throwOnError:false` es obligatorio en este laboratorio: una expresión que el
 * usuario está escribiendo a medias no puede romper el árbol de React. KaTeX
 * marca el fragmento inválido y sigue.
 *
 * KaTeX se declara como dependencia directa del proyecto a propósito. Estaba en
 * el árbol solo de forma transitiva (vía mermaid): importarlo sin declararlo sería
 * una dependencia fantasma que rompería en cuanto mermaid cambiara su árbol.
 */
const MmcEquation = ({ tex, display = false, className = '', ariaLabel }) => {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
        strict: false,
        trust: false
      });
    } catch (err) {
      // Estado honesto: si KaTeX no puede, se muestra el texto plano, no un hueco.
      console.warn('[MMC/equation] KaTeX no pudo renderizar:', err);
      return null;
    }
  }, [tex, display]);

  if (html === null) {
    return (
      <span className={`mmc-eq-fallback ${className}`} title="KaTeX no pudo renderizar esta expresión">
        {tex}
      </span>
    );
  }

  return (
    <span
      className={`mmc-eq-render ${className}`}
      // KaTeX genera HTML desde una cadena que construimos nosotros, con
      // throwOnError:false y trust:false: no hay entrada del usuario en el TeX
      // sin sanear de forma explícita, y KaTeX escapa lo que no entiende.
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={ariaLabel}
    />
  );
};

export default MmcEquation;