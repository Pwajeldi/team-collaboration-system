import { useLogin } from "../hooks/loginHook"
import { Link, useNavigate } from "react-router"
import "../styles/loginPage.css"
import z from "zod"
import {useForm} from "@tanstack/react-form"
import type { loginPayload } from "../types/types"
import { useEffect } from "react"
import Loader from "../components/loader"

const LoginPage = () => {

    const loginSchema = z.object({
        email: z.email(),
        password: z.string().min(4),
    })

    const form = useForm({
        defaultValues:{
            email:"",
            password:""
        },
        validators: {
            onSubmit: loginSchema,
        },
        onSubmit:({value}) => handleSubmit(value)
    })

    const navigate = useNavigate();
    const login = useLogin();

    const handleSubmit = (payload : loginPayload) => {
        login.mutateAsync(payload);
    }

    useEffect(() => {
        if (login.isSuccess) {
            const { token, role, email: userEmail, fullName, department} = login.data;
            sessionStorage.setItem("accessToken", token);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("email", userEmail);
            sessionStorage.setItem("fullName", fullName);
            sessionStorage.setItem("department", department);
            const isAdmin = role === "admin";
            const isManager = role === "manager";
            navigate(isAdmin ? "/admindashboard" : isManager ? "/managerdashboard" : "/regulardashboard");
        }
    }, [login.isSuccess]);

    if(login.isError){
        console.error(login.error);
    }

    return(
    <>
        <main className="login-page">
            <section className="login-card">
                <header className="login-header">
                   {/* <img src="logo.svg" alt="Company Logo" /> */} 
                    <h2>Team Sync</h2>
                    <p>Sign in to continue</p>
                </header>

                {login.isError && (
                    <div className="login-error">Incorrect email or password. Please try again.</div>
                )}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}>
                    <div className="form-group">
                        <label>Email</label>
                        <form.Field name="email">
                            {(field) => 
                            <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                            />}
                        </form.Field>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <form.Field name="password">
                            {(field) => <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                id="password"
                                type="password"
                                placeholder="Password"
                            />} 
                        </form.Field>
                    </div>

                    <div className="forgot-password-container">
                        <Link className="forgot-password" to={`/forgotPassword`}>Forgot Password</Link>
                    </div>

                    <button className="login-btn" type="submit">
                        {login.isPending ? <div><Loader size="sm" fullHeight={false}/></div> : "Sign In"}
                    </button>
                </form>

                <footer className="login-footer">
                    <small>©2026</small>
                </footer>
            </section>
        </main>
    </>
    )
}

export default LoginPage