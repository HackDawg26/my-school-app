import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // 1. Call your API here...
    const response = { id: '1', role: 'TEACHER' as const, email: 'test@school.com', token: 'abc' }; // Mock data
    
    // 2. Update the global state
    login(response);

    // 3. Redirect based on role
    if (response.role === 'TEACHER') navigate('/teacher/dashboard');
    else if (response.role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Login as Teacher</button>
    </div>
  );
};