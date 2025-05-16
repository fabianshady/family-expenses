import { useForm } from 'react-hook-form';
import { db } from '../../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Category } from '../../types/index';

export default function AddCategoryForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    const category: Omit<Category, 'id'> = {
      name: data.name,
      color: data.color
    };

    try {
      await addDoc(collection(db, 'categories'), category);
      alert('Categoría guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar la categoría');
    }
  };

  return (
    <div className="bg-light p-6 rounded-xl shadow-md border border-secondary/20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-primary font-semibold mb-1">Nombre</label>
          <input {...register('name')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-1">Color</label>
          <input type="color" {...register('color')} className="w-full border border-secondary p-2 rounded shadow-sm transition h-12" />
        </div>

        <button type="submit" className="bg-primary text-light px-4 py-2 rounded hover:bg-gold transition font-semibold shadow">
          Guardar categoría
        </button>
      </form>
    </div>
  );
}