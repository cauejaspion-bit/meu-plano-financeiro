@@ .. @@
   const loadUsers = () => {
-    // Carregar todos os usuários do localStorage
-    const allUsers: UserManagement[] = [];
-    
-    // Buscar por todas as chaves que começam com 'currentUser' ou dados de usuários
-    for (let i = 0; i < localStorage.length; i++) {
-      const key = localStorage.key(i);
-      if (key === 'currentUser') {
-        try {
-          const userData = JSON.parse(localStorage.getItem(key) || '{}');
-          if (userData.id) {
-            const userManagement = createUserManagement(userData);
-            allUsers.push(userManagement);
-          }
-        } catch (error) {
-          console.error('Erro ao carregar usuário:', error);
-        }
-      }
-    }
-
-    // Buscar usuários únicos baseado em dados financeiros
-    const uniqueUserIds = new Set<string>();
-    for (let i = 0; i < localStorage.length; i++) {
-      const key = localStorage.key(i);
-      if (key?.startsWith('financial_profile_')) {
-        const userId = key.replace('financial_profile_', '');
-        uniqueUserIds.add(userId);
-      }
-    }
-
-    // Adicionar usuários que só têm dados financeiros
-    uniqueUserIds.forEach(userId => {
-      if (!allUsers.find(u => u.id === userId)) {
-        const userManagement = createUserManagementFromId(userId);
-        if (userManagement) {
-          allUsers.push(userManagement);
-        }
-      }
-    });
+    // Carregar usuários do novo sistema
+    const registeredUsers = getRegisteredUsers();
+    const allUsers: UserManagement[] = registeredUsers.map(user => createUserManagement(user));

     setUsers(allUsers);
   };

+  const getRegisteredUsers = () => {
+    try {
+      const users = localStorage.getItem('users');
+      return users ? JSON.parse(users) : [];
+    } catch {
+      return [];
+    }
+  };
+
   const createUserManagement = (userData: any): UserManagement => {
     const userId = userData.id;
     
     // Buscar dados financeiros
     const financialProfile = getFinancialProfile(userId);
     const expenses = getExpenses(userId);
     const emergencyContributions = getEmergencyContributions(userId);
     
     const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.value, 0);
     const emergencyFundBalance = emergencyContributions.reduce((sum: number, contrib: any) => {
       return contrib.type === 'deposit' ? sum + contrib.amount : sum - contrib.amount;
     }, 0);

     return {
       id: userId,
       email: userData.email || 'N/A',
       name: userData.name || 'Usuário',
       isActive: getActiveStatus(userId),
-      createdAt: userData.createdAt || new Date().toISOString(),
+      createdAt: userData.createdAt || new Date().toISOString(),
       lastLogin: userData.lastLogin,
       financialProfile,
       totalExpenses,
       expenseCount: expenses.length,
       emergencyFundBalance,
     };
   };

-  const createUserManagementFromId = (userId: string): UserManagement | null => {
-    const financialProfile = getFinancialProfile(userId);
-    if (!financialProfile) return null;
-
-    const expenses = getExpenses(userId);
-    const emergencyContributions = getEmergencyContributions(userId);
-    
-    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.value, 0);
-    const emergencyFundBalance = emergencyContributions.reduce((sum: number, contrib: any) => {
-      return contrib.type === 'deposit' ? sum + contrib.amount : sum - contrib.amount;
-    }, 0);
-
-    return {
-      id: userId,
-      email: 'N/A',
-      name: `Usuário ${userId.slice(0, 8)}`,
-      isActive: getActiveStatus(userId),
-      createdAt: new Date().toISOString(),
-      financialProfile,
-      totalExpenses,
-      expenseCount: expenses.length,
-      emergencyFundBalance,
-    };
-  };
-
   const getFinancialProfile = (userId: string) => {
     try {
       const profile = localStorage.getItem(`financial_profile_${userId}`);
       return profile ? JSON.parse(profile) : null;
     } catch {
       return null;
     }
   };