import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import LandingPage from "./pages/landing";
import AdminDashboard from "./pages/admin";
import ChatTable from "./pages/admin/chat/chatTable";
import { AdminLayout } from "./components/layout/AdminLayout";
import { UserLayout } from "./components/layout/UserLayout";
import UserTable from "./pages/admin/user/usertable";
import QuestionTable from "./pages/admin/question/questiontable";
import CategoryTable from "./pages/admin/category/categorytable";
import Chat from "./pages/user/chat/chat";
import Auth from "./components/auth";
import ProfileSettings from "./pages/profile/ProfileSettings";
import AdminSettings from "./pages/admin/settings";

import SubscriptionManagement from "./pages/admin/subscription";
import Products from "./pages/products";
import MockTrials from "./pages/user/trial/mockTrials";
import TrialAnalysis from "./pages/user/trial/trialAnalysis";
import TrialHistory from "./pages/user/trial/trialHistory";
import TrialsPage from "./pages/admin/trials";

const router = createBrowserRouter([
  
    {
        path: "/",
        element: <LandingPage />
    },
    {
        path: "/login",
        element: <SignIn />  // Redirect old login to new sign-in
    },
    {
        path: "/sign-in",
        element: <SignIn />
    },
    {
        path: "/sign-up",
        element: <SignUp />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/reset-password",
        element: <ResetPassword />
    },
    {
        path: "/products",
        element: <Auth isAuth={true}><Products /></Auth>
    },
    // Admin routes
    {
        path: "/admin",
        element: <><AdminLayout/></>,
        children: [
            {
                path: "chats",
                element: <ChatTable />
            },
            {
                path: "profile",
                element: <ProfileSettings />
            },
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            {
                path: "users",
                element: <UserTable />
            },
            {
                path: "questions",
                element: <QuestionTable />
            },
            {
                path: "categories",
                element: <CategoryTable />
            },
            {
                path: "settings",
                element: <AdminSettings />
            },
            {
                path: "subscriptions",
                element: <SubscriptionManagement />
            },
            {
                path: "trials",
                element: <TrialsPage />
            }
        ]
    },
    // User routes
    {
        path: "/chat",
        element: <Auth isAuth={true}><UserLayout/></Auth>,
        children: [
            {
                path: "new",
                element: <Chat />
            },
            {
                path: ":chatId",
                element: <Chat />
            },
            {
                path: "profile",
                element: <ProfileSettings />
            },
            {
                path: "products",
                element: <Products />
            }
        ]
    },
    {
        path: "/user",
        element: <Auth isAuth={true}><UserLayout/></Auth>,
        children: [
            {
                path: "trial",
                element: <MockTrials />
            },
            {
                path: "trial/analysis",
                element: <TrialAnalysis />
            },
            {
                path: "trial/history",
                element: <TrialHistory />
            }
        ]
    }
]);

const AppRouter = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default AppRouter;
