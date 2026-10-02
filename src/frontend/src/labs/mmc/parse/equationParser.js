// MMC · Parser de ecuaciones.
//
// POR QUÉ EXISTE: la regla fundamental del pilar matemático es que el estudiante
// modele SIN PROGRAMAR. Eso exige traducir texto a función. La respuesta fácil es
// `new Function(...)`, y es incorrecta por dos motivos:
//
//   1. Seguridad: evalúa código arbitrario con los privilegios de la página.
//   2. Ciencia: un error de sintaxis produciría una excepción opaca en vez de un
//      mensaje que el usuario pueda corregir.
//
// Este módulo es un parser descendente recursivo con climbing de precedencias.
// Sin `eval`, sin `Function`, sin dependencias. Devuelve un AST y lo evalúa.
//
// INDEPENDIENTE DEL MOTOR: nada aquí importa JSXGraph ni Pyodide. El parser
// produce un AST; el CAS simbólico futuro puede consumir el MISMO texto o el
// mismo AST. Hoy produce una función numérica; mañana, SymPy.

// Variables libres del lenguaje: el usuario puede escribir `t`, `x`, `tau`, ...
// y también los nombres de los sliders. Cualquier identificador no reconocido se
// resuelve contra el ámbito que se le pase al evaluar, y si tampoco está ahí,
// se considera parámetro declarado y se reporta como faltante en vez de fallar.
const CONSTANTS = {
  pi: Math.PI,
  PI: Math.PI,
  e: Math.E,
  E: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2
};

const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  log10: Math.log10,
  log2: Math.log2,
  sqrt: Math.sqrt,
  abs: Math.abs,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max
};

// Nombres reservados: no pueden ser variable de usuario.
const RESERVED = new Set([...Object.keys(CONSTANTS), ...Object.keys(FUNCTIONS)]);

const isDigit = (ch) => ch >= '0' && ch <= '9';
const isAlpha = (ch) => /[A-Za-z_]/.test(ch);
const isAlnum = (ch) => /[A-Za-z0-9_]/.test(ch);
const isSpace = (ch) => ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';

/** Error de sintaxis con posición, para que el mensaje sea accionable. */
export class EquationSyntaxError extends Error {
  constructor(message, position, input) {
    const near = input ? ` (cerca de "${input.slice(Math.max(0, position - 6), position + 6)}")` : '';
    super(`${message}${near}`);
    this.name = 'EquationSyntaxError';
    this.position = position;
  }
}

/** Divide la entrada en fichas. */
function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (isSpace(ch)) {
      i += 1;
      continue;
    }

    if (isDigit(ch) || (ch === '.' && isDigit(input[i + 1]))) {
      const start = i;
      while (i < input.length && isDigit(input[i])) i += 1;
      if (input[i] === '.') {
        i += 1;
        while (i < input.length && isDigit(input[i])) i += 1;
      }
      // Notación exponencial: 1e-3
      if (input[i] === 'e' || input[i] === 'E') {
        const save = i;
        i += 1;
        if (input[i] === '+' || input[i] === '-') i += 1;
        if (isDigit(input[i])) {
          while (i < input.length && isDigit(input[i])) i += 1;
        } else {
          i = save;
        }
      }
      tokens.push({ type: 'number', value: Number(input.slice(start, i)), start });
      continue;
    }

    if (isAlpha(ch)) {
      const start = i;
      while (i < input.length && isAlnum(input[i])) i += 1;
      tokens.push({ type: 'ident', value: input.slice(start, i), start });
      continue;
    }

    if ('+-*/^(),'.includes(ch)) {
      tokens.push({ type: ch, value: ch, start: i });
      i += 1;
      continue;
    }

    throw new EquationSyntaxError(`Carácter no permitido: "${ch}"`, i, input);
  }

  tokens.push({ type: 'eof', value: null, start: input.length });
  return tokens;
}

/** Indica si una ficha puede empezar un operando (para el producto implícito). */
const startsOperand = (tok) => tok.type === 'number' || tok.type === 'ident' || tok.type === '(';

