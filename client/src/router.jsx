import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TeacherList from './pages/Teacher/TeacherList';

// Note: Additional pages would be imported here
// import TeacherDetail from './pages/Teacher/TeacherDetail';
// import TeacherProfile from './pages/Teacher/TeacherProfile';
// import StudentDashboard from './pages/Student/StudentDashboard';
// import MyBookings from './pages/Student/MyBookings';
// etc...

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
      // Protected student routes
      {
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: (
              <PrivateRoute requireRole="student">
                <div>Student Dashboard (To be implemented)</div>
              </PrivateRoute>
            )
          },
          {
            path: 'bookings',
            element: (
              <PrivateRoute requireRole="student">
                <div>My Bookings (To be implemented)</div>
              </PrivateRoute>
            )
          }
        ]
      },
      // Protected teacher routes
      {
        path: 'teacher',
        children: [
          {
            path: 'profile',
            element: (
              <PrivateRoute requireRole="teacher">
                <div>Teacher Profile Editor (To be implemented)</div>
              </PrivateRoute>
            )
          },
          {
            path: 'bookings',
            element: (
              <PrivateRoute requireRole="teacher">
                <div>Teacher Bookings Management (To be implemented)</div>
              </PrivateRoute>
            )
          }
        ]
      }
    ]
  }
]);
