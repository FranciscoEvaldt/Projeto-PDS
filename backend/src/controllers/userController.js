import User from '../models/User.js';

const userController = {
  // Listar todos os usuários
  async getAll(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  // Buscar usuário por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  },

  // Criar usuário (admin apenas)
  async create(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  // Atualizar usuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const user = await User.update(id, req.body);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  // Atualizar senha
  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ error: 'Nova senha é obrigatória' });
      }
      
      await User.updatePassword(id, newPassword);
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
  },

  // Deletar usuário
  async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await User.delete(id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json({ message: 'Usuário deletado com sucesso', user });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  },
};

export default userController;
