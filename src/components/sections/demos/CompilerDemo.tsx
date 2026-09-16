'use client'

import { useState } from 'react'

// Real output from MiniLang's WebAssembly build for this program.
const SOURCE = `#include <iostream>
using namespace std;

int main() {
    int x = 5 + 10 * 2;
    cout << x << endl;
    return 0;
}`

const TOKENS = [
  ['KW_INT', 'int'],
  ['IDENTIFIER', 'x'],
  ['EQUAL', '='],
  ['INT_LITERAL', '5'],
  ['PLUS', '+'],
  ['INT_LITERAL', '10'],
  ['STAR', '*'],
  ['INT_LITERAL', '2'],
  ['SEMICOLON', ';'],
]

const AST_BEFORE = `VarDeclStmt  x : int
└── BinaryExpr  +
    ├── LiteralIntExpr  5
    └── BinaryExpr  *
        ├── LiteralIntExpr  10
        └── LiteralIntExpr  2`

const AST_AFTER = `VarDeclStmt  x : int
└── LiteralIntExpr  25`

const BYTECODE_UNOPTIMIZED = `0000  PUSH_INT      0 (5)
0003  PUSH_INT      1 (10)
0006  PUSH_INT      2 (2)
0009  MUL
0010  ADD
0011  LOAD_LOCAL    0 (x)
0014  WRITE
0015  PUSH_STRING   3 ("\\n")
0018  WRITE
0019  PUSH_INT      4 (0)
0022  RETURN`

const BYTECODE_FOLDED = `0000  PUSH_INT      0 (25)
0003  LOAD_LOCAL    0 (x)
0006  WRITE
0007  PUSH_STRING   1 ("\\n")
0010  WRITE
0011  PUSH_INT      2 (0)
0014  RETURN`

const TABS = ['Source', 'Tokens', 'AST', 'Bytecode', 'Output'] as const
type Tab = (typeof TABS)[number]

export default function CompilerDemo() {
  const [tab, setTab] = useState<Tab>('AST')
  const [optimized, setOptimized] = useState(true)

  return (
    <div className="demo">
      <div className="demo-head">
        <span>Inside the compiler</span>
        <span className="demo-note">one line, every stage</span>
      </div>

      <div className="tabs" role="tablist" aria-label="Compiler stages">
        {TABS.map((name) => (
          <button key={name} type="button" role="tab" aria-selected={tab === name} className="tab" onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>

      {(tab === 'AST' || tab === 'Bytecode') && (
        <label className="toggle">
          <input type="checkbox" checked={optimized} onChange={(e) => setOptimized(e.target.checked)} />
          <span className="toggle-track" aria-hidden="true" />
          Constant folding {optimized ? 'on' : 'off'}
        </label>
      )}

      <div className="code-panel" role="tabpanel">
        {tab === 'Source' && <pre>{SOURCE}</pre>}
        {tab === 'Tokens' && (
          <div className="flex flex-wrap gap-2 p-1">
            {TOKENS.map(([type, text], i) => (
              <span key={i} className="token">
                <span className="token-type">{type}</span>
                <span className="token-text">{text}</span>
              </span>
            ))}
          </div>
        )}
        {tab === 'AST' && <pre>{optimized ? AST_AFTER : AST_BEFORE}</pre>}
        {tab === 'Bytecode' && <pre>{optimized ? BYTECODE_FOLDED : BYTECODE_UNOPTIMIZED}</pre>}
        {tab === 'Output' && <pre>25</pre>}
      </div>

      <p className="demo-foot">
        {tab === 'Bytecode'
          ? optimized
            ? '5 + 10 * 2 is computed at compile time: 15 bytes of bytecode instead of 23.'
            : 'Without folding, the VM pushes three constants and multiplies and adds at runtime.'
          : tab === 'AST'
            ? 'The parser gives * higher precedence than +, so 10 * 2 becomes the inner node.'
            : tab === 'Tokens'
              ? 'The lexer turns the statement into typed tokens for the recursive-descent parser.'
              : 'Output of MiniLang’s WebAssembly build for this program.'}
      </p>
    </div>
  )
}
