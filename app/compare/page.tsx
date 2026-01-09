'use client';

import React from 'react';
import { ComparisonView } from '@/components/ComparisonView';
import { INITIAL_MESHES, INITIAL_SUPPLIERS } from '@/lib/constants';

export default function ComparePage() {
  // Em uma aplicação real, os dados seriam buscados de uma API ou contexto
  // Aqui usamos os dados estáticos corrigidos
  
  return (
    <div className="container mx-auto p-6">
      <ComparisonView 
        allMeshes={INITIAL_MESHES}
        initialMeshes={INITIAL_MESHES} // Começa comparando todos os iniciais
        suppliers={INITIAL_SUPPLIERS}
      />
    </div>
  );
}