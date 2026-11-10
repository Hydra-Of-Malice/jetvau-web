import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseForm from './pages/CourseForm';
import Enquiries from './pages/Enquiries';
import Enrollments from './pages/Enrollments';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;
    return children;
}

export default function App() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <div className="flex min-h-screen">
                            <Sidebar />
                            <main className="flex-1 ml-64 p-8">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/courses" element={<Courses />} />
                                    <Route path="/courses/new" element={<CourseForm />} />
                                    <Route path="/courses/edit/:id" element={<CourseForm />} />
                                    <Route path="/enquiries" element={<Enquiries />} />
                                    <Route path="/enrollments" element={<Enrollments />} />
                                </Routes>
                            </main>
                        </div>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
