import React, { useState, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, DollarSign, Search, Activity
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { MenuItemOptionsForm } from '../../components/forms/MenuItemOptionsForm';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { MenuItem, MenuItemOption } from '../../types';
import { useRestaurantData } from '../../hooks/useRestaurantData';
import { cn, formatPrice } from '../../lib/utils';
import { CategoryTabs, CategoryTabsCompact, AvailabilityTabs } from '../../components/menu';
import apiService from '../../services/api';

const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

const MenuPage: React.FC = () => {
  const { menuItems, loading, error, refetch } = useRestaurantData();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    options: [] as MenuItemOption[]
  });

  // Computed values
  const availableCategories = useMemo(() =>
    Array.from(new Set(menuItems.map(item => item.category))).sort(),
    [menuItems]
  );

  const categoryTabs = useMemo(() => [
    { key: 'all', label: 'Toutes', count: menuItems.length },
    ...availableCategories.map(category => ({
      key: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: menuItems.filter(item => item.category === category).length
    }))
  ], [menuItems, availableCategories]);

  const availabilityCounts = useMemo(() => ({
    all: menuItems.filter(item =>
      selectedCategory === 'all' || item.category === selectedCategory).length,
    available: menuItems.filter(item =>
      item.available && (selectedCategory === 'all' || item.category === selectedCategory)).length,
    unavailable: menuItems.filter(item =>
      !item.available && (selectedCategory === 'all' || item.category === selectedCategory)).length
  }), [menuItems, selectedCategory]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesAvailability = selectedAvailability === 'all' ||
                                 (selectedAvailability === 'available' && item.available) ||
                                 (selectedAvailability === 'unavailable' && !item.available);
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [menuItems, searchTerm, selectedCategory, selectedAvailability]);

  const groupedItems = useMemo(() => {
    return availableCategories.reduce((acc, category) => {
      acc[category] = filteredItems.filter(item => item.category === category);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredItems, availableCategories]);

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.available).length,
    categories: availableCategories.length
  };

  // Handlers
  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        available: item.available,
        options: item.options || []
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true,
        options: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanOptions = formData.options.map((option, index) => ({
        name: option.name,
        type: option.type,
        isRequired: option.isRequired || false,
        maxChoices: option.maxChoices !== undefined ? option.maxChoices : (option.type === 'CHOICE' ? 1 : 0),
        displayOrder: option.displayOrder !== undefined ? option.displayOrder : index,
        choices: option.choices.map((choice, choiceIndex) => ({
          name: choice.name,
          additionalPrice: choice.price || 0,
          displayOrder: choice.displayOrder !== undefined ? choice.displayOrder : choiceIndex,
          isAvailable: choice.isAvailable !== undefined ? choice.isAvailable : true
        }))
      }));

      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        restaurantId: RESTAURANT_ID,
        options: cleanOptions
      };

      if (editingItem) {
        await apiService.menuItems.update(editingItem.id, data);
        toast.success(`"${formData.name}" modifié avec succès !`, 'Modification sauvegardée');
      } else {
        await apiService.menuItems.create(data);
        toast.success(`"${formData.name}" ajouté avec succès !`, 'Nouveau plat créé');
        setShowModal(false);
        setEditingItem(null);
      }
      await refetch();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Erreur lors de la sauvegarde du plat', 'Erreur de sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const itemToDelete = menuItems.find(item => item.id === id);
      await apiService.menuItems.delete(id);
      await refetch();
      toast.success(`"${itemToDelete?.name || 'Plat'}" supprimé avec succès`, 'Suppression effectuée');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Erreur lors de la suppression du plat', 'Erreur de suppression');
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const currentItem = menuItems.find(item => item.id === id);
      if (!currentItem) return;

      const newAvailability = !currentItem.available;
      await apiService.menuItems.toggleAvailability(id, newAvailability);
      await refetch();
      toast.success(
        `"${currentItem.name}" ${newAvailability ? 'rendu disponible' : 'masqué'} avec succès`,
        'Disponibilité mise à jour'
      );
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      toast.error('Erreur lors de la modification de la disponibilité', 'Erreur de modification');
    }
  };

  const handleImageUpload = async (itemId: string, file: File) => {
    try {
      await apiService.menuItems.uploadImage(itemId, file);
      await refetch();
      const item = menuItems.find(item => item.id === itemId);
      toast.success(`Image uploadée pour "${item?.name || 'le plat'}"`, 'Image mise à jour');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image', 'Erreur d\'upload');
      throw error;
    }
  };

  const handleImageDelete = async (itemId: string) => {
    try {
      await apiService.menuItems.deleteImage(itemId);
      await refetch();
      const item = menuItems.find(item => item.id === itemId);
      toast.success(`Image supprimée pour "${item?.name || 'le plat'}"`, 'Image supprimée');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erreur lors de la suppression de l\'image', 'Erreur de suppression');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.toasts}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-secondary-700 hidden sm:inline">MENU</span>
              <span className="text-xs text-gray-500">
                {stats.total} plats - {stats.available} disponibles
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'bg-gray-50 placeholder-gray-400'
                  )}
                />
              </div>

              {/* Add Button */}
              <Button
                onClick={() => handleOpenModal()}
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-4">
            <AvailabilityTabs
              value={selectedAvailability}
              onChange={setSelectedAvailability}
              counts={availabilityCounts}
            />
          </div>

          {/* Category Tabs - Mobile */}
          <div className="sm:hidden">
            <CategoryTabsCompact
              tabs={categoryTabs}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          {/* Category Tabs - Desktop */}
          <div className="hidden sm:block">
            <CategoryTabs
              tabs={categoryTabs}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun plat trouvé' : 'Aucun plat'}
            </h4>
            <p className="text-gray-500">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par ajouter vos premiers plats'
              }
            </p>
          </div>
        )}

        {/* Grouped View (all categories) */}
        {selectedCategory === 'all' && filteredItems.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedItems)
              .filter(([_, items]) => items.length > 0)
              .map(([category, items]) => (
                <section key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900 capitalize">{category}</h2>
                      <Badge variant="secondary" size="sm">
                        {items.length} plat{items.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onEdit={() => handleOpenModal(item)}
                          onDelete={() => handleDelete(item.id)}
                          onToggleAvailability={() => toggleAvailability(item.id)}
                          onImageUpload={(file) => handleImageUpload(item.id, file)}
                          onImageDelete={() => handleImageDelete(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
          </div>
        )}

        {/* Filtered View (single category) */}
        {selectedCategory !== 'all' && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={() => handleOpenModal(item)}
                onDelete={() => handleDelete(item.id)}
                onToggleAvailability={() => toggleAvailability(item.id)}
                onImageUpload={(file) => handleImageUpload(item.id, file)}
                onImageDelete={() => handleImageDelete(item.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Modifier le plat' : 'Ajouter un plat'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du plat"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <Input
            label="Prix (€)"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
          <Input
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Disponible
            </label>
          </div>

          {/* Image Upload */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Image du plat
            </label>
            {editingItem ? (
              <ImageUpload
                currentImage={editingItem.imageUrl || undefined}
                onUpload={(file) => handleImageUpload(editingItem.id, file)}
                onDelete={editingItem.imageUrl ? () => handleImageDelete(editingItem.id) : undefined}
                compact={false}
              />
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                Vous pourrez ajouter une image après avoir créé le plat
              </div>
            )}
          </div>

          {/* Options */}
          <div className="border-t border-gray-200 pt-6">
            <MenuItemOptionsForm
              options={formData.options}
              onChange={(options) => setFormData({...formData, options})}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard: React.FC<{
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete: () => Promise<void>;
}> = ({ item, onEdit, onDelete, onToggleAvailability, onImageUpload, onImageDelete }) => {
  return (
    <Card
      hover
      className={cn(
        'transition-all duration-200',
        !item.available && 'opacity-75 bg-gray-50'
      )}
    >
      <div className="space-y-4">
        {/* Image */}
        <div className="relative">
          <ImageUpload
            currentImage={item.imageUrl || undefined}
            onUpload={onImageUpload}
            onDelete={item.imageUrl ? onImageDelete : undefined}
            compact={true}
            className="w-full"
          />
          <div className="absolute top-2 right-2 z-10">
            <Badge
              variant={item.available ? 'success' : 'danger'}
              size="sm"
            >
              {item.available ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <Badge variant="secondary" size="sm">
              {item.category}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-success-600" />
            <span className="text-xl font-bold text-success-600">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={onEdit}
            className="flex-1"
          >
            Modifier
          </Button>
          <Button
            size="sm"
            variant={item.available ? 'warning' : 'success'}
            icon={item.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onClick={onToggleAvailability}
            className="flex-1"
          >
            {item.available ? 'Masquer' : 'Afficher'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onDelete}
          />
        </div>
      </div>
    </Card>
  );
};

export default MenuPage;
