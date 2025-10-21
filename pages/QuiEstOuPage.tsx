import React, { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../services/supabaseClient';
import { Employe, Chantier, Affectation } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { CheckIcon } from '../components/icons/CheckIcon';

const formatErrorMessage = (error: any, context: string): string => {
    let message = `Erreur lors de ${context} :\n${error.message}`;
    if (error.message.includes('violates row-level security policy')) {
        message += "\n\nCAUSE PROBABLE : Problème de permissions dans Supabase. Veuillez vérifier les politiques de sécurité (RLS) de la table concernée."
    }
    return message;
};

const QuiEstOuPage: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [affectations, setAffectations] = useState<Affectation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for editing chantier assignments
    const [editingChantierId, setEditingChantierId] = useState<string | null>(null);

    // Simple inline modal state
    const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);
    const [editingChantier, setEditingChantier] = useState<Chantier | null>(null);
    const [newEmployeName, setNewEmployeName] = useState('');
    const [newChantierName, setNewChantierName] = useState('');
    const [newChantierAddress, setNewChantierAddress] = useState('');


    const supabase = getSupabase();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                { data: employesData, error: employesError },
                { data: chantiersData, error: chantiersError },
                { data: affectationsData, error: affectationsError }
            ] = await Promise.all([
                supabase.from('employes').select('*').order('nom'),
                supabase.from('chantiers').select('*').order('nom'),
                supabase.from('affectations').select('*')
            ]);

            if (employesError || chantiersError || affectationsError) {
                throw new Error(employesError?.message || chantiersError?.message || affectationsError?.message);
            }

            setEmployes(employesData as Employe[]);
            setChantiers(chantiersData as Chantier[]);
            setAffectations(affectationsData as Affectation[]);
        } catch (err: any) {
            setError('Erreur lors du chargement des données.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- CRUD Employes ---
    const handleSaveEmploye = async (e: React.FormEvent) => {
        e.preventDefault();
        const nom = editingEmploye ? editingEmploye.nom : newEmployeName;
        if (!nom.trim()) return;

        const { error } = editingEmploye
            ? await supabase.from('employes').update({ nom }).eq('id', editingEmploye.id)
            : await supabase.from('employes').insert({ nom });
        
        if (error) alert(formatErrorMessage(error, "la sauvegarde de l'employé"));
        else {
            setEditingEmploye(null);
            setNewEmployeName('');
            fetchData();
        }
    };

    const handleDeleteEmploye = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
            const { error } = await supabase.from('employes').delete().eq('id', id);
            if (error) alert(formatErrorMessage(error, "la suppression de l'employé"));
            else fetchData();
        }
    };

    // --- CRUD Chantiers ---
     const handleSaveChantier = async (e: React.FormEvent) => {
        e.preventDefault();
        const nom = editingChantier ? editingChantier.nom : newChantierName;
        const adresse = editingChantier ? editingChantier.adresse : newChantierAddress;
        if (!nom.trim()) return;

        const { error } = editingChantier
            ? await supabase.from('chantiers').update({ nom, adresse }).eq('id', editingChantier.id)
            : await supabase.from('chantiers').insert({ nom, adresse });

        if (error) alert(formatErrorMessage(error, "la sauvegarde du chantier"));
        else {
            setEditingChantier(null);
            setNewChantierName('');
            setNewChantierAddress('');
            fetchData();
        }
    };

    const handleDeleteChantier = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chantier ?")) {
            const { error } = await supabase.from('chantiers').delete().eq('id', id);
            if (error) alert(formatErrorMessage(error, "la suppression du chantier"));
            else fetchData();
        }
    };

    // --- Affectations ---
    const handleAffectationChange = async (employeId: string, chantierId: string, isAffected: boolean) => {
        const originalAffectations = affectations;
        const newAffectations = isAffected
          ? [...affectations, { chantier_id: chantierId, employe_id: employeId }]
          : affectations.filter(a => !(a.chantier_id === chantierId && a.employe_id === employeId));
        setAffectations(newAffectations);

        if (isAffected) {
            const { error } = await supabase.from('affectations').insert({
                chantier_id: chantierId,
                employe_id: employeId
            });
            if (error) {
                setAffectations(originalAffectations);
                alert(formatErrorMessage(error, "l'ajout de l'affectation"));
            }
        } else {
            const { error } = await supabase.from('affectations').delete()
                .eq('chantier_id', chantierId)
                .eq('employe_id', employeId);
            if (error) {
                 setAffectations(originalAffectations);
                 alert(formatErrorMessage(error, "la suppression de l'affectation"));
            }
        }
    };

    if (loading) return <p className="text-center text-gray-400 mt-8">Chargement...</p>;
    if (error) return <p className="text-center text-red-400 mt-8">{error}</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* --- Gestion --- */}
            <div className="space-y-6">
                {/* Employes */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">Gestion des Employés</h2>
                    <form onSubmit={handleSaveEmploye} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder={editingEmploye ? "Modifier le nom" : "Ajouter un employé"}
                            value={editingEmploye ? editingEmploye.nom : newEmployeName}
                            onChange={(e) => editingEmploye ? setEditingEmploye({...editingEmploye, nom: e.target.value}) : setNewEmployeName(e.target.value)}
                            className="flex-grow bg-gray-900 border-gray-600 rounded-md"
                            required
                        />
                        <button type="submit" className="p-2 bg-cyan-600 text-black rounded-md"><PlusIcon className="w-5 h-5"/></button>
                         {editingEmploye && <button type="button" onClick={() => setEditingEmploye(null)} className="p-2 bg-gray-600 text-white rounded-md">Annuler</button>}
                    </form>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {employes.map(e => (
                            <li key={e.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                <span>{e.nom}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingEmploye(e)} className="text-gray-400 hover:text-cyan-400"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteEmploye(e.id)} className="text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Chantiers */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">Gestion des Chantiers</h2>
                    <form onSubmit={handleSaveChantier} className="space-y-2 mb-4">
                         <input type="text" placeholder="Nom du chantier" value={editingChantier ? editingChantier.nom : newChantierName} onChange={(e) => editingChantier ? setEditingChantier({...editingChantier, nom: e.target.value}) : setNewChantierName(e.target.value)} className="w-full bg-gray-900 border-gray-600 rounded-md" required />
                         <input type="text" placeholder="Adresse (optionnel)" value={editingChantier ? (editingChantier.adresse || '') : newChantierAddress} onChange={(e) => editingChantier ? setEditingChantier({...editingChantier, adresse: e.target.value}) : setNewChantierAddress(e.target.value)} className="w-full bg-gray-900 border-gray-600 rounded-md" />
                         <div className="flex gap-2">
                            <button type="submit" className="p-2 bg-cyan-600 text-black rounded-md w-full">{editingChantier ? 'Modifier' : 'Ajouter'}</button>
                            {editingChantier && <button type="button" onClick={() => setEditingChantier(null)} className="p-2 bg-gray-600 text-white rounded-md w-full">Annuler</button>}
                         </div>
                    </form>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {chantiers.map(c => (
                            <li key={c.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                <div>
                                    <p>{c.nom}</p>
                                    <p className="text-xs text-gray-400">{c.adresse}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingChantier(c)} className="text-gray-400 hover:text-cyan-400"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteChantier(c.id)} className="text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* --- Affectations --- */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Affectations par Chantier</h2>
                <div className="space-y-6 max-h-[calc(100vh-15rem)] overflow-y-auto pr-2">
                    {chantiers.length > 0 ? (
                        chantiers.map(chantier => {
                            const isEditing = editingChantierId === chantier.id;
                            const assignedEmployes = employes.filter(emp => 
                                affectations.some(a => a.chantier_id === chantier.id && a.employe_id === emp.id)
                            );

                            return (
                                <div key={chantier.id} className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-white">{chantier.nom}</h3>
                                        {isEditing ? (
                                            <button onClick={() => setEditingChantierId(null)} className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 px-2 py-1 rounded-md hover:bg-gray-700/50">
                                                <CheckIcon className="w-4 h-4"/> Terminé
                                            </button>
                                        ) : (
                                            <button onClick={() => setEditingChantierId(chantier.id)} className="p-2 text-gray-400 hover:text-cyan-400 rounded-full hover:bg-gray-700/50" title="Modifier les affectations">
                                                <PencilIcon className="w-4 h-4"/>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isEditing ? (
                                        <ul className="space-y-2">
                                            {employes.map(employe => {
                                                const isAffected = affectations.some(a => a.chantier_id === chantier.id && a.employe_id === employe.id);
                                                return (
                                                    <li key={`${chantier.id}-${employe.id}`} className="p-2 bg-gray-700/50 rounded-md">
                                                        <label className="flex items-center justify-between cursor-pointer">
                                                            <span>{employe.nom}</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={isAffected}
                                                                onChange={(e) => handleAffectationChange(employe.id, chantier.id, e.target.checked)}
                                                                className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                                            />
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <ul className="space-y-1 pl-2">
                                            {assignedEmployes.length > 0 ? (
                                                assignedEmployes.map(emp => (
                                                    <li key={emp.id} className="p-1 text-gray-300 list-disc list-inside">
                                                        {emp.nom}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-1 text-gray-500 italic">Aucun employé affecté</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400 text-center">Veuillez d'abord ajouter un chantier.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default QuiEstOuPage;