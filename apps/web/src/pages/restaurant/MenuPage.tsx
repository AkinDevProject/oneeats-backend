import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChefHat, Tag, DollarSign, Package, Filter, Search, ImageIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockMenuItems } from '../../data/mockData';
import { MenuItem } from '../../types';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  });

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.available).length,
    unavailable: menuItems.filter(item => !item.available).length,
    categories: categories.length - 1
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        available: item.available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        available: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              name: formData.name,
              description: formData.description,
              price: parseFloat(formData.price),
              category: formData.category,
              available: formData.available
            }
          : item
      ));
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
        restaurantId: '1'
      };
      setMenuItems(prev => [...prev, newItem]);
    }
    
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const groupedItems = categories.slice(1).reduce((acc, category) => {
    acc[category] = menuItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion du menu</h1>
          <p className="text-gray-600 text-sm sm:text-base flex items-center space-x-2">
            <ChefHat className="h-4 w-4" />
            <span>Créez et gérez votre carte</span>
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          className="shadow-lg hover:shadow-xl"
        >
          Ajouter un plat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-center mb-2">
            <Package className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-700">{stats.total}</div>
          <div className="text-xs text-primary-600">Total plats</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <div className="flex items-center justify-center mb-2">
            <Eye className="h-6 w-6 text-success-600" />
          </div>
          <div className="text-2xl font-bold text-success-700">{stats.available}</div>
          <div className="text-xs text-success-600">Disponibles</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <div className="flex items-center justify-center mb-2">
            <EyeOff className="h-6 w-6 text-danger-600" />
          </div>
          <div className="text-2xl font-bold text-danger-700">{stats.unavailable}</div>
          <div className="text-xs text-danger-600">Indisponibles</div>
        </Card>
        <Card hover className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div className="flex items-center justify-center mb-2">
            <Tag className="h-6 w-6 text-secondary-600" />
          </div>
          <div className="text-2xl font-bold text-secondary-700">{stats.categories}</div>
          <div className="text-xs text-secondary-600">Catégories</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card variant="glass" className="backdrop-blur-sm">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Rechercher un plat par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">Catégories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const count = category === 'all' ? stats.total : menuItems.filter(item => item.category === category).length;
                return (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'primary' : 'ghost'}
                    onClick={() => setSelectedCategory(category)}
                    className="relative"
                  >
                    {category === 'all' ? 'Toutes' : category}
                    <Badge 
                      size="sm" 
                      variant={selectedCategory === category ? 'secondary' : 'info'}
                      className="ml-1"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      {selectedCategory === 'all' ? (
        // Show grouped by category
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleOpenModal(item)}
                  onDelete={() => handleDelete(item.id)}
                  onToggleAvailability={() => toggleAvailability(item.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show filtered items
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={() => handleOpenModal(item)}
              onDelete={() => handleDelete(item.id)}
              onToggleAvailability={() => toggleAvailability(item.id)}
            />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <Card className="text-center py-16 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <ChefHat className="h-16 w-16 text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun plat trouvé' : 'Aucun plat dans cette catégorie'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche' 
                  : 'Commencez par ajouter vos premiers plats'
                }
              </p>
            </div>
            {searchTerm ? (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Effacer la recherche
              </Button>
            ) : (
              <Button 
                variant="primary" 
                icon={<Plus className="h-4 w-4" />}
                onClick={() => handleOpenModal()}
                className="mt-4"
              >
                Ajouter votre premier plat
              </Button>
            )}
          </div>
        </Card>
      )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Disponible
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
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

const MenuItemCard: React.FC<{
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}> = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  return (
    <Card 
      hover
      className={`transition-all duration-300 ${
        !item.available 
          ? 'opacity-75 border-gray-300 bg-gray-50' 
          : 'border-gray-200 hover:border-primary-200'
      }`}
    >
      <div className="space-y-4">
        {/* Image placeholder */}
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
          <div className="absolute top-2 right-2">
            <Badge 
              variant={item.available ? 'success' : 'danger'} 
              size="sm"
              className="shadow-sm"
            >
              {item.available ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 flex-1">{item.name}</h3>
            <Badge variant="secondary" size="sm" className="ml-2">
              {item.category}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-success-600" />
              <span className="text-xl font-bold text-success-600">
                {item.price.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t border-gray-100">
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
          >
            {item.available ? 'Masquer' : 'Afficher'}
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={onDelete}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MenuPage;