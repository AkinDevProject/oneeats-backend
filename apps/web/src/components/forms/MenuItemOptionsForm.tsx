import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MenuItemOption, MenuItemChoice } from '../../types';

interface MenuItemOptionsFormProps {
  options: MenuItemOption[];
  onChange: (options: MenuItemOption[]) => void;
}

export const MenuItemOptionsForm: React.FC<MenuItemOptionsFormProps> = ({ options, onChange }) => {
  const addOption = () => {
    const newOption: MenuItemOption = {
      id: Date.now().toString(),
      name: '',
      type: 'choice',
      isRequired: false,
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
    const updatedOptions = options.filter(option => option.id !== optionId);
    onChange(updatedOptions);
  };

  const addChoice = (optionId: string) => {
    const newChoice: MenuItemChoice = {
      id: Date.now().toString(),
      name: '',
      price: 0
    };
    
    const updatedOptions = options.map(option =>
      option.id === optionId
        ? { ...option, choices: [...option.choices, newChoice] }
        : option
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
        <h4 className="text-lg font-medium text-gray-900">Options du plat</h4>
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
            <div key={option.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">Option {optionIndex + 1}</h5>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => removeOption(option.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Supprimer
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="choice">🔘 Choix unique/multiple</option>
                    <option value="remove">➖ Retirer des ingrédients</option>
                    <option value="extra">➕ Suppléments payants</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {option.type === 'remove' && 'Les clients pourront retirer plusieurs ingrédients (prix généralement 0€)'}
                    {option.type === 'extra' && 'Les clients pourront ajouter plusieurs suppléments payants'}
                    {option.type === 'choice' && 'Choix unique (radio) ou multiple (checkbox) selon le max'}
                  </p>
                </div>
              </div>

              {option.type === 'choice' && (
                <div>
                  <Input
                    label="Nombre de choix maximum"
                    type="number"
                    min="1"
                    value={option.maxChoices || ''}
                    onChange={(e) => updateOption(option.id, 'maxChoices', parseInt(e.target.value) || undefined)}
                    placeholder="Laissez vide pour choix multiple illimité"
                  />
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h6 className="text-sm font-medium text-gray-900">
                    Choix disponibles {option.type === 'remove' ? '(à retirer)' : ''}
                  </h6>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-3 w-3" />}
                    onClick={() => addChoice(option.id)}
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
                      <div key={choice.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                        <span className="text-sm text-gray-500 w-6">
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