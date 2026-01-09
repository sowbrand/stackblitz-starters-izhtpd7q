
'use client';

import React from 'react';
import { ComparisonView } from '@/components/ComparisonView';
import { INITIAL_MESHES, INITIAL_SUPPLIERS } from '@/lib/constants';

export default function ComparePage() {
  // Em uma aplicação real, os dados seriam buscados de uma API.
  // Para a migração, usamos os dados estáticos.
  // A lógica de adicionar/remover malhas para comparação está dentro do componente ComparisonView.
  return (
    <ComparisonView 
      allMeshes={INITIAL_MESHES} 
      initialMeshes={[]} // Começa com o comparador vazio
      suppliers={INITIAL_SUPPLIERS} 
    />
  );
}
