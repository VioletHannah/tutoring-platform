import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TeacherList from './pages/Teacher/TeacherList';
import TeacherDetail from './pages/Teacher/TeacherDetail';
import TeacherProfile from './pages/Teacher/TeacherProfile';
import TeacherBookings from './pages/Teacher/TeacherBookings';
import StudentDashboard from './pages/Student/StudentDashboard';
import MyBookings from './pages/Student/MyBookings';
import ChatPage from './pages/Chat/ChatPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'teachers',
        element: <TeacherList />
      },
      {
        path: 'teachers/:userId',
        element: <TeacherDetail />
      },
      {
        path: 'chat',
        element: <ChatPage />
      },
      {
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: (
              <PrivateRoute requireRole="student">
                <StudentDashboard />
              </PrivateRoute>
            )
          },
          {
            path: 'bookings',
            element: (
              <PrivateRoute requireRole="student">
                <MyBookings />
              </PrivateRoute>
            )
          }
        ]
      },
      {
        path: 'teacher',
        children: [
          {
            path: 'profile',
            element: (
              <PrivateRoute requireRole="teacher">
                <TeacherProfile />
              </PrivateRoute>
            )
          },
          {
            path: 'bookings',
            element: (
              <PrivateRoute requireRole="teacher">
                <TeacherBookings />
              </PrivateRoute>
            )
          }
        ]
      }
    ]
  }
]);
