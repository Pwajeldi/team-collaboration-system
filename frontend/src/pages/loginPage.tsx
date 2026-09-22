import { useLogin } from "../hooks/loginHook"
import { Link, useNavigate } from "react-router"
import "../styles/loginPage.css"
import z from "zod"
import {useForm} from "@tanstack/react-form"
import type { loginPayload } from "../types/types"
import { useEffect, useState } from "react"
import Loader from "../components/loader"
import { Eye, EyeOff } from "lucide-react"

const LoginPage = () => {

    const [seePassword, setSeePassword] = useState(false);
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
            sessionStorage.setItem("roles", JSON.stringify(role));
            sessionStorage.setItem("email", userEmail);
            sessionStorage.setItem("fullName", fullName);
            sessionStorage.setItem("department", department);
            if(login.data.profilePictureUrl){
                sessionStorage.setItem("profilePictureUrl", login.data.profilePictureUrl);
            }  
            const roles: string[] = JSON.parse(sessionStorage.getItem("roles") ?? "");
            const isAdmin = roles.includes("admin");
            const isManager = roles.includes("manager");
            navigate(isAdmin ? "/admindashboard" : isManager ? "/managerdashboard" : "/regulardashboard");
        }
    }, [login.isSuccess]);

    return(
    <>
        <main className="login-page">
            <section className="login-card">
                <header className="login-header">
                    <h2>Team Sync</h2>
                    <p>Sign in to continue</p>
                </header>

                {login.isError && (
                    <div className="login-error">{login.error.message.slice(0,5)}</div>
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
                            {(field) => 
                            <div className="password-wrapper">
                                <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                id="password"
                                type={seePassword ? "text" : "password"}
                                placeholder="Password"
                                />
                                <button onClick={() => setSeePassword(p => !p)} type="button" className="view-password-string">
                                    {seePassword ? <EyeOff size={18} color="#b5b7bb"/> : <Eye size={18} color="#b5b7bb"/>}
                                </button>
                            </div>
                            } 
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