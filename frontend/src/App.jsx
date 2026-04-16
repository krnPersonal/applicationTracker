import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ApplicationsList from "./pages/ApplicationsList.jsx";
import ApplicationForm from "./pages/ApplicationForm.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Playground from "./pages/Playground.jsx";
import Navbar from "./components/Navbar.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";

export default function App() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let pageTitle = "ApplicationTracker";

        if (path === "/") pageTitle = "ApplicationTracker | Job Search Command Center";
        else if (path === "/login") pageTitle = "Login | ApplicationTracker";
        else if (path === "/register") pageTitle = "Create Account | ApplicationTracker";
        else if (path === "/dashboard") pageTitle = "Dashboard | ApplicationTracker";
        else if (path === "/applications") pageTitle = "Applications | ApplicationTracker";
        else if (path === "/applications/new") pageTitle = "New Application | ApplicationTracker";
        else if (/^\/applications\/[^/]+$/.test(path)) pageTitle = "Application Details | ApplicationTracker";
        else if (path === "/profile") pageTitle = "Profile | ApplicationTracker";
        else if (path === "/playground") pageTitle = "Playground | ApplicationTracker";

        document.title = pageTitle;
    }, [location.pathname]);

    return (
        <ToastProvider>
            <Navbar/>
            <main className="main">
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                        <Dashboard/>
                    </ProtectedRoute>}/>
                    <Route path="/login" element={
                        <PublicOnlyRoute>
                            <Login/>
                        </PublicOnlyRoute>}/>
                    <Route path="/register" element={
                        <PublicOnlyRoute>
                            <Register/>
                        </PublicOnlyRoute>}/>
                    <Route
                        path="/applications"
                        element={
                            <ProtectedRoute>
                                <ApplicationsList/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/applications/new" element={
                        <ProtectedRoute>
                            <ApplicationForm/>
                        </ProtectedRoute>}/>
                    <Route path="/applications/:id" element={
                        <ProtectedRoute>
                            <ApplicationDetail/>
                        </ProtectedRoute>}/>
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile/>
                        </ProtectedRoute>}/>
                    <Route path="/playground" element={
                        <ProtectedRoute>
                            <Playground/>
                        </ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </main>
        </ToastProvider>

    );
}
