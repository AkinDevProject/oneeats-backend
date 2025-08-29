import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  RadioButton,
  Checkbox,
  Divider,
  Chip,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { MenuItem, MenuItemOption, MenuItemChoice, CartItemOption } from '../src/data/mockData';

interface MenuItemOptionsProps {
  item: MenuItem;
  selectedOptions: CartItemOption[];
  onOptionsChange: (options: CartItemOption[]) => void;
}

export const MenuItemOptions: React.FC<MenuItemOptionsProps> = ({
  item,
  selectedOptions,
  onOptionsChange,
}) => {
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    selectedOptions.forEach(option => {
      initial[option.optionId] = option.choices.map(c => c.choiceId);
    });
    return initial;
  });

  const handleChoiceToggle = (optionId: string, choiceId: string, option: MenuItemOption, choice: MenuItemChoice) => {
    const currentSelections = selections[optionId] || [];
    let newSelections: string[] = [];

    if (option.type === 'choice' && option.maxChoices === 1) {
      // Radio button behavior - only one selection
      newSelections = currentSelections.includes(choiceId) ? [] : [choiceId];
    } else {
      // Checkbox behavior - multiple selections allowed
      if (currentSelections.includes(choiceId)) {
        newSelections = currentSelections.filter(id => id !== choiceId);
      } else {
        newSelections = [...currentSelections, choiceId];
        
        // Respect maxChoices limit
        if (option.maxChoices && newSelections.length > option.maxChoices) {
          newSelections = newSelections.slice(-option.maxChoices);
        }
      }
    }

    // Update local state
    const newSelectionsState = {
      ...selections,
      [optionId]: newSelections,
    };
    setSelections(newSelectionsState);

    // Convert to CartItemOption format and notify parent
    const newCartOptions: CartItemOption[] = Object.entries(newSelectionsState)
      .filter(([_, choiceIds]) => choiceIds.length > 0)
      .map(([optionId, choiceIds]) => {
        const menuOption = item.options?.find(o => o.id === optionId);
        if (!menuOption) return null;

        return {
          optionId,
          optionName: menuOption.name,
          choices: choiceIds.map(choiceId => {
            const menuChoice = menuOption.choices.find(c => c.id === choiceId);
            return {
              choiceId,
              choiceName: menuChoice?.name || '',
              price: menuChoice?.price || 0,
            };
          }),
        };
      })
      .filter(Boolean) as CartItemOption[];

    onOptionsChange(newCartOptions);
  };

  const calculateExtraPrice = (): number => {
    let total = 0;
    selectedOptions.forEach(option => {
      option.choices.forEach(choice => {
        total += choice.price;
      });
    });
    return total;
  };

  const getOptionIcon = (type: MenuItemOption['type']) => {
    switch (type) {
      case 'remove':
        return 'remove-circle-outline';
      case 'choice':
        return 'radio-button-unchecked';
      case 'extra':
        return 'add-circle-outline';
      default:
        return 'help-outline';
    }
  };

  const getOptionColor = (type: MenuItemOption['type']) => {
    switch (type) {
      case 'remove':
        return '#ef4444';
      case 'choice':
        return '#667eea';
      case 'extra':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  if (!item.options || item.options.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons name="tune" size={20} color="#667eea" />
        <Text style={styles.headerTitle}>Options de personnalisation</Text>
        {calculateExtraPrice() > 0 && (
          <Chip mode="outlined" style={styles.extraPriceChip}>
            +{calculateExtraPrice().toFixed(2)}€
          </Chip>
        )}
      </View>

      {item.options.map((option, index) => (
        <View key={option.id} style={styles.optionSection}>
          <View style={styles.optionHeader}>
            <View style={styles.optionTitleRow}>
              <MaterialIcons
                name={getOptionIcon(option.type) as any}
                size={18}
                color={getOptionColor(option.type)}
              />
              <Text style={styles.optionTitle}>{option.name}</Text>
              {option.isRequired && (
                <Chip mode="flat" style={styles.requiredChip} textStyle={styles.requiredChipText}>
                  Obligatoire
                </Chip>
              )}
            </View>
            
            {option.type === 'choice' && option.maxChoices && option.maxChoices > 1 && (
              <Text style={styles.optionSubtitle}>
                Choisissez jusqu'à {option.maxChoices} option{option.maxChoices > 1 ? 's' : ''}
              </Text>
            )}
            {option.type === 'choice' && option.maxChoices === 1 && (
              <Text style={styles.optionSubtitle}>
                Choisissez une option
              </Text>
            )}
            {option.type === 'remove' && (
              <Text style={styles.optionSubtitle}>
                Sélectionnez les ingrédients à retirer
              </Text>
            )}
            {option.type === 'extra' && (
              <Text style={styles.optionSubtitle}>
                Ajoutez des suppléments (prix additionnels)
              </Text>
            )}
          </View>

          <View style={styles.choicesContainer}>
            {option.choices.map((choice) => {
              const isSelected = (selections[option.id] || []).includes(choice.id);
              const isSingleChoice = option.type === 'choice' && option.maxChoices === 1;

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceItem,
                    isSelected && styles.choiceItemSelected,
                  ]}
                  onPress={() => handleChoiceToggle(option.id, choice.id, option, choice)}
                >
                  <View style={styles.choiceContent}>
                    <View style={styles.choiceInfo}>
                      <Text style={[
                        styles.choiceName,
                        isSelected && styles.choiceNameSelected,
                      ]}>
                        {choice.name}
                      </Text>
                      {choice.price > 0 && (
                        <Text style={[
                          styles.choicePrice,
                          isSelected && styles.choicePriceSelected,
                        ]}>
                          +{choice.price.toFixed(2)}€
                        </Text>
                      )}
                    </View>
                    
                    {isSingleChoice ? (
                      <RadioButton
                        value={choice.id}
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => handleChoiceToggle(option.id, choice.id, option, choice)}
                        color="#667eea"
                      />
                    ) : (
                      <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => handleChoiceToggle(option.id, choice.id, option, choice)}
                        color="#667eea"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {index < item.options.length - 1 && (
            <Divider style={styles.optionDivider} />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  extraPriceChip: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  optionSection: {
    marginBottom: 24,
  },
  optionHeader: {
    marginBottom: 12,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  requiredChip: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    height: 24,
  },
  requiredChipText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 26,
    fontStyle: 'italic',
  },
  choicesContainer: {
    gap: 8,
  },
  choiceItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  choiceItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#667eea',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  choiceInfo: {
    flex: 1,
    marginRight: 12,
  },
  choiceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  choiceNameSelected: {
    color: '#1f2937',
    fontWeight: '600',
  },
  choicePrice: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  choicePriceSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  optionDivider: {
    marginTop: 16,
    backgroundColor: '#e5e7eb',
  },
});