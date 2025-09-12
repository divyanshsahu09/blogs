// import { createContext, useContext, useState, useEffect } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     try {
//       // Check for stored authentication on mount
//       const storedUser = localStorage.getItem('user');
//       const storedToken = localStorage.getItem('authToken');
      
//       if (storedUser && storedToken) {
//         const parsedUser = JSON.parse(storedUser);
//         if (parsedUser) {
//           setUser(parsedUser);
//           setIsAuthenticated(true);
//         }
//       }
//     } catch (error) {
//       // If there's an error parsing the stored data, clear it
//       localStorage.removeItem('user');
//       localStorage.removeItem('authToken');
//       console.error('Error loading stored authentication:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = (userData, token) => {
//     localStorage.setItem('user', JSON.stringify(userData));
//     localStorage.setItem('authToken', token);
//     setUser(userData);
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('authToken');
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      console.error('Error loading stored authentication:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Corrected login (removes username)
  const login = (userData, token) => {
    const { username, ...userWithoutUsername } = userData; // strip username

    localStorage.setItem('user', JSON.stringify(userWithoutUsername));
    localStorage.setItem('authToken', token);

    setUser(userWithoutUsername);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
