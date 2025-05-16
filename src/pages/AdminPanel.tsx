// src/pages/AdminPanel.tsx
import { useState } from 'react';
import { FolderOpen, DollarSign, List, Users } from 'lucide-react';
import AddExpenseForm from '../components/Forms/AddExpenseForm';
import AddPaymentForm from '../components/Forms/AddPaymentForm';
import AddCategoryForm from '../components/Forms/AddCategoryForm';
import AddPersonForm from '../components/Forms/AddPersonForm';

const tabs = [
  { id: 'expenses', label: 'Gastos', icon: FolderOpen },
  { id: 'payments', label: 'Pagos', icon: DollarSign },
  { id: 'categories', label: 'Categorías', icon: List },
  { id: 'people', label: 'Personas', icon: Users }
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8 border-b border-secondary/30 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t font-semibold transition ${
              activeTab === id
                ? 'bg-primary text-white shadow'
                : 'bg-white text-primary border border-secondary hover:bg-secondary/10'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow border border-secondary/20">
        {activeTab === 'expenses' && (
          <>
            <h2 className="text-xl font-semibold text-primary mb-4">Registrar Gasto</h2>
            <AddExpenseForm />
          </>
        )}
        {activeTab === 'payments' && (
          <>
            <h2 className="text-xl font-semibold text-primary mb-4">Registrar Pago</h2>
            <AddPaymentForm />
          </>
        )}
        {activeTab === 'categories' && (
          <>
            <h2 className="text-xl font-semibold text-primary mb-4">Registrar Categoría</h2>
            <AddCategoryForm />
          </>
        )}
        {activeTab === 'people' && (
          <>
            <h2 className="text-xl font-semibold text-primary mb-4">Registrar Persona</h2>
            <AddPersonForm />
          </>
        )}
      </div>
    </div>
  );
}
