import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "client" | "restaurateur" | "admin";
}

const initialUsers: User[] = [
  { id: "1", nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.com", role: "client" },
  { id: "2", nom: "Martin", prenom: "Marie", email: "marie.martin@email.com", role: "restaurateur" },
  { id: "3", nom: "Admin", prenom: "Principal", email: "admin@email.com", role: "admin" },
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [form, setForm] = useState<Omit<User, "id">>({ nom: "", prenom: "", email: "", role: "client" });

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestion des Utilisateurs</CardTitle>
        <p className="text-muted-foreground">Liste des utilisateurs inscrits sur la plateforme.</p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!form.nom || !form.prenom || !form.email) return;
            setUsers([
              ...users,
              { id: Date.now().toString(), ...form },
            ]);
            setForm({ nom: "", prenom: "", email: "", role: "client" });
          }}
          className="flex flex-col md:flex-row gap-2 mb-6"
        >
          <Input
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
            required
          />
          <Input
            name="prenom"
            placeholder="Prénom"
            value={form.prenom}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Select
            value={form.role}
            onValueChange={role => setForm({ ...form, role: role as User["role"] })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="restaurateur">Restaurateur</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Ajouter</Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.nom}</TableCell>
                <TableCell>{user.prenom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-center">
                  <Button variant="destructive" onClick={() => handleDelete(user.id)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
