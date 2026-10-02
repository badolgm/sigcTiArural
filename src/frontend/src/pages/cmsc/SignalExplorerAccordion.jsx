import React from 'react';
import SignalExplorerCell from './SignalExplorerCell.jsx';

const SignalExplorerAccordion = (props) => (
  <details data-signal-explorer-accordion className="group rounded-xl border border-gray-800 bg-gray-900/30">
    <summary className="cursor-pointer select-none px-3 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-200 list-none [&::-webkit-details-marker]:hidden">
      <span className="text-gray-500 transition-transform group-open:rotate-90">▸</span>
      Explorador de señales
      <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-gray-500">
        catálogo S01..S80 · plegado
      </span>
    </summary>
    <div className="px-3 pb-3">
      <SignalExplorerCell {...props} />
    </div>
  </details>
);

export default SignalExplorerAccordion;
