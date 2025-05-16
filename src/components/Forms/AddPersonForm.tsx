import { useForm } from 'react-hook-form';
import { db } from '../../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Person } from '../../types';

export default function AddPersonForm() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    const person: Omit<Person, 'id'> = {
      name: data.name,
      phone: data.phone
    };

    try {
      await addDoc(collection(db, 'people'), person);
      alert('Persona guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar la persona');
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
          <label className="block text-primary font-semibold mb-1">Teléfono</label>
          <input {...register('phone')} className="w-full border border-secondary focus:border-primary p-2 rounded shadow-sm transition" />
        </div>

        <button type="submit" className="bg-primary text-light px-4 py-2 rounded hover:bg-gold transition font-semibold shadow">
          Guardar persona
        </button>
      </form>
    </div>
  );
}