/**
 * Parser descendente recursivo.
 * produce nodos: {t:'num'} | {t:'var'} | {t:'const'} | {t:'fn'} |
 *                {t:'bin',op,l,r} | {t:'neg',a}
 */
function parseTokens(tokens, input) {
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (type) => {
    const tok = tokens[pos];
    if (tok.type !== type) {
      throw new EquationSyntaxError(`Se esperaba "${type}"`, tok.start, input);
    }
    return tokens[pos++];
  };

  // Los productos implícitos solo son válidos si no termina la expresión: así
  // `2x` es 2*x, pero un `)` no puede empezar un operando.
  function parsePrimary() {
    const tok = peek();

    if (tok.type === 'number') {
      next();
      return { t: 'num', v: tok.value };
    }

    if (tok.type === 'ident') {
      next();
      const name = tok.value;

      if (peek().type === '(') {
        next();
        const args = [];
        if (peek().type !== ')') {
          args.push(parseExpr());
          while (peek().type === ',') {
            next();
            args.push(parseExpr());
          }
        }
        expect(')');
        return { t: 'fn', name, args };
      }

      if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
        return { t: 'const', name };
      }
      // Un nombre de función sin paréntesis es un error frecuente de escritura.
      // Sin este aviso, `sin t` se reportaría como "parámetro sin declarar: sin",
      // que no ayuda a nadie a corregir lo que escribió.
      if (Object.prototype.hasOwnProperty.call(FUNCTIONS, name)) {
        throw new EquationSyntaxError(
          `"${name}" es una función: escríbela con paréntesis, por ejemplo ${name}(t)`,
          tok.start,
          input
        );
      }
      return { t: 'var', name };
    }

    if (tok.type === '(') {
      next();
      const inner = parseExpr();
      expect(')');
      return inner;
    }

    throw new EquationSyntaxError('Expresión incompleta', tok.start, input);
  }

  function parseUnary() {
    const tok = peek();
    if (tok.type === '+') {
      next();
      return parseUnary();
    }
    if (tok.type === '-') {
      next();
      return { t: 'neg', a: parseUnary() };
    }
    return parseImplicit();
  }

  // `^` es asociativo por la derecha: 2^3^2 = 2^(3^2).
  function parsePower() {
    const base = parsePrimary();
    if (peek().type === '^') {
      next();
      return { t: 'bin', op: '^', l: base, r: parseUnary() };
    }
    return base;
  }

  // Producto implícito: 2pi, 2x, 3sin(t), (t+1)(t-1).
  //
  // Liga MÁS FUERTE que `*` y `/`, que es la convención matemática: `1/2t`
  // significa 1/(2t), no (1/2)·t. Si se resolviera al revés, escribir una
  // fracción followed de una variable daría un resultado silenciosamente
  // equivocado, que es el peor modo de fallo posible en un laboratorio.
  function parseImplicit() {
    let left = parsePower();
    for (;;) {
      const tok = peek();
      if (startsOperand(tok)) {
        left = { t: 'bin', op: '*', l: left, r: parsePower() };
        continue;
      }
      return left;
    }
  }

  function parseTerm() {
    let left = parseUnary();

    // Solo multiplicación y división explícitas aquí.
    for (;;) {
      const tok = peek();
      if (tok.type === '*' || tok.type === '/') {
        next();
        left = { t: 'bin', op: tok.type, l: left, r: parseUnary() };
        continue;
      }
      return left;
    }
  }

  function parseExpr() {
    let left = parseTerm();
    for (;;) {
      const tok = peek();
      if (tok.type === '+' || tok.type === '-') {
        next();
        left = { t: 'bin', op: tok.type, l: left, r: parseTerm() };
        continue;
      }
      return left;
    }
  }

  const ast = parseExpr();
  if (peek().type !== 'eof') {
    throw new EquationSyntaxError('Sobró texto al final de la expresión', peek().start, input);
  }
  return ast;
}

