import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateCurrentUser, UpdateUserData } from '../services/authApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Loader2, User as UserIcon, Mail, ArrowLeft } from 'lucide-react';

interface UserProfileProps {
  onBack?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verificar se há mudanças reais
    const hasNameChange = formData.name !== user?.name;
    const hasEmailChange = formData.email !== user?.email;
    const hasPasswordChange = newPassword.trim() !== '';

    if (!hasNameChange && !hasEmailChange && !hasPasswordChange) {
      setSuccess('Nenhuma alteração foi feita');
      return;
    }

    // Validar senha se foi preenchida
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
      if (newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateData: UpdateUserData = {};

      // Só inclui campos que mudaram
      if (hasNameChange) {
        updateData.name = formData.name;
      }
      if (hasEmailChange) {
        updateData.email = formData.email;
      }
      if (hasPasswordChange) {
        updateData.password = newPassword;
      }

      const updatedUser = await updateCurrentUser(updateData);
      updateUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header do perfil com botão de voltar */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        <div className="flex-1"></div>
      </div>

      {/* Header do perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulário de edição */}
      <Card>
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha (opcional)</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                
                {newPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Digite a nova senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};