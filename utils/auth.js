import { storage } from './storage';

const simpleHash = (password) => password.split('').reverse().join('') + '|h';

export const auth = {
  login: async (usernameOrEmail, password) => {
    const user = await storage.findUser(usernameOrEmail);
    if (!user) throw new Error('Usuário não encontrado');
    if (user.passwordHash !== simpleHash(password)) throw new Error('Senha incorreta');

    const session = { username: user.username, email: user.email };
    await storage.setSession(session);
    return session;
  },

  register: async ({ username, email, birthDate, password }) => {
    const existingUser = (await storage.findUser(username)) || (await storage.findUser(email));
    if (existingUser) throw new Error('Usuário ou e-mail já cadastrado');
    const user = {
      username, email, birthDate,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString()
    };
    await storage.addUser(user);
    return user;
  },

  resetPassword: async (usernameOrEmail, newPassword) => {
    const user = await storage.findUser(usernameOrEmail);
    if (!user) throw new Error('Usuário não encontrado');
    return storage.updateUser(user.username, { passwordHash: simpleHash(newPassword) });
  },

  logout: async () => storage.clearSession(),
  getCurrentUser: async () => storage.getSession(),
  isAuthenticated: async () => !!(await storage.getSession())
};