/** Nombres libres que aparecen en el AST: los parámetros que hay que declarar. */
export function collectFreeVariables(ast, acc = new Set()) {
  if (!ast || typeof ast !== 'object') return acc;
  if (ast.t === 'var') acc.add(ast.name);
  if (ast.t === 'neg') collectFreeVariables(ast.a, acc);
  if (ast.t === 'bin') {
    collectFreeVariables(ast.l, acc);
    collectFreeVariables(ast.r, acc);
  }
  if (ast.t === 'fn') ast.args.forEach((arg) => collectFreeVariables(arg, acc));
  return acc;
}

/** Compila un AST en una función numérica. Lanza si falta un parámetro. */
export function evaluate(ast, scope = {}) {
  const missing = new Set();

  const evalNode = (node) => {
    switch (node.t) {
      case 'num':
        return node.v;
      case 'const':
        return CONSTANTS[node.name];
      case 'var': {
        if (Object.prototype.hasOwnProperty.call(scope, node.name)) return Number(scope[node.name]);
        missing.add(node.name);
        return NaN;
      }
      case 'neg':
        return -evalNode(node.a);
      case 'fn': {
        const impl = FUNCTIONS[node.name];
        if (!impl) {
          throw new EquationSyntaxError(`Función desconocida: "${node.name}"`, 0, '');
        }
        return impl(...node.args.map(evalNode));
      }
      case 'bin': {
        const l = evalNode(node.l);
        const r = evalNode(node.r);
        switch (node.op) {
          case '+':
            return l + r;
          case '-':
            return l - r;
          case '*':
            return l * r;
          case '/':
            return l / r;
          case '^':
            return Math.pow(l, r);
          default:
            return NaN;
        }
      }
      default:
        return NaN;
    }
  };

  const out = evalNode(ast);
  if (missing.size > 0) {
    const names = [...missing].join(', ');
    throw new EquationSyntaxError(
      `Parámetro sin declarar: ${names}. Defínelo con un deslizador o asígnalo en el ámbito.`,
      0,
      ''
    );
  }
  return out;
}

/** Devuelve el nombre del lado izquierdo si la entrada es `f(...) = ...`. */
export function assignmentName(input) {
  const text = String(input || '').trim();
  const eq = text.indexOf('=');
  if (eq === -1) return null;
  const lhs = text.slice(0, eq).trim();
  const m = lhs.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\([^)]*\))?$/);
  return m ? m[1] : null;
}

/** Quita el lado izquierdo `y(t)=`, `f(x) =`, etc. Devuelve solo el cuerpo. */
export function stripAssignment(input) {
  const text = String(input || '').trim();
  const eq = text.indexOf('=');
  if (eq === -1) return text;
  const lhs = text.slice(0, eq).trim();
  // Solo se descarta si el lado izquierdo parece un nombre de función.
  if (/^[A-Za-z_][A-Za-z0-9_]*\s*\([^)]*\)$/.test(lhs) || /^[A-Za-z_][A-Za-z0-9_]*$/.test(lhs)) {
    return text.slice(eq + 1).trim();
  }
  return text;
}

/**
 * Punto de entrada: texto → { fn, ast, free, expression }.
 * @param {string} input ecuación escrita por el usuario
 * @param {object} [scope] valores de los parámetros
 */
export function compileEquation(input, scope = {}) {
  const body = stripAssignment(input);
  if (!body) {
    throw new EquationSyntaxError('La ecuación está vacía', 0, String(input || ''));
  }
  const ast = parseTokens(tokenize(body), body);
  const free = [...collectFreeVariables(ast)].filter((name) => !RESERVED.has(name));
  return {
    ast,
    free,
    expression: body,
    lhs: assignmentName(input),
    fn: (t) => evaluate(ast, { ...scope, t, x: t, tau: t })
  };
}

// ---------------------------------------------------------------------------
// AST → LaTeX
//
// Se convierte el AST, nunca el texto original. Rehacer la expresión con
// sustituciones sobre la cadena (`*` → `\cdot`, `^` → `^{`) produce LaTeX
// inválido en cuanto hay un exponente o una constante con nombre: `sin` se
// renderizaría como s·i·n y `pi` como p·i. El AST ya sabe qué es qué.
// ---------------------------------------------------------------------------

const TEX_CONST = {
  pi: '\\pi',
  PI: '\\pi',
  tau: '\\tau',
  phi: '\\varphi',
  e: 'e',
  E: 'e'
};

const TEX_FN = {
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
  asin: '\\arcsin',
  acos: '\\arccos',
  atan: '\\arctan',
  sinh: '\\sinh',
  cosh: '\\cosh',
  tanh: '\\tanh',
  exp: '\\exp',
  log: '\\log',
  ln: '\\ln',
  log10: '\\log_{10}',
  log2: '\\log_{2}',
  sign: '\\operatorname{sgn}',
  round: '\\operatorname{round}',
  min: '\\min',
  max: '\\max'
};

// Funciones que necesitan delimitador propio en vez del paréntesis de llamada.
const TEX_DELIM = {
  sqrt: (a) => `\\sqrt{${a}}`,
  abs: (a) => `\\left|${a}\\right|`,
  floor: (a) => `\\left\\lfloor ${a}\\right\\rfloor`,
  ceil: (a) => `\\left\\lceil ${a}\\right\\rceil`
};

/** Precedencia TeX de un nodo: 3 átomo · 2 potencia/unario · 1 producto · 0 suma */
function texPrec(node) {
  if (!node) return 3;
  if (node.t === 'neg') return 2;
  if (node.t === 'bin') {
    if (node.op === '^') return 2;
    if (node.op === '*' || node.op === '/') return 1;
    return 0;
  }
  return 3;
}

function texNumber(value) {
  if (!Number.isFinite(value)) return '0';
  return String(Number(value.toFixed(10)));
}

function texInner(node) {
  switch (node.t) {
    case 'num':
      return texNumber(node.v);
    case 'const':
      return TEX_CONST[node.name] ?? `\\mathrm{${node.name}}`;
    case 'var':
      // Un símbolo suelto va en cursiva (A, f); un nombre largo necesita
      // \mathrm para que KaTeX no lo descomponga en letras individuales.
      return /^[A-Za-z_][A-Za-z0-9_]?$/.test(node.name) ? node.name : `\\mathrm{${node.name}}`;
    case 'neg':
      return `-${texAtLeast(node.a, 2)}`;
    case 'fn': {
      const args = node.args.map((a) => astToTex(a));
      if (TEX_DELIM[node.name]) return TEX_DELIM[node.name](args[0] ?? '');
      const head = TEX_FN[node.name] ?? `\\operatorname{${node.name}}`;
      if (args.length >= 2) return `${head}\\left(${args.join(', ')}\\right)`;
      return `${head}\\left(${args[0] ?? ''}\\right)`;
    }
    case 'bin': {
      if (node.op === '^') return `${texAtLeast(node.l, 3)}^{${astToTex(node.r)}}`;
      if (node.op === '/') return `\\frac{${astToTex(node.l)}}{${astToTex(node.r)}}`;
      if (node.op === '*') {
        return `${texAtLeast(node.l, 1)}\\cdot ${texAtLeast(node.r, 1)}`;
      }
      const sym = node.op === '+' ? ' + ' : ' - ';
      return `${texAtLeast(node.l, 0)}${sym}${texAtLeast(node.r, 1)}`;
    }
    default:
      return '';
  }
}

/** Igual que astToTex pero guaranteeing paréntesis si el hijo es más débil. */
function texAtLeast(node, minPrec) {
  const tex = astToTex(node);
  return texPrec(node) < minPrec ? `\\left(${tex}\\right)` : tex;
}

/** AST → LaTeX. */
export function astToTex(node) {
  return texInner(node);
}

/** Ecuación completa → LaTeX, incluyendo el lado izquierdo si lo hay. */
export function equationToTex(input) {
  const name = assignmentName(input);
  const body = astToTex(parseTokens(tokenize(stripAssignment(input)), stripAssignment(input)));
  return name ? `${name}(t) = ${body}` : body;
}

export default compileEquation;