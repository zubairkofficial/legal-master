import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Test from "./pages/test";
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

const router = createBrowserRouter([
    {
        path: "/test",
        element: <Test />
    },
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
            }
        ]
    },
    // User routes
 {

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
