'use client';

import React from 'react';
import { Supplier } from '@/types';

interface SupplierBadgeProps {
  supplier?: Supplier;
  supplierId?: string;
  // Se não passar o objeto supplier, tentaremos achar pelo ID no contexto (opcional, aqui faremos direto via prop para performance)
}

export function SupplierBadge({ supplier }: SupplierBadgeProps) {
  if (!supplier) return null;

  return (
    <span 
      className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm"
      style={{ 
        backgroundColor: supplier.color, 
        color: '#FFFFFF', // Texto sempre branco para contraste nas cores escolhidas (quase todas escuras/vibrantes)
        textShadow: '0px 0px 2px rgba(0,0,0,0.3)' // Sombra sutil para garantir leitura em cores claras
      }}
    >
      {supplier.shortName || supplier.name.substring(0, 8)}
    </span>
  );
}