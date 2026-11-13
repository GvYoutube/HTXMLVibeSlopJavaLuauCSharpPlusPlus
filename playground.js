(function () {
  'use strict';

  const DEFAULT_PROGRAM = `<!doctype htxmlvsjlcspp>
<slop>
  <local name="name" type="String" value="world" />
  <local name="excitement" type="Integer" value="3" />

  <fn name="greet" params="person">
    <say>Well hello, {person}!</say>
    <repeat times="2">
      <say>Welcome to the tag maze, {person}. Round {i}.</say>
    </repeat>
  </fn>

  <say>The compiler has checked the vibes...</say>
  <call name="greet" args="name" />

  <if test="name == world">
    <say>Conclusion: syntax is a lifestyle.</say>
  </if>
</slop>`;

  const source = document.getElementById('source');
  const output = document.getElementById('output');
  if (!source || !output) return;

  source.value = DEFAULT_PROGRAM;

  function fail(message) {
    throw new Error(message);
  }

  function parseProgram(text) {
    const withoutDoctype = text.replace(/<!doctype\s+htxmlvsjlcspp\s*>/i, '');
    if (/<!doctype/i.test(withoutDoctype)) {
      fail('Either <!doctype htxmlvsjlcspp> is missing, or you are using the wrong doctype.');
    }

    const doc = new DOMParser().parseFromString(withoutDoctype, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      fail('Could not parse the tags.');
    }

    if (!doc.documentElement || doc.documentElement.tagName !== 'slop') {
      fail('You did not include a <slop> entry and </slop> closing tag.');
    }

    return doc.documentElement;
  }

  function children(element) {
    return Array.from(element.children);
  }

  function interpolate(text, scope) {
    return text.replace(/\{([A-Za-z_][\w]*)\}/g, function (_, key) {
      return scope.has(key) ? String(scope.get(key)) : '{' + key + '}';
    });
  }

  function expressionValue(raw, scope) {
    const value = raw.trim();

    if (/^(true|false)$/i.test(value)) {
      return value.toLowerCase() === 'true';
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    return scope.has(value) ? scope.get(value) : value;
  }

  function truthy(value) {
    return value !== false && value !== 0 && value !== '' && value != null;
  }

  function condition(test, scope) {
    const match = test.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);

    if (!match) return truthy(expressionValue(test, scope));

    const left = expressionValue(match[1], scope);
    const right = expressionValue(match[3], scope);

    switch (match[2]) {
      case '==': return String(left) === String(right);
      case '!=': return String(left) !== String(right);
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      default: return false;
    }
  }

  function run(root) {
    const lines = [];
    const functions = new Map();
    const globalScope = new Map();
    let steps = 0;

    function execute(nodes, scope, depth) {
      if (depth > 20) {
        fail('ERROR: function nesting is too deep.');
      }

      for (const node of nodes) {
        steps += 1;

        if (steps > 2000) {
          fail('ERROR: too many statements.');
        }

        const attrs = node.attributes;
        const get = (name, fallback) => attrs.getNamedItem(name)?.value ?? fallback;

        switch (node.tagName) {
          case 'local': {
            const name = get('name', '');
            if (!/^[A-Za-z_][\w]*$/.test(name)) {
              fail('<local> needs a valid name attribute.');
            }

            scope.set(name, get('value', node.textContent.trim()));
            break;
          }

          case 'say':
            lines.push(interpolate(node.textContent, scope));
            break;

          case 'fn': {
            const name = get('name', '');
            if (!/^[A-Za-z_][\w]*$/.test(name)) {
              fail('<fn> needs a valid name attribute.');
            }

            const paramsRaw = get('params', '');
            functions.set(name, {
              params: paramsRaw.split(/[\s,]+/).filter(Boolean),
              body: children(node)
            });
            break;
          }

          case 'call': {
            const name = get('name', '');
            const fn = functions.get(name);

            if (!fn) {
              fail('No function named "' + name + '".');
            }

            const argsRaw = get('args', '');
            const args = argsRaw
              .split(/[\s,]+/)
              .filter(Boolean)
              .map(arg => scope.has(arg) ? scope.get(arg) : expressionValue(arg, scope));

            const localScope = new Map(scope);
            fn.params.forEach((param, index) => {
              localScope.set(param, args[index] ?? 'undefined');
            });

            execute(fn.body, localScope, depth + 1);
            break;
          }

          case 'if':
            if (!attrs.getNamedItem('test')) {
              fail('<if> needs a test attribute.');
            }

            if (condition(get('test', ''), scope)) {
              execute(children(node), scope, depth + 1);
            }
            break;

          case 'repeat': {
            const times = Number(get('times', '0'));
            if (!Number.isInteger(times) || times < 0 || times > 50) {
              fail('<repeat times> must be a whole number from 0 to 50.');
            }

            for (let i = 1; i <= times; i += 1) {
              const loopScope = new Map(scope);
              loopScope.set('i', i);
              execute(children(node), loopScope, depth + 1);
            }

            break;
          }

          default:
            fail('Unknown tag <' + node.tagName + '>. The committee has not approved it.');
        }
      }
    }

    execute(children(root), globalScope, 0);
    return lines;
  }

  function showResult(lines) {
    output.replaceChildren();

    if (lines.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'placeholder';
      empty.textContent = 'Program ran successfully, but nothing was outputted.';
      output.appendChild(empty);
      return;
    }

    output.textContent = lines.join('\n');
  }

  function runProgram() {
    try {
      showResult(run(parseProgram(source.value)));
    } catch (error) {
      output.replaceChildren();

      const message = document.createElement('span');
      message.className = 'error';
      message.textContent =
        error instanceof Error
          ? '(real error) ERROR: ' + error.message
          : '(real error) ERROR: Something went wrong in the playground.js file, but it is unknown what happened...';

      output.appendChild(message);
    }
  }

  document.getElementById('run')?.addEventListener('click', runProgram);

  document.getElementById('reset')?.addEventListener('click', () => {
    source.value = DEFAULT_PROGRAM;
    showResult([]);

    const placeholder = document.createElement('span');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'The void awaits your program.';
    output.replaceChildren(placeholder);
  });

  document.getElementById('clear')?.addEventListener('click', () => {
    output.replaceChildren();

    const placeholder = document.createElement('span');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'The void awaits your program.';
    output.appendChild(placeholder);
  });

  source.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      runProgram();
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const start = source.selectionStart;
      const end = source.selectionEnd;
      source.setRangeText('  ', start, end, 'end');
    }
  });
}());
