import { useChangePassword } from "../hooks/loginHook"
import { useNavigate, useSearchParams } from "react-router"
import "../styles/loginPage.css"
import z from "zod"
import {useForm} from "@tanstack/react-form"
import type { ChangePasswordDto } from "../types/types"
import toast from "react-hot-toast"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const UserSetup = () => {

    const [searchParams] = useSearchParams();
    const userEmail = searchParams.get("email");
    const resetToken = searchParams.get("token");
    const [seePassword, setSeePassword] = useState(false);
    const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);

    const resetPasswordSchema = z.object({
        email: z.email(),
        resetToken: z.string(),
        newPassword: z.string(),
        confirmNewPassword: z.string().min(4),
    })

    const form = useForm({
        defaultValues:{
            email: userEmail ?? "",
            resetToken: resetToken ?? "",
            newPassword:"",
            confirmNewPassword:""
        },
        validators: {
            onSubmit: resetPasswordSchema,
        },
        onSubmit:({value}) => handleSubmit(value)
    })

    const navigate = useNavigate();
    const resetPassword = useChangePassword();

    const handleSubmit = (payload : ChangePasswordDto) => {
        resetPassword.mutateAsync(payload);
    }

    if (resetPassword.isSuccess) {
        toast.success(`${resetPassword.data}\n Input password on login`);
        setTimeout(() => {
            navigate(`/login`);
        }, 2000);
    }

    if(resetPassword.isError){
        console.error(resetPassword.error);
    }

    return(
    <>
        <main className="login-page">
            <section className="login-card">
                <header className="login-header">
                   {/* <img src="logo.svg" alt="Company Logo" /> */} 
                    <p>Sign Up</p>
                </header>

                {resetPassword.isError && (
                    <div className="login-error">{`${resetPassword.error}`}</div>
                )}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}>
                    <div className="form-group">
                        <label>Your Email</label>
                        <form.Field name="email">
                            {(field) => 
                            <input value={field.state.value}
                                id="setup-email"
                                type="email"
                                disabled={true}
                            />}
                        </form.Field>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <form.Field name="newPassword">
                            {(field) => 
                                <div className="password-wrapper">
                                    <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                    id="newPassword"
                                    type={seePassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                />
                                <button onClick={() => setSeePassword(p => !p)}className="view-password-string">
                                    {seePassword ? <EyeOff size={18} color="#b5b7bb"/> : <Eye size={18} color="#b5b7bb"/>}
                                </button>
                            </div>                  
                            }
                        </form.Field>
                    </div>

                    <div className="form-group">
                        <label>Confirm password</label>
                        <form.Field name="confirmNewPassword">
                            {(field) => 

                            <div className="password-wrapper">
                                <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                id="confirmNewPassword"
                                type={seeConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                />
                                <button onClick={() => setSeeConfirmPassword(p => !p)}className="view-password-string">
                                    {seeConfirmPassword ? <EyeOff size={18} color="#b5b7bb"/> : <Eye size={18} color="#b5b7bb"/>}
                                </button>
                            </div>
                            } 
                        </form.Field>
                    </div>
                </form>
            </section>
        </main>
    </>
    )
}

export default UserSetup