import React, { useState } from 'react';
import { Plus, X, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MenuItemOption, MenuItemChoice } from '../../types';

interface MenuItemOptionsFormProps {
  options: MenuItemOption[];
  onChange: (options: MenuItemOption[]) => void;
}

export const MenuItemOptionsForm: React.FC<MenuItemOptionsFormProps> = ({ options, onChange }) => {
  const [draggedOption, setDraggedOption] = useState<number | null>(null);
  const [draggedChoice, setDraggedChoice] = useState<{optionId: string, choiceIndex: number} | null>(null);

  // Fonction pour réorganiser les displayOrder séquentiellement
  const normalizeDisplayOrders = (opts: MenuItemOption[]) => {
    return opts.map((option, index) => ({
      ...option,
      displayOrder: index
    }));
  };

  // Gestion du drag and drop pour les options
  const handleOptionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedOption(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    // Ajouter un style visuel pendant le drag
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
    target.style.transform = 'rotate(2deg)';
  };

  const handleOptionDragEnd = (e: React.DragEvent) => {
    // Restaurer le style après le drag
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.style.transform = 'rotate(0deg)';
    setDraggedOption(null);
  };

  const handleOptionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Ajouter un effet visuel sur la zone de drop
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = '#3b82f6';
    target.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
  };

  const handleOptionDragLeave = (e: React.DragEvent) => {
    // Retirer l'effet visuel
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = '';
    target.style.backgroundColor = '';
  };

  const handleOptionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    // Retirer l'effet visuel
    const target = e.currentTarget as HTMLElement;
    target.style.borderColor = '';
    target.style.backgroundColor = '';

    if (draggedOption === null || draggedOption === dropIndex) return;

    const newOptions = [...options];
    const draggedItem = newOptions[draggedOption];
    newOptions.splice(draggedOption, 1);
    newOptions.splice(dropIndex, 0, draggedItem);

    const normalizedOptions = normalizeDisplayOrders(newOptions);
    onChange(normalizedOptions);
    setDraggedOption(null);
  };

  // Gestion du drag and drop pour les choix
  const handleChoiceDragStart = (e: React.DragEvent, optionId: string, choiceIndex: number) => {
    setDraggedChoice({optionId, choiceIndex});
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleChoiceDrop = (e: React.DragEvent, optionId: string, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedChoice || draggedChoice.optionId !== optionId || draggedChoice.choiceIndex === dropIndex) return;

    const updatedOptions = options.map(option => {
      if (option.id === optionId) {
        const newChoices = [...option.choices];
        const draggedItem = newChoices[draggedChoice.choiceIndex];
        newChoices.splice(draggedChoice.choiceIndex, 1);
        newChoices.splice(dropIndex, 0, draggedItem);

        const normalizedChoices = newChoices.map((choice, index) => ({
          ...choice,
          displayOrder: index
        }));

        return { ...option, choices: normalizedChoices };
      }
      return option;
    });
    onChange(updatedOptions);
    setDraggedChoice(null);
  };
  const addOption = () => {
    // Trouver le displayOrder le plus élevé et ajouter 1
    const maxDisplayOrder = options.length > 0
      ? Math.max(...options.map(opt => opt.displayOrder || 0))
      : -1;

    const newOption: MenuItemOption = {
      id: Date.now().toString(),
      name: '',
      type: 'CHOICE',
      isRequired: false,
      maxChoices: 1,
      displayOrder: maxDisplayOrder + 1,
      choices: []
    };
    onChange([...options, newOption]);
  };

  const updateOption = (optionId: string, field: keyof MenuItemOption, value: any) => {
    const updatedOptions = options.map(option =>
      option.id === optionId ? { ...option, [field]: value } : option
    );
    onChange(updatedOptions);
  };

  const removeOption = (optionId: string) => {
    const filteredOptions = options.filter(option => option.id !== optionId);
    // Réorganiser les displayOrder pour qu'ils soient séquentiels (0, 1, 2...)
    const normalizedOptions = normalizeDisplayOrders(filteredOptions);
    onChange(normalizedOptions);
  };

  const addChoice = (optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    const newChoice: MenuItemChoice = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      additionalPrice: 0,
      displayOrder: option?.choices.length || 0,
      isAvailable: true
    };

    const updatedOptions = options.map(opt =>
      opt.id === optionId
        ? { ...opt, choices: [...opt.choices, newChoice] }
        : opt
    );
    onChange(updatedOptions);
  };

  const updateChoice = (optionId: string, choiceId: string, field: keyof MenuItemChoice, value: any) => {
    const updatedOptions = options.map(option =>
      option.id === optionId
        ? {
            ...option,
            choices: option.choices.map(choice =>
              choice.id === choiceId ? { ...choice, [field]: value } : choice
            )
          }
        : option
    );
    onChange(updatedOptions);
  };

  const removeChoice = (optionId: string, choiceId: string) => {
    const updatedOptions = options.map(option =>
      option.id === optionId
        ? { ...option, choices: option.choices.filter(choice => choice.id !== choiceId) }
        : option
    );
    onChange(updatedOptions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-gray-900">Options du plat</h4>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <GripVertical className="inline h-4 w-4 mr-1 text-blue-500" />
            Cliquez et glissez la poignée <GripVertical className="inline h-3 w-3 mx-1" /> pour réorganiser
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={addOption}
        >
          Ajouter une option
        </Button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune option configurée</p>
          <p className="text-sm">Ajoutez des options pour permettre la personnalisation du plat</p>
        </div>
      ) : (
        <div className="space-y-6">
          {options.map((option, optionIndex) => (
            <div
              key={option.id}
              className="border border-gray-200 rounded-lg p-4 space-y-4 transition-all duration-200 cursor-move hover:border-blue-300 hover:shadow-md"
              draggable
              onDragStart={(e) => handleOptionDragStart(e, optionIndex)}
              onDragEnd={handleOptionDragEnd}
              onDragOver={handleOptionDragOver}
              onDragLeave={handleOptionDragLeave}
              onDrop={(e) => handleOptionDrop(e, optionIndex)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Poignée de drag - Zone principale pour initier le drag */}
                  <div
                    className="cursor-move text-gray-400 hover:text-gray-600 p-2 -ml-2 rounded hover:bg-gray-100"
                    title="Glissez pour réorganiser les options"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <h5 className="font-medium text-gray-900">Option {optionIndex + 1}</h5>
                  <span className="text-xs text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    #{option.displayOrder}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={(e) => {
                    e.stopPropagation(); // Empêcher le drag lors du clic sur supprimer
                    removeOption(option.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Supprimer cette option"
                >
                  Supprimer
                </Button>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onMouseDown={(e) => e.stopPropagation()} // Empêcher le drag sur les champs de saisie
              >
                <Input
                  label="Nom de l'option"
                  value={option.name}
                  onChange={(e) => updateOption(option.id, 'name', e.target.value)}
                  placeholder="ex: Choix de sauce, Ingrédients à retirer..."
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'option
                  </label>
                  <select
                    value={option.type}
                    onChange={(e) => updateOption(option.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CHOICE">🔘 Choix unique/multiple</option>
                    <option value="EXTRA">➕ Suppléments payants</option>
                    <option value="MODIFICATION">🔧 Modifications</option>
                    <option value="COOKING">🔥 Type de cuisson</option>
                    <option value="SAUCE">🥄 Sauces</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {option.type === 'CHOICE' && 'Choix unique (radio) ou multiple (checkbox) selon le nombre max'}
                    {option.type === 'EXTRA' && 'Les clients pourront ajouter plusieurs suppléments payants'}
                    {option.type === 'MODIFICATION' && 'Personnalisations et modifications du plat'}
                    {option.type === 'COOKING' && 'Choix du type de cuisson (rare, medium, well-done...)'}
                    {option.type === 'SAUCE' && 'Choix de sauces d\'accompagnement'}
                  </p>
                </div>
              </div>

              {(option.type === 'CHOICE' || option.type === 'EXTRA' || option.type === 'MODIFICATION') && (
                <div>
                  <Input
                    label="Nombre de choix maximum"
                    type="number"
                    min="0"
                    value={option.maxChoices !== undefined ? option.maxChoices.toString() : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateOption(option.id, 'maxChoices', val === '' ? undefined : parseInt(val) || 0);
                    }}
                    placeholder="0 = illimité, 1 = choix unique, 2+ = choix multiples limités"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {option.maxChoices === 0 && '✓ Choix multiples illimités'}
                    {option.maxChoices === 1 && '✓ Choix unique obligatoire (radio button)'}
                    {option.maxChoices && option.maxChoices > 1 && `✓ Maximum ${option.maxChoices} choix (checkbox)`}
                    {option.maxChoices === undefined && '⚠️ Veuillez définir le nombre maximum'}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`required-${option.id}`}
                  checked={option.isRequired || false}
                  onChange={(e) => updateOption(option.id, 'isRequired', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`required-${option.id}`} className="text-sm font-medium text-gray-700">
                  Option obligatoire
                </label>
              </div>

              <div
                className="space-y-4"
                onMouseDown={(e) => e.stopPropagation()} // Empêcher le drag sur la section des choix
              >
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-medium text-gray-900">
                    Choix disponibles
                    {option.type === 'MODIFICATION' && ' (à modifier)'}
                    {option.type === 'EXTRA' && ' (suppléments)'}
                    {option.type === 'COOKING' && ' (cuissons)'}
                    {option.type === 'SAUCE' && ' (sauces)'}
                  </h6>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      addChoice(option.id);
                    }}
                  >
                    Ajouter
                  </Button>
                </div>

                {option.choices.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Aucun choix configuré
                  </div>
                ) : (
                  <div className="space-y-2">
                    {option.choices.map((choice, choiceIndex) => (
                      <div
                        key={choice.id}
                        className={`flex items-center space-x-2 bg-gray-50 p-3 rounded-md transition-all duration-200 ${
                          draggedChoice?.optionId === option.id && draggedChoice?.choiceIndex === choiceIndex
                            ? 'opacity-50 scale-95'
                            : 'hover:bg-gray-100'
                        }`}
                        draggable
                        onDragStart={(e) => handleChoiceDragStart(e, option.id, choiceIndex)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => handleChoiceDrop(e, option.id, choiceIndex)}
                      >
                        {/* Poignée de drag pour les choix */}
                        <div className="cursor-move text-gray-300 hover:text-gray-500">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-gray-500 w-6 font-medium">
                          {choiceIndex + 1}.
                        </span>
                        <Input
                          value={choice.name}
                          onChange={(e) => updateChoice(option.id, choice.id, 'name', e.target.value)}
                          placeholder="Nom du choix"
                          className="flex-1"
                          required
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={choice.price}
                          onChange={(e) => updateChoice(option.id, choice.id, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24"
                        />
                        <span className="text-sm text-gray-500">€</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={<X className="h-4 w-4" />}
                          onClick={() => removeChoice(option.id, choice.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer ce choix"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